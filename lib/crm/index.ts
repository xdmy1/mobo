import "server-only";

import type { CrmProvider, CrmResult, Lead } from "./types";
import { wordpressProvider } from "./providers/wordpress";
import { telegramProvider } from "./providers/telegram";
import { consoleProvider } from "./providers/console";

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

const PRIMARY: CrmProvider = process.env.WP_CRM_ENDPOINT ? wordpressProvider : consoleProvider;

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
