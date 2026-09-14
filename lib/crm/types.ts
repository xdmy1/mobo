import { z } from "zod";
import { ROOM_IDS, LEGACY_ROOM_VALUES, BUDGET_OPTIONS } from "@/lib/data";

/**
 * One schema, used in three places: the client for inline validation, the
 * server route for trust-nothing re-validation, and the CRM providers for
 * their payload type. The client copy is a convenience; the server copy is
 * the one that actually matters.
 *
 * MESAJELE SUNT CHEI DE DICȚIONAR, NU TEXT. Schema rulează și pe server, unde
 * nu există context React și deci nici limba vizitatorului; dacă mesajele ar fi
 * fost în română, un vizitator rus ar fi primit „Numele este prea lung." înapoi
 * din /api/lead. Așa, ce circulă este `chrome.form.error.*`, iar LeadForm trece
 * cheia prin `t()` chiar înainte de a o afișa. Orice cheie nouă de aici trebuie
 * adăugată ÎN AMBELE chrome.ro.ts și chrome.ru.ts, altfel compilarea pică.
 */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "chrome.form.error.nameShort")
    .max(80, "chrome.form.error.nameLong"),

  /* Moldovan mobile numbers, tolerant of spaces, dashes and the +373 prefix. */
  phone: z
    .string()
    .trim()
    .min(6, "chrome.form.error.phoneInvalid")
    .max(24, "chrome.form.error.phoneLong")
    .regex(/^[+()\d][\d\s\-()]{5,23}$/, "chrome.form.error.phoneInvalid"),

  email: z
    .string()
    .trim()
    .email("chrome.form.error.emailInvalid")
    .max(120)
    .optional()
    .or(z.literal("")),

  /* ID-urile sunt ce trimite formularul de azi; etichetele românești sunt ce
     trimitea până la 2026-09-14 și încă pot veni dintr-un tab rămas deschis. */
  room: z
    .enum([...ROOM_IDS, ...LEGACY_ROOM_VALUES])
    .optional()
    .or(z.literal("")),
  budget: z.enum(BUDGET_OPTIONS).optional().or(z.literal("")),

  message: z
    .string()
    .trim()
    .max(2000, "chrome.form.error.messageLong")
    .optional()
    .or(z.literal("")),

  /* GDPR: Moldova + EU clients. Consent is explicit and its moment is stored. */
  consent: z.literal(true, {
    errorMap: () => ({ message: "chrome.form.error.consentRequired" }),
  }),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** What providers actually receive — the validated input plus server context. */
export type Lead = LeadInput & {
  source: string;
  submittedAt: string;
  consentAt: string;
  userAgent?: string;
};

export type CrmResult =
  | { ok: true; provider: string; id?: string }
  | { ok: false; provider: string; error: string; retryable: boolean };

/**
 * The whole point of this file. Every CRM destination implements this one
 * method. Swapping WordPress for HubSpot, or writing to both, changes
 * lib/crm/index.ts and nothing else — no component ever imports a provider.
 */
export interface CrmProvider {
  readonly name: string;
  submit(lead: Lead): Promise<CrmResult>;
}
