import type { CrmProvider, CrmResult, Lead } from "../types";

/**
 * WordPress CRM provider.
 *
 * mobo.md already runs on WordPress, so the CRM most likely lives there too
 * (FluentCRM, Jetpack CRM, WP Fusion...). This posts a lead into a WP REST
 * endpoint using an Application Password over HTTPS.
 *
 * Credentials are read from the environment and this module is only ever
 * imported from server code, so nothing here reaches the browser bundle.
 *
 * To point at FluentCRM instead of a custom endpoint, change WP_CRM_ENDPOINT
 * to /wp-json/fluent-crm/v2/subscribers and adjust `body` below — the rest of
 * the app is unaffected.
 */

const ENDPOINT = process.env.WP_CRM_ENDPOINT;
const USER = process.env.WP_CRM_USER;
const APP_PASSWORD = process.env.WP_CRM_APP_PASSWORD;

/** Anything transient is worth retrying; a 4xx means the payload is wrong. */
function isRetryable(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

export const wordpressProvider: CrmProvider = {
  name: "wordpress",

  async submit(lead: Lead): Promise<CrmResult> {
    if (!ENDPOINT || !USER || !APP_PASSWORD) {
      return {
        ok: false,
        provider: "wordpress",
        error: "WordPress CRM is not configured (see .env.example).",
        retryable: false,
      };
    }

    const auth = Buffer.from(`${USER}:${APP_PASSWORD}`).toString("base64");

    /* Don't let a hung WP instance hold the user's request open. */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          full_name: lead.name,
          phone: lead.phone,
          email: lead.email || undefined,
          /* Custom fields — rename to match the CRM plugin's schema. */
          meta: {
            room: lead.room || undefined,
            budget: lead.budget || undefined,
            message: lead.message || undefined,
            source: lead.source,
            submitted_at: lead.submittedAt,
            consent_at: lead.consentAt,
          },
          status: "pending",
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        return {
          ok: false,
          provider: "wordpress",
          error: `WordPress responded ${res.status}`,
          retryable: isRetryable(res.status),
        };
      }

      const data = (await res.json().catch(() => null)) as { id?: string | number } | null;
      return { ok: true, provider: "wordpress", id: data?.id ? String(data.id) : undefined };
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      return {
        ok: false,
        provider: "wordpress",
        error: aborted ? "WordPress request timed out" : "WordPress request failed",
        retryable: true,
      };
    } finally {
      clearTimeout(timeout);
    }
  },
};
