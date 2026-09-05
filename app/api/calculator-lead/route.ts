import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

/**
 * Lead-ul din calculator → CRM-ul MOBO (crm.mobo.md), cu configurația completă.
 *
 * Cerință de client (2026-09-05): „când trimit la final, datele pe CRM nu vin
 * cu specificația creată de client — vine doar numărul și numele". Vechiul
 * calculator crea în CRM un lanț contact → contact-room → opportunity → quote,
 * iar specificația trăia în descrierea quote-ului; noul calculator trimitea
 * lead-ul pe traseul CF7 (email), unde șablonul de mail nu afișează mesajul.
 *
 * Ruta replică EXACT lanțul vechiului calculator (decodat din bundle-ul lui):
 * aceleași endpoint-uri publice, aceleași id-uri de owner/stage/source, același
 * roomId și același format `_wizardQuote` în descrierea quote-ului — deci în
 * CRM lead-ul arată ca cele de până acum, doar că vine de pe mobo.md.
 * Diferența: apelurile pleacă de pe server (fără CORS), cu timeout per pas.
 */

const CRM_API = "https://crm.mobo.md/api";
const MIN_DWELL_MS = 2500;

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

const payloadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(24)
    .regex(/^[+()\d][\d\s\-()]{5,23}$/),
  consent: z.literal(true),
  rows: z
    .array(z.object({ label: z.string().max(60), value: z.string().max(400) }))
    .max(16),
  total: z.number().int().nonnegative().max(100_000_000),
  totalEur: z.number().int().nonnegative().max(10_000_000),
});

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
  const timeout = setTimeout(() => controller.abort(), 10_000);
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

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Prea multe cereri. Încearcă din nou peste câteva minute." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cerere invalidă." }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;

  /* Aceleași apărări tăcute ca /api/lead: honeypot + timp minim de completare. */
  if (typeof body._company === "string" && body._company.length > 0) {
    return NextResponse.json({ ok: true });
  }
  const startedAt = Number(body._startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_DWELL_MS) {
    return NextResponse.json({ ok: true });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Date incomplete." }, { status: 422 });
  }
  const { name, phone, rows, total } = parsed.data;

  /* Vechiul formular avea prenume + nume separate; al nostru un singur câmp. */
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(" ");

  try {
    const contact = await crmPost("/contact/public-lead", {
      firstName,
      lastName,
      phone: normalizePhone(phone),
      contactOwnerId: 1,
      contactStageId: 1,
      contactSourceId: 1,
    });
    const contactId = idFrom(contact, "contactId", "id");

    const room = await crmPost("/contact-room", { contactId, roomId: 50 });
    const contactRoomId = idFrom(room, "contactRoom", "id");

    const stamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const opportunity = await crmPost("/opportunity/public-create", {
      opportunityName: "Estimare din Calculator",
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

    await crmPost("/quote/public-create", {
      opportunityId,
      totalAmount: total,
      offerAmount: total,
      quoteProduct: [],
      description: JSON.stringify({
        _wizardQuote: true,
        config: Object.fromEntries(rows.map((row) => [row.label, row.value])),
        breakdown: [],
        totalPrice: total,
        priceBeforeDiscount: total,
        discount: 0,
      }),
      quoteName: `Estimare Tehnica — ${total.toLocaleString("ro-MD")} MDL`,
      quoteDate: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[MOBO calculator-lead] ${err instanceof Error ? err.message : err}`);
    return NextResponse.json(
      { ok: false, error: "Nu am putut trimite cererea. Sună-ne direct la +373 60 331 331." },
      { status: 502 },
    );
  }
}
