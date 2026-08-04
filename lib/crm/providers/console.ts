import type { CrmProvider, CrmResult, Lead } from "../types";

/**
 * Development / preview fallback.
 *
 * With no CRM configured the form still has to work end to end, otherwise the
 * preview can't be demoed. This writes the lead to the server log and always
 * succeeds — it exists so a missing env var never looks like a broken form.
 */
export const consoleProvider: CrmProvider = {
  name: "console",

  async submit(lead: Lead): Promise<CrmResult> {
    console.info(
      "[MOBO lead]",
      JSON.stringify(
        {
          ...lead,
          /* Never write full contact details to logs in production. */
          phone: process.env.NODE_ENV === "production" ? maskPhone(lead.phone) : lead.phone,
          email: process.env.NODE_ENV === "production" ? maskEmail(lead.email) : lead.email,
        },
        null,
        2,
      ),
    );
    return { ok: true, provider: "console" };
  },
};

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length <= 4 ? "****" : `${"*".repeat(digits.length - 4)}${digits.slice(-4)}`;
}

function maskEmail(email?: string) {
  if (!email) return email;
  const [user, domain] = email.split("@");
  if (!domain) return "****";
  return `${user.slice(0, 1)}***@${domain}`;
}
