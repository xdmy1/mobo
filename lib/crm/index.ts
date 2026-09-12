import "server-only";

import type { CrmProvider, CrmResult, Lead } from "./types";
import { moboCrmProvider } from "./providers/mobo-crm";
import { telegramProvider } from "./providers/telegram";

export type { Lead, CrmResult, CrmProvider } from "./types";
export { leadSchema } from "./types";

/**
 * The single seam between the website and wherever leads actually go.
 *
 * `submitLead()` is the only thing any component or route ever calls. Changing
 * CRM — WordPress today, HubSpot or Pipedrive later — means editing the two
 * constants below and nothing else in the codebase.
 *
 * Two tiers, deliberately:
 *   PRIMARY   the system of record. If it fails, the submission failed.
 *   NOTIFIERS best-effort pings. A dead Telegram bot must never cost a lead.
 */

/* 2026-09-12: PRIMARY was Contact Form 7 on the WordPress site, selected via
   WP_CF7_ENDPOINT. That hosting is dead (509 Bandwidth Limit Exceeded) and the
   domain now points at this very deployment, so the env var selects a URL that
   no longer exists — leads go straight to MOBO's own CRM instead, on the same
   proven endpoint chain the calculator already uses. The cf7/wordpress
   providers remain in ./providers as dead code should WordPress ever return. */
const PRIMARY: CrmProvider = moboCrmProvider;

const NOTIFIERS: CrmProvider[] = process.env.TELEGRAM_BOT_TOKEN ? [telegramProvider] : [];

const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retry only what's worth retrying. A 422 will fail identically three times;
 * a 503 very often won't. Backoff is exponential with a little jitter so a
 * burst of submissions doesn't retry in lockstep.
 */
async function submitWithRetry(provider: CrmProvider, lead: Lead): Promise<CrmResult> {
  let last: CrmResult = {
    ok: false,
    provider: provider.name,
    error: "not attempted",
    retryable: false,
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    last = await provider.submit(lead);
    if (last.ok || !last.retryable) return last;

    if (attempt < MAX_ATTEMPTS) {
      await sleep(2 ** (attempt - 1) * 300 + Math.floor(Math.random() * 120));
    }
  }
  return last;
}

export async function submitLead(lead: Lead): Promise<CrmResult> {
  const primary = await submitWithRetry(PRIMARY, lead);

  /* Notifiers are fire-and-forget by design: awaited so serverless doesn't kill
     them mid-flight, but their failures never change the user-facing result. */
  await Promise.allSettled(
    NOTIFIERS.map(async (n) => {
      const r = await n.submit(lead);
      if (!r.ok) console.warn(`[MOBO lead] notifier ${n.name} failed: ${r.error}`);
    }),
  );

  return primary;
}
