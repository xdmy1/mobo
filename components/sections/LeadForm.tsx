"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ZodIssue } from "zod";
import { SocialGlyph } from "@/components/ui/BrandIcon";
import { Reveal } from "@/components/ui/Reveal";
import { leadSchema } from "@/lib/crm/types";
import { BUDGET_OPTIONS, ROOM_OPTIONS, SITE, SOCIALS } from "@/lib/data";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Lead capture — the commercial point of the page.
 *
 * Redus la cererea clientului: „numărul de telefon doar, un nume, buget, ce
 * mobilăm și gata — prea multe alungă clienții". Email-ul și textarea au
 * dispărut din UI (schema le păstrează opționale, deci serverul nu s-a mișcat),
 * iar promisiunea „proiect 3D înainte de orice decizie" a picat: proiectul 3D
 * se primește după contractare. Vizual, formularul a lăsat cardul cu chenar
 * pentru un registru editorial: inputuri pe linie de bază, opțiunile ca cipuri
 * radio, un singur buton mare.
 *
 * Validation runs through the *same* Zod schema the API route uses, so an error
 * the user sees inline is guaranteed to be the error the server would have
 * raised. The client pass exists only for speed of feedback; the server pass is
 * still the one that decides what reaches the CRM.
 */

type FieldName = "name" | "phone" | "room" | "budget" | "consent";
type Status = "idle" | "submitting" | "success" | "error";
type Errors = Partial<Record<FieldName, string>>;

type Values = {
  name: string;
  phone: string;
  room: string;
  budget: string;
  consent: boolean;
};

type LeadResponse = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<FieldName, string[]>>;
};

const EMPTY: Values = {
  name: "",
  phone: "",
  room: "",
  budget: "",
  consent: false,
};

/** Tab order — also the order errors are reported and focus is restored in. */
const FIELD_ORDER: FieldName[] = ["name", "phone", "room", "budget", "consent"];

/**
 * Mirrors MIN_DWELL_MS in app/api/lead/route.ts. The route silently drops any
 * submission faster than this as bot traffic. A human using browser autofill can
 * genuinely beat 2.5s, and a dropped lead is invisible to both sides — so we hold
 * the request back instead of letting a real customer disappear.
 */
const MIN_DWELL_MS = 2500;

/* No danger token exists in the palette (the system is lime + graphite + ivory),
   so the error colour is declared here: a warm coral that stays inside the warm
   family and clears 7:1 against ink-900. */
const ERROR_TEXT = "text-[#f0937a]";
const ERROR_BORDER = "border-[#f0937a]/55";

/**
 * `optional().or(literal(""))` wraps every optional rule in a ZodUnion, and a
 * union reports its own untranslated "Invalid input" rather than the branch
 * message. Reach through to the branch so the user gets the Romanian text the
 * schema actually author'd.
 */
function messageFor(issue: ZodIssue): string {
  if (issue.code === "invalid_union") {
    const nested = issue.unionErrors[0]?.issues[0];
    if (nested) return messageFor(nested);
  }
  return issue.message;
}

function isFieldName(value: unknown): value is FieldName {
  return typeof value === "string" && (FIELD_ORDER as string[]).includes(value);
}

function validate(values: Values): Errors {
  const parsed = leadSchema.safeParse(values);
  if (parsed.success) return {};

  const out: Errors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (isFieldName(key) && out[key] === undefined) out[key] = messageFor(issue);
  }
  return out;
}

async function readJson(res: Response): Promise<LeadResponse> {
  try {
    return (await res.json()) as LeadResponse;
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ shell -- */

/* Input pe linie de bază: fără cutie, doar hairline-ul de jos — aceeași
   gramatică cu listele de contacte de alături. Focusul îngroașă linia în lime
   printr-un inset shadow (nu prin border-width, care ar sălta layout-ul).
   16px+ pe control — anything smaller makes iOS Safari zoom the viewport. */
const CONTROL = cn(
  "h-12 w-full rounded-none border-0 border-b bg-transparent px-0 text-[1.0625rem] text-fg",
  "placeholder:text-fg-faint",
  "focus:outline-none focus:border-lime-brand focus:shadow-[inset_0_-1px_0_0_var(--color-lime-brand)]",
  "transition-[border-color,box-shadow] duration-150 ease-out-strong",
);

const FIELD_LABEL = "block text-[0.6875rem] font-medium uppercase tracking-[0.075em] text-fg-faint";

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className={cn("mt-1.5 text-[0.8125rem]", ERROR_TEXT)}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Opțiunile ca cipuri — radiouri reale (sr-only) sub pastile stilizate, deci
 * tastatura primește gratis comportamentul nativ: un singur tab stop, săgeți
 * între opțiuni. Starea aleasă e ivorie pe grafit — lime rămâne rezervat
 * singurului buton primar din viewport.
 */
function ChipGroup({
  id,
  name,
  legend,
  options,
  value,
  onChange,
  error,
  className,
}: {
  id: string;
  name: string;
  legend: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  error?: string;
  className?: string;
}) {
  return (
    <fieldset id={id} tabIndex={-1} className={cn("min-w-0 outline-none", className)}>
      <legend className={FIELD_LABEL}>{legend}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="relative">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "inline-flex h-9 cursor-pointer select-none items-center rounded-pill border px-4 text-[0.875rem]",
                "text-fg-dim transition-[background-color,border-color,color] duration-150 ease-out-strong",
                "hover-fine:hover:text-fg",
                "peer-checked:border-bone-50 peer-checked:bg-bone-50 peer-checked:font-medium peer-checked:text-fg-invert",
                "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime-brand",
                error ? ERROR_BORDER : "border-white/15 hover-fine:hover:border-white/35",
              )}
            >
              {option}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className={cn("mt-1.5 text-[0.8125rem]", ERROR_TEXT)}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/* ------------------------------------------------------------- component -- */

export default function LeadForm() {
  const uid = useId();
  const reduce = useReducedMotion();

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const fid = useCallback((name: string) => `${uid}-${name}`, [uid]);

  const setField = useCallback(<K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    /* Only ever *clears* while typing. Re-raising a message mid-word punishes
       someone who is halfway through fixing it. */
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const handleBlur = useCallback(
    (key: FieldName) => {
      /* Tabbing past an untouched field is not a mistake yet — only an attempted
         submit turns an empty required field into an error. */
      if (!attempted && !values[key]) return;
      const all = validate(values);
      setErrors((prev) => ({ ...prev, [key]: all[key] }));
    },
    [attempted, values],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setAttempted(true);
    const found = validate(values);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus("error");
      setFormError("Verifică câmpurile marcate mai jos.");
      const first = FIELD_ORDER.find((name) => found[name]);
      if (first) document.getElementById(fid(first))?.focus();
      return;
    }

    setErrors({});
    setFormError(null);
    setStatus("submitting");

    const elapsed = Date.now() - startedAt.current;
    if (elapsed < MIN_DWELL_MS) {
      await new Promise((resolve) => setTimeout(resolve, MIN_DWELL_MS - elapsed));
    }

    let res: Response;
    try {
      res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          _company: honeypot.current?.value ?? "",
          _startedAt: startedAt.current,
        }),
      });
    } catch {
      setStatus("error");
      setFormError(
        `Conexiunea a eșuat. Verifică internetul și încearcă din nou, sau sună-ne la ${SITE.phone}.`,
      );
      return;
    }

    if (res.ok) {
      setStatus("success");
      setFormError(null);
      return;
    }

    const data = await readJson(res);

    if (res.status === 422) {
      const mapped: Errors = {};
      for (const name of FIELD_ORDER) {
        const message = data.fieldErrors?.[name]?.[0];
        if (message) mapped[name] = message;
      }
      setErrors(mapped);
      setStatus("error");
      setFormError("Câteva câmpuri trebuie corectate.");
      const first = FIELD_ORDER.find((name) => mapped[name]);
      if (first) document.getElementById(fid(first))?.focus();
      return;
    }

    setStatus("error");
    setFormError(
      data.error ??
        (res.status === 429
          ? "Ai trimis prea multe cereri. Încearcă din nou peste câteva minute."
          : `Nu am putut trimite cererea. Sună-ne direct la ${SITE.phone}.`),
    );
  }

  const busy = status === "submitting";

  /* Panel swap: opacity + a short vertical travel, nothing else. */
  const swap = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  const enter = { duration: DUR.panel, ease: EASE_OUT };
  const leave = { duration: DUR.micro, ease: EASE_OUT };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="grain relative overflow-hidden bg-ink-900 py-20 sm:py-24 lg:py-28"
    >
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-0">
          {/* ------------------------------------------------------ pitch -- */}
          <div className="lg:col-span-5">
            <Reveal>
              {/* Fără „proiect 3D înainte de orice decizie" — clarificare de
                  client: 3D-ul se primește după contractare. */}
              <h2 id="contact-title" className="text-h2 text-balance text-fg">
                Spune-ne ce vrei să mobilezi și primești un calcul estimativ, fără obligații.
              </h2>
            </Reveal>

            <Reveal index={1}>
              <p className="text-body text-pretty mt-5 max-w-[46ch] text-fg-dim">
                Patru câmpuri, jumătate de minut. Un consultant MOBO te sună în aceeași zi
                lucrătoare, ca să discutați proiectul și să programați măsurătorile.
              </p>
            </Reveal>

            {/* ------------------------------------------------- contacte -- */}
            <Reveal index={2}>
              <ul className="mt-10 list-none border-t border-white/8">
                <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/8 py-3.5">
                  <span className="text-[0.8125rem] text-fg-faint">Telefon</span>
                  <a
                    href={SITE.phoneHref}
                    className="text-[1.0625rem] font-medium text-fg transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-brand"
                  >
                    {SITE.phone}
                  </a>
                </li>
                <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/8 py-3.5">
                  <span className="text-[0.8125rem] text-fg-faint">Email</span>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-[0.9375rem] text-fg transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-brand"
                  >
                    {SITE.email}
                  </a>
                </li>
                <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/8 py-3.5">
                  {/* Doar „Showroom" — atelierul e în altă parte și adresa lui
                      nu privește vizitatorul (cerință de client). */}
                  <span className="text-[0.8125rem] text-fg-faint">Showroom</span>
                  <span className="text-right text-[0.9375rem] text-fg-dim">{SITE.address}</span>
                </li>
              </ul>
            </Reveal>

            {/* -------------------------------------------------- socials -- */}
            <Reveal index={3}>
              <p className="mt-6 text-[0.8125rem] text-fg-faint">Scrie-ne pe</p>
              <ul className="mt-2 flex list-none flex-wrap gap-x-5 gap-y-2">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-fg-dim transition-colors duration-200 ease-out-strong hover-fine:hover:text-fg"
                    >
                      <SocialGlyph label={social.label} className="size-3.5" />
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* ------------------------------------------------------- form -- */}
          {/* Vizual nou (cerință de client): a dispărut cardul cu chenar —
              formularul stă direct pe bandă, despărțit de pitch printr-un
              hairline vertical, cu inputuri pe linie de bază și cipuri. */}
          <Reveal
            index={1}
            className="lg:col-span-6 lg:col-start-7 lg:border-l lg:border-white/10 lg:pl-12"
          >
            {/* Persistent live region. It must exist BEFORE the success text
                does — a live region inserted in the same commit as its content
                is never announced by screen readers. */}
            <div aria-live="polite" role="status" className="sr-only">
              {status === "success"
                ? "Am primit cererea ta. Te contactăm în aceeași zi lucrătoare."
                : null}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={swap.initial}
                  animate={{ ...swap.animate, transition: enter }}
                  exit={{ ...swap.exit, transition: leave }}
                  className="py-2"
                >
                  <h3 className="text-h3 text-fg">Am primit cererea ta.</h3>
                  <p className="text-body text-pretty mt-3 max-w-[42ch] text-fg-dim">
                    Te contactăm la <span className="text-fg">{values.phone}</span> în aceeași zi
                    lucrătoare, ca să stabilim consultația și măsurătorile.
                  </p>

                  <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[0.9375rem]">
                    <a
                      href={SITE.calculator}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg underline decoration-white/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:decoration-lime-brand"
                    >
                      Între timp, calculator online
                    </a>
                    <a
                      href={SITE.phoneHref}
                      className="text-fg-dim transition-colors duration-200 ease-out-strong hover-fine:hover:text-fg"
                    >
                      {SITE.phone}
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={handleSubmit}
                  aria-labelledby="contact-title"
                  initial={swap.initial}
                  animate={{ ...swap.animate, transition: enter }}
                  exit={{ ...swap.exit, transition: leave }}
                  className="relative"
                >
                  {/* Honeypot. Off-screen rather than display:none — a bot that
                      respects display:none would skip it and pass the check. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
                  >
                    {/* Deliberately not labelled "Companie" — Chrome ignores
                        autocomplete="off" on fields it recognises, and an
                        autofilled honeypot would reject a real customer. */}
                    <label htmlFor={fid("company")}>Lasă acest câmp gol</label>
                    <input
                      ref={honeypot}
                      id={fid("company")}
                      name="_company"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      defaultValue=""
                    />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-8">
                    <Field id={fid("name")} label="Nume" error={errors.name}>
                      <input
                        id={fid("name")}
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        maxLength={80}
                        placeholder="Numele tău"
                        value={values.name}
                        onChange={(e) => setField("name", e.target.value)}
                        onBlur={() => handleBlur("name")}
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={errors.name ? `${fid("name")}-error` : undefined}
                        className={cn(CONTROL, errors.name ? ERROR_BORDER : "border-white/15")}
                      />
                    </Field>

                    <Field id={fid("phone")} label="Telefon" error={errors.phone}>
                      <input
                        id={fid("phone")}
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        required
                        autoComplete="tel"
                        maxLength={24}
                        placeholder="+373 60 000 000"
                        value={values.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        aria-invalid={errors.phone ? true : undefined}
                        aria-describedby={errors.phone ? `${fid("phone")}-error` : undefined}
                        className={cn(CONTROL, errors.phone ? ERROR_BORDER : "border-white/15")}
                      />
                    </Field>

                    {/* Cipurile au nevoie de rândul întreg — șapte opțiuni nu
                        încap într-o jumătate de coloană. */}
                    <ChipGroup
                      id={fid("room")}
                      name="room"
                      legend="Ce mobilăm?"
                      options={ROOM_OPTIONS}
                      value={values.room}
                      onChange={(room) => setField("room", room)}
                      error={errors.room}
                      className="sm:col-span-2"
                    />

                    <ChipGroup
                      id={fid("budget")}
                      name="budget"
                      legend="Buget estimativ"
                      options={BUDGET_OPTIONS}
                      value={values.budget}
                      onChange={(budget) => setField("budget", budget)}
                      error={errors.budget}
                      className="sm:col-span-2"
                    />
                  </div>

                  {/* ------------------------------------------- consent -- */}
                  <div className="mt-7">
                    <label
                      htmlFor={fid("consent")}
                      className="flex cursor-pointer select-none items-start gap-3"
                    >
                      <span className="relative mt-px grid size-5 shrink-0 place-items-center">
                        <input
                          id={fid("consent")}
                          name="consent"
                          type="checkbox"
                          required
                          checked={values.consent}
                          onChange={(e) => setField("consent", e.target.checked)}
                          aria-invalid={errors.consent ? true : undefined}
                          aria-describedby={
                            errors.consent ? `${fid("consent")}-error` : undefined
                          }
                          className={cn(
                            "peer absolute inset-0 size-full cursor-pointer appearance-none rounded-[5px] border bg-transparent",
                            "transition-[background-color,border-color] duration-150 ease-out-strong",
                            "checked:border-lime-brand checked:bg-lime-brand",
                            errors.consent ? ERROR_BORDER : "border-white/20",
                          )}
                        />
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                          className={cn(
                            "pointer-events-none relative size-3 scale-90 text-lime-ink opacity-0",
                            "transition-[opacity,transform] duration-150 ease-out-strong",
                            "peer-checked:scale-100 peer-checked:opacity-100",
                          )}
                        >
                          <path
                            d="M2.25 6.25 4.75 8.75 9.75 3.25"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="text-[0.8125rem] leading-normal text-fg-dim">
                        Sunt de acord cu prelucrarea datelor personale pentru a fi contactat în
                        legătură cu această solicitare, conform{" "}
                        <a
                          href="/politica-de-confidentialitate"
                          className="underline decoration-white/30 underline-offset-2 transition-colors duration-200 ease-out-strong hover-fine:hover:text-fg"
                        >
                          Politicii de confidențialitate
                        </a>
                        . Datele nu sunt transmise terților.
                      </span>
                    </label>
                    {errors.consent ? (
                      <p
                        id={`${fid("consent")}-error`}
                        role="alert"
                        className={cn("mt-1.5 pl-8 text-[0.8125rem]", ERROR_TEXT)}
                      >
                        {errors.consent}
                      </p>
                    ) : null}
                  </div>

                  {/* -------------------------------------------- status -- */}
                  {/* Present in the DOM even when empty — a live region that is
                      inserted at the same moment as its text is not announced. */}
                  <div aria-live="polite">
                    {formError ? (
                      <p
                        className={cn(
                          "mt-4 rounded-md border border-[#f0937a]/30 bg-[#f0937a]/8 px-3.5 py-2.5 text-[0.875rem]",
                          ERROR_TEXT,
                        )}
                      >
                        {formError}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={busy}
                      aria-busy={busy}
                      className={cn(
                        "inline-flex h-[3.25rem] w-full select-none items-center justify-center gap-2 rounded-pill px-7",
                        "btn-3d btn-3d-lime text-[0.9375rem] font-medium text-lime-ink",
                        "transition-[transform,box-shadow,--btn-top,--btn-mid,--btn-bottom] duration-150 ease-out-strong",
                        "active:scale-[0.98]",
                        "disabled:pointer-events-none disabled:opacity-70",
                      )}
                    >
                      {busy ? (
                        <>
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                            className="size-4 shrink-0 animate-spin"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="6.4"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              opacity="0.25"
                            />
                            <path
                              d="M14.4 8A6.4 6.4 0 0 0 8 1.6"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                          Se trimite…
                        </>
                      ) : (
                        "Trimite cererea"
                      )}
                    </button>

                    <p className="mt-3 text-center text-[0.8125rem] text-fg-faint">
                      Sau sună direct:{" "}
                      <a
                        href={SITE.phoneHref}
                        className="text-fg-dim transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-brand"
                      >
                        {SITE.phone}
                      </a>
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
