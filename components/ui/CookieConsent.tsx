"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DUR, EASE_DRAWER } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Consimțământul de cookie-uri — cerință de client, după referința orange.md:
 * un pop-up la intrarea pe site, cu fundal întunecat care blochează pagina
 * până la o alegere, și trei acțiuni din care „De acord" domină vizual.
 *
 * Alegerea se ține în localStorage (nu într-un cookie — nu are de ce să
 * călătorească spre server) și e citită abia în effect, deci serverul și
 * primul render al clientului emit amândouă „nimic": zero nepotriviri de
 * hidratare. Ștergerea datelor site-ului readuce bannerul — exact ce promite
 * politica de confidențialitate.
 *
 * Deocamdată site-ul nu încarcă niciun script de statistică sau marketing;
 * alegerea e înregistrată ca ele să poată fi condiționate de ea în ziua în
 * care apar. Cine le adaugă citește consimțământul cu readConsent().
 */

export type CookieConsent = {
  v: 1;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  at: string;
};

const STORAGE_KEY = "mobo-consent";

/* Orice acces la localStorage e împachetat — în navigare privată sau cu datele
   de site blocate, simpla citire aruncă. */
export function readConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    return parsed?.v === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function writeConsent(analytics: boolean, marketing: boolean) {
  try {
    const consent: CookieConsent = {
      v: 1,
      necessary: true,
      analytics,
      marketing,
      at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    /* Fără storage, bannerul va reveni la următoarea vizită — acceptabil. */
  }
}

/* ------------------------------------------------------------------ toggle -- */

function Toggle({
  id,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      <span>
        <span className="block text-[0.875rem] font-medium text-fg">{label}</span>
        <span className="mt-0.5 block text-[0.8125rem] leading-normal text-fg-dim">{hint}</span>
      </span>
      <span className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className={cn(
            "peer h-6 w-10 cursor-pointer appearance-none rounded-pill border transition-colors duration-150 ease-out-strong",
            "checked:border-lime-brand checked:bg-lime-brand",
            "border-white/20 bg-white/10",
            "disabled:cursor-default disabled:opacity-60",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-1 top-1 size-4 rounded-full bg-bone-50 transition-transform duration-150 ease-out-strong",
            "peer-checked:translate-x-4 peer-checked:bg-lime-ink",
          )}
        />
      </span>
    </label>
  );
}

/* --------------------------------------------------------------- component -- */

export default function CookieConsent() {
  const uid = useId();
  const reduce = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (readConsent()) return;
    /* Mică întârziere ca dialogul să nu se bată cu vălul de first-paint. */
    const timer = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(timer);
  }, []);

  /* Dialogul e modal, deci primește focusul la deschidere. */
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const decide = useCallback((withAnalytics: boolean, withMarketing: boolean) => {
    writeConsent(withAnalytics, withMarketing);
    setOpen(false);
  }, []);

  /* Trap de focus minimal + Escape. Escape nu lasă utilizatorul fără decizie —
     contează ca „doar necesare", refuzul politicos. */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        decide(false, false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [decide],
  );

  const fade = { duration: reduce ? DUR.micro : DUR.panel, ease: EASE_DRAWER };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[95]" onKeyDown={handleKeyDown}>
          {/* Fundalul care „împinge" spre o alegere — pagina rămâne vizibilă,
              dar inactivă, exact ca la referința orange.md. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: fade }}
            exit={{ opacity: 0, transition: { ...fade, duration: DUR.micro } }}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-titlu`}
            aria-describedby={`${uid}-text`}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0, transition: fade }}
            exit={
              reduce
                ? { opacity: 0, transition: { ...fade, duration: DUR.micro } }
                : { opacity: 0, y: 32, transition: { ...fade, duration: DUR.micro } }
            }
            className={cn(
              "glass glass-thick absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl outline-none",
              "rounded-t-card p-6 sm:bottom-6 sm:rounded-card sm:p-7",
              "max-h-[85dvh] overflow-y-auto",
            )}
          >
            <h2 id={`${uid}-titlu`} className="text-h3 text-fg">
              Respectăm datele tale.
            </h2>
            <p
              id={`${uid}-text`}
              className="text-pretty mt-2.5 text-[0.875rem] leading-[1.65] text-fg-dim"
            >
              Folosim cookie-uri și tehnologii similare ca site-ul să funcționeze, iar cu acordul
              tău — ca să înțelegem cum e folosit și să ne promovăm mai eficient. Detalii în{" "}
              <a
                href="/politica-de-confidentialitate#cookie-uri"
                className="text-fg underline decoration-white/30 underline-offset-2 transition-colors duration-200 ease-out-strong hover-fine:hover:decoration-lime-brand"
              >
                Politica de confidențialitate
              </a>
              .
            </p>

            {expanded ? (
              <div className="mt-4 divide-y divide-white/8 border-y border-white/8">
                <Toggle
                  id={`${uid}-necesare`}
                  label="Strict necesare"
                  hint="Funcționarea și securitatea site-ului. Mereu active."
                  checked
                  disabled
                />
                <Toggle
                  id={`${uid}-statistica`}
                  label="Statistică"
                  hint="Ne arată anonim cum e folosit site-ul, ca să-l îmbunătățim."
                  checked={analytics}
                  onChange={setAnalytics}
                />
                <Toggle
                  id={`${uid}-marketing`}
                  label="Marketing"
                  hint="Ne ajută să-ți arătăm oferte relevante, nu reclame la nimereală."
                  checked={marketing}
                  onChange={setMarketing}
                />
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Ierarhia e intenționat inegală — cerință de client: „De acord"
                  e butonul mare, restul sunt căi discrete, dar reale. */}
              <button
                type="button"
                onClick={() => decide(true, true)}
                className={cn(
                  "btn-3d btn-3d-lime inline-flex h-12 flex-1 select-none items-center justify-center rounded-pill px-7",
                  "text-[0.9375rem] font-medium text-lime-ink",
                  "transition-[transform,box-shadow,--btn-top,--btn-mid,--btn-bottom] duration-150 ease-out-strong",
                  "active:scale-[0.98]",
                )}
              >
                De acord
              </button>

              {expanded ? (
                <button
                  type="button"
                  onClick={() => decide(analytics, marketing)}
                  className="glass glass-thin btn-3d-glass inline-flex h-12 select-none items-center justify-center rounded-pill px-6 text-[0.875rem] font-medium text-fg transition-transform duration-150 ease-out-strong active:scale-[0.98]"
                >
                  Salvează alegerea
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => decide(false, false)}
                  className="glass glass-thin btn-3d-glass inline-flex h-12 select-none items-center justify-center rounded-pill px-6 text-[0.875rem] font-medium text-fg transition-transform duration-150 ease-out-strong active:scale-[0.98]"
                >
                  Doar necesare
                </button>
              )}

              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                aria-expanded={expanded}
                className="inline-flex h-12 select-none items-center justify-center px-2 text-[0.875rem] text-fg-dim underline decoration-white/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-fg"
              >
                {expanded ? "Ascunde opțiunile" : "Personalizează"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
