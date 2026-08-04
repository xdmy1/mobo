import type { CrmProvider, CrmResult, Lead } from "../types";

/**
 * Telegram notification provider.
 *
 * MOBO already runs a Telegram presence (t.me/mobokitchens), so the sales team
 * is on Telegram all day. A lead that lands in the CRM but isn't seen for six
 * hours is a lead lost to whoever answered first — this pings the team the
 * moment a form is submitted.
 *
 * This is a *notification*, not a system of record. It runs alongside the real
 * CRM provider, never instead of it.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/** Telegram's MarkdownV2 reserves these; unescaped, they 400 the request. */
function escapeMd(s: string) {
  return s.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, (c) => `\\${c}`);
}

export const telegramProvider: CrmProvider = {
  name: "telegram",

  async submit(lead: Lead): Promise<CrmResult> {
    if (!TOKEN || !CHAT_ID) {
      return {
        ok: false,
        provider: "telegram",
        error: "Telegram is not configured (see .env.example).",
        retryable: false,
      };
    }

    const lines = [
      "*Cerere nouă de pe mobo\\.md*",
      "",
      `👤 ${escapeMd(lead.name)}`,
      `📞 ${escapeMd(lead.phone)}`,
      lead.email ? `✉️ ${escapeMd(lead.email)}` : null,
      lead.room ? `🏠 ${escapeMd(lead.room)}` : null,
      lead.budget ? `💰 ${escapeMd(lead.budget)}` : null,
      lead.message ? `\n_${escapeMd(lead.message)}_` : null,
    ].filter(Boolean);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: lines.join("\n"),
          parse_mode: "MarkdownV2",
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        return {
          ok: false,
          provider: "telegram",
          error: `Telegram responded ${res.status}`,
          retryable: res.status === 429 || res.status >= 500,
        };
      }
      return { ok: true, provider: "telegram" };
    } catch {
      return { ok: false, provider: "telegram", error: "Telegram request failed", retryable: true };
    } finally {
      clearTimeout(timeout);
    }
  },
};
