import { z } from "zod";
import { ROOM_OPTIONS, BUDGET_OPTIONS } from "@/lib/data";

/**
 * One schema, used in three places: the client for inline validation, the
 * server route for trust-nothing re-validation, and the CRM providers for
 * their payload type. The client copy is a convenience; the server copy is
 * the one that actually matters.
 */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere.")
    .max(80, "Numele este prea lung."),

  /* Moldovan mobile numbers, tolerant of spaces, dashes and the +373 prefix. */
  phone: z
    .string()
    .trim()
    .min(6, "Introdu un număr de telefon valid.")
    .max(24, "Numărul de telefon este prea lung.")
    .regex(/^[+()\d][\d\s\-()]{5,23}$/, "Introdu un număr de telefon valid."),

  email: z
    .string()
    .trim()
    .email("Adresa de email nu pare validă.")
    .max(120)
    .optional()
    .or(z.literal("")),

  room: z.enum(ROOM_OPTIONS).optional().or(z.literal("")),
  budget: z.enum(BUDGET_OPTIONS).optional().or(z.literal("")),

  message: z.string().trim().max(2000, "Mesajul este prea lung.").optional().or(z.literal("")),

  /* GDPR: Moldova + EU clients. Consent is explicit and its moment is stored. */
  consent: z.literal(true, {
    errorMap: () => ({ message: "Este necesar acordul pentru a trimite cererea." }),
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
