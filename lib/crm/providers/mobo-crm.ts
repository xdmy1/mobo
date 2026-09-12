import type { CrmProvider, CrmResult, Lead } from "../types";

/**
 * MOBO's own CRM (crm.mobo.md) — the system of record since 2026-09-12.
 *
 * The form used to post through Contact Form 7 on the WordPress site; that
 * hosting died (509 Bandwidth Limit Exceeded) the day mobo.md moved to
 * Vercel, and the CF7 endpoint is gone with it. The CRM was already receiving
 * calculator leads through /api/calculator-lead, so the homepage form now
 * lands in the same place, through the SAME public endpoint chain that route
 * replicated from the old calculator's bundle:
 *
 *   contact/public-lead → contact-room → opportunity/public-create
 *   [→ quote/public-create, only when the lead carries detail]
 *
 * Every id (owner 1, stage 1, source 1, roomId 50) and every field name is
 * kept identical to that proven chain — nothing here is guessed. The quote
 * step reuses the `_wizardQuote` description format so email / cameră /
 * buget / mesaj render as labelled rows in the CRM, exactly like a
 * calculator configuration does.
 */

const CRM_API = "https://crm.mobo.md/api";
const STEP_TIMEOUT_MS = 10_000;

/** Normalizarea de telefon a vechiului calculator, păstrată identic. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("373") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 9) return `+373${digits.slice(1)}`;
  if (digits.length === 8) return `+373${digits}`;
  return raw;
}

async function crmPost(path: string, body: unknown): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STEP_TIMEOUT_MS);
  try {
    const res = await fetch(`${CRM_API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`CRM ${path} responded ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

function idFrom(data: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const direct = data[key];
    if (typeof direct === "number") return direct;
    if (direct !== null && typeof direct === "object") {
      const nested = (direct as Record<string, unknown>).id;
      if (typeof nested === "number") return nested;
    }
  }
  throw new Error(`CRM response missing id (${keys.join("/")})`);
}

export const moboCrmProvider: CrmProvider = {
  name: "mobo-crm",

  async submit(lead: Lead): Promise<CrmResult> {
    /* Vechiul formular avea prenume + nume separate; al nostru un singur câmp. */
    const [firstName, ...rest] = lead.name.trim().split(/\s+/);
    const lastName = rest.join(" ");

    try {
      const contact = await crmPost("/contact/public-lead", {
        firstName,
        lastName,
        phone: normalizePhone(lead.phone),
        contactOwnerId: 1,
        contactStageId: 1,
        contactSourceId: 1,
      });
      const contactId = idFrom(contact, "contactId", "id");

      const room = await crmPost("/contact-room", { contactId, roomId: 50 });
      const contactRoomId = idFrom(room, "contactRoom", "id");

      const stamp = new Date().toISOString().slice(0, 19).replace("T", " ");
      const opportunity = await crmPost("/opportunity/public-create", {
        opportunityName: "Cerere de pe site",
        contactRoomId,
        opportunityOwnerId: 1,
        opportunityCreateDate: stamp,
        opportunityCloseDate: stamp,
        contactId,
        companyId: null,
        opportunityTypeId: null,
        opportunitySourceId: null,
      });
      const opportunityId = idFrom(opportunity, "opportunityId", "id");

      /* A bare name + phone is a complete lead, like a phone call. Anything
         beyond that gets a quote so the detail is visible in the CRM. */
      const detail: Record<string, string> = {};
      if (lead.email) detail["Email"] = lead.email;
      if (lead.room) detail["Cameră"] = lead.room;
      if (lead.budget) detail["Buget"] = lead.budget;
      if (lead.message) detail["Mesaj"] = lead.message;

      if (Object.keys(detail).length > 0) {
        detail["Sursă"] = lead.source;
        await crmPost("/quote/public-create", {
          opportunityId,
          totalAmount: 0,
          offerAmount: 0,
          quoteProduct: [],
          description: JSON.stringify({
            _wizardQuote: true,
            config: detail,
            breakdown: [],
            totalPrice: 0,
            priceBeforeDiscount: 0,
            discount: 0,
          }),
          quoteName: "Detalii cerere de pe site",
          quoteDate: new Date().toISOString(),
        });
      }

      return { ok: true, provider: this.name, id: String(opportunityId) };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      /* Timeouts and 5xx are worth retrying; a 4xx will fail identically. */
      const retryable = !/CRM .+ responded 4\d\d/.test(message);
      return { ok: false, provider: this.name, error: message, retryable };
    }
  },
};
