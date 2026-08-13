import type { CrmProvider, CrmResult, Lead } from "../types";

/**
 * Contact Form 7 provider — the live integration with the WordPress on mobo.md.
 *
 * Posts the same multipart body the site's own CF7 form (id 1716) would post,
 * so WordPress delivers the lead through the notification email already
 * configured there. The feedback endpoint is public by design — it is exactly
 * what the WP front-end form submits to — so no credentials are involved.
 */

const ENDPOINT = process.env.WP_CF7_ENDPOINT;
const FORM_ID = process.env.WP_CF7_FORM_ID;
const UNIT_TAG = process.env.WP_CF7_UNIT_TAG;
const CONTAINER = process.env.WP_CF7_CONTAINER;

/**
 * Form 1716 only defines `your-name` and `your-phone` (probed live: an empty
 * POST returns validation_failed for exactly those two). Everything else the
 * site form collects is folded into `your-message` — CF7 ignores fields the
 * form doesn't define, so this is harmless today and becomes visible the
 * moment a [your-message] field is added to the form and its mail template.
 */
function detailBlock(lead: Lead): string {
  const lines: string[] = [];
  if (lead.room) lines.push(`Încăpere: ${lead.room}`);
  if (lead.budget) lines.push(`Buget: ${lead.budget}`);
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.message) lines.push("", lead.message);
  lines.push("", `Sursă: ${lead.source} · trimis ${lead.submittedAt} · consimțământ ${lead.consentAt}`);
  return lines.join("\n").trim();
}

export const cf7Provider: CrmProvider = {
  name: "cf7",

  async submit(lead: Lead): Promise<CrmResult> {
    if (!ENDPOINT || !FORM_ID || !UNIT_TAG || !CONTAINER) {
      return {
        ok: false,
        provider: "cf7",
        error: "Contact Form 7 is not configured (see .env.example).",
        retryable: false,
      };
    }

    const fd = new FormData();
    fd.append("your-name", lead.name);
    fd.append("your-phone", lead.phone);
    fd.append("your-email", lead.email ?? "");
    fd.append("your-message", detailBlock(lead));
    /* The form's own honeypot — a legitimate submission leaves it empty. */
    fd.append("your-hp", "");
    fd.append("_wpcf7", FORM_ID);
    fd.append("_wpcf7_unit_tag", UNIT_TAG);
    fd.append("_wpcf7_container_post", CONTAINER);
    fd.append("_wpcf7_locale", "en_US");

    /* Don't let a hung WP instance hold the user's request open. */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: fd,
        signal: controller.signal,
        cache: "no-store",
      });

      /* CF7 answers 200 even when it rejects — the JSON `status` is the verdict. */
      const data = (await res.json().catch(() => null)) as {
        status?: string;
        message?: string;
      } | null;

      if (!res.ok || !data) {
        return {
          ok: false,
          provider: "cf7",
          error: `CF7 responded ${res.status}`,
          retryable: res.status === 408 || res.status === 429 || res.status >= 500,
        };
      }

      if (data.status !== "mail_sent") {
        return {
          ok: false,
          provider: "cf7",
          error: `CF7 status "${data.status}": ${data.message ?? "no message"}`,
          /* mail_failed = WP couldn't send email right now, worth retrying.
             validation_failed / spam = this payload will never pass. */
          retryable: data.status === "mail_failed",
        };
      }

      return { ok: true, provider: "cf7" };
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      return {
        ok: false,
        provider: "cf7",
        error: aborted ? "CF7 request timed out" : "CF7 request failed",
        retryable: true,
      };
    } finally {
      clearTimeout(timeout);
    }
  },
};
