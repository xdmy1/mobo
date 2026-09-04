"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CORP_BRAND_OPTIONS,
  CORP_FINISH_OPTIONS,
  COUNTERTOP_OPTIONS,
  DEFAULT_CONFIG,
  DRAWER_OPTIONS,
  FRONT_OPTIONS,
  MECHANISM_OPTIONS,
  MODE_OPTIONS,
  ORGANIZER_OPTIONS,
  SHAPE_OPTIONS,
  TYPE_OPTIONS,
  estimateEur,
  estimatePrice,
  formatMdl,
  hasCountertop,
  hasOrganizers,
  summarize,
  type CalcConfig,
  type CalcSettings,
  type FurnitureType,
} from "@/lib/calculator";
import { SITE } from "@/lib/data";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Calculatorul de preț — wizard în gramatica vizuală a site-ului.
 *
 * Referințele clientului: interiordelux.md/calculator (pași cu preț viu) și
 * calculator.mobo.md (formula și prețurile reale, din CRM). De aici: pași
 * focalizați unul câte unul, totalul mereu vizibil într-o bară lipită jos,
 * și exact motorul de preț din lib/calculator.ts — nimic reinventat.
 *
 * Prețul afișat e estimativ și pagina o spune explicit: calculul final se
 * face după măsurare, formula servește doar ordinele de mărime.
 */

type StepId =
  | "mod"
  | "tip"
  | "forma"
  | "dims"
  | "corp"
  | "fatada"
  | "sertare"
  | "mecanisme"
  | "organizatoare"
  | "blat"
  | "rezultat";

const STEP_TITLES: Record<StepId, string> = {
  mod: "Alege nivelul",
  tip: "Ce mobilăm?",
  forma: "Forma bucătăriei",
  dims: "Dimensiunile spațiului",
  corp: "Corpul mobilierului",
  fatada: "Fațada",
  sertare: "Sertare",
  mecanisme: "Mecanisme",
  organizatoare: "Organizatoare",
  blat: "Suprafața de lucru",
  rezultat: "Estimarea ta",
};

const STEP_HINTS: Partial<Record<StepId, string>> = {
  mod: "Nivelul stabilește gama de materiale și feronerie din care pornim.",
  dims: "Lungimea desfășurată a mobilierului, în metri. Înălțimea implicită e tavanul standard de 2,6 m.",
  corp: "Placa din care sunt construite corpurile — scheletul mobilierului.",
  fatada: "Fața mobilierului — materialul pe care îl vezi și îl atingi zilnic.",
  sertare: "Adaugă numărul aproximativ de sertare. Poți lăsa zero — le stabilim la proiectare.",
  mecanisme: "Sisteme de ridicare, glisare și colț. Opționale.",
  organizatoare: "Accesorii interioare pentru haine și încălțăminte. Opționale.",
  blat: "Doar dacă vrei blat în calcul — introdu suprafața aproximativă în m².",
};

function stepsFor(type: FurnitureType): StepId[] {
  return [
    "mod",
    "tip",
    ...(type === "bucatarie" ? (["forma"] as StepId[]) : []),
    "dims",
    "corp",
    "fatada",
    "sertare",
    "mecanisme",
    ...(hasOrganizers(type) ? (["organizatoare"] as StepId[]) : []),
    ...(hasCountertop(type) ? (["blat"] as StepId[]) : []),
    "rezultat",
  ];
}

/* Aceeași gramatică de input ca LeadForm: linie de bază, focus în lime. */
const CONTROL = cn(
  "h-12 w-full rounded-none border-0 border-b bg-transparent px-0 text-[1.0625rem] text-fg",
  "placeholder:text-fg-faint",
  "focus:outline-none focus:border-lime-brand focus:shadow-[inset_0_-1px_0_0_var(--color-lime-brand)]",
  "transition-[border-color,box-shadow] duration-150 ease-out-strong",
  "border-white/15",
);

const FIELD_LABEL = "block text-[0.6875rem] font-medium uppercase tracking-[0.075em] text-fg-faint";

/* ------------------------------------------------------------ subcomponente */

function OptionCard({
  label,
  blurb,
  selected,
  onClick,
}: {
  label: string;
  blurb?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-card border p-4 text-left transition-[background-color,border-color,color,transform] duration-150 ease-out-strong sm:p-5",
        "active:scale-[0.99]",
        selected
          ? "border-bone-50 bg-bone-50 text-fg-invert"
          : "border-white/12 text-fg hover-fine:hover:border-white/30",
      )}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[0.9375rem] font-medium">{label}</span>
        <span
          aria-hidden="true"
          className={cn(
            "relative top-[1px] grid size-4 shrink-0 place-items-center rounded-full border",
            selected ? "border-lime-on-light bg-lime-on-light" : "border-white/25",
          )}
        >
          {selected ? <span className="size-1.5 rounded-full bg-bone-50" /> : null}
        </span>
      </span>
      {blurb ? (
        <span
          className={cn(
            "text-pretty mt-1.5 block text-[0.8125rem] leading-[1.55]",
            selected ? "text-fg-invert-dim" : "text-fg-dim",
          )}
        >
          {blurb}
        </span>
      ) : null}
    </button>
  );
}

function CounterRow({
  label,
  blurb,
  value,
  onChange,
}: {
  label: string;
  blurb?: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const stepBtn = cn(
    "grid size-9 shrink-0 select-none place-items-center rounded-full border border-white/15 text-fg",
    "transition-[background-color,border-color,transform] duration-150 ease-out-strong",
    "hover-fine:hover:border-white/35 active:scale-95",
    "disabled:pointer-events-none disabled:opacity-30",
  );
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-3.5">
      <div>
        <p className="text-[0.9375rem] text-fg">{label}</p>
        {blurb ? <p className="mt-0.5 text-[0.8125rem] text-fg-dim">{blurb}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          aria-label={`Scade ${label}`}
          className={stepBtn}
        >
          −
        </button>
        <span
          className={cn(
            "w-6 text-center text-[1.0625rem] tabular-nums",
            value > 0 ? "font-medium text-fg" : "text-fg-faint",
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          aria-label={`Adaugă ${label}`}
          className={stepBtn}
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- wizard -- */

export default function Calculator({ settings }: { settings: CalcSettings }) {
  const uid = useId();
  const reduce = useReducedMotion();
  const topRef = useRef<HTMLDivElement>(null);

  const [cfg, setCfg] = useState<CalcConfig>(DEFAULT_CONFIG);
  const [stepIndex, setStepIndex] = useState(0);
  /* Inputurile numerice trăiesc ca text, ca virgula moldovenească („2,5")
     să nu fie respinsă la tastare; parsarea se face la fiecare schimbare. */
  const [lengthText, setLengthText] = useState("");
  const [heightText, setHeightText] = useState("2,6");
  const [blatText, setBlatText] = useState("");
  const [dimsError, setDimsError] = useState<string | null>(null);

  /* Lead-ul din pasul final. */
  const [lead, setLead] = useState({ name: "", phone: "", consent: false });
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [leadError, setLeadError] = useState<string | null>(null);
  const startedAt = useRef(Date.now());

  const steps = useMemo(() => stepsFor(cfg.type), [cfg.type]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const total = estimatePrice(settings, cfg);
  const isResult = step === "rezultat";

  const parseNum = (text: string): number => {
    const parsed = Number(text.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [reduce]);

  const goForward = useCallback(() => {
    if (step === "dims") {
      const length = parseNum(lengthText);
      const height = parseNum(heightText);
      if (!(length >= 0.5 && length <= 30)) {
        setDimsError("Introdu lungimea în metri — între 0,5 și 30.");
        return;
      }
      if (!(height >= 1 && height <= 3.5)) {
        setDimsError("Înălțimea trebuie să fie între 1 și 3,5 metri.");
        return;
      }
      setDimsError(null);
      setCfg((prev) => ({ ...prev, lengthM: length, heightM: height }));
    }
    if (step === "blat") {
      setCfg((prev) => ({
        ...prev,
        countertop: { ...prev.countertop, m2: Math.max(0, Math.min(30, parseNum(blatText))) },
      }));
    }
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    scrollToTop();
  }, [step, lengthText, heightText, blatText, steps.length, scrollToTop]);

  const goBack = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
    setLeadStatus("idle");
    setLeadError(null);
    scrollToTop();
  }, [scrollToTop]);

  const restart = useCallback(() => {
    setCfg(DEFAULT_CONFIG);
    setLengthText("");
    setHeightText("2,6");
    setBlatText("");
    setStepIndex(0);
    setLead({ name: "", phone: "", consent: false });
    setLeadStatus("idle");
    setLeadError(null);
    scrollToTop();
  }, [scrollToTop]);

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (leadStatus === "submitting") return;

    if (lead.name.trim().length < 2 || lead.phone.trim().length < 6 || !lead.consent) {
      setLeadStatus("error");
      setLeadError("Completează numele, telefonul și bifează acordul.");
      return;
    }

    setLeadStatus("submitting");
    setLeadError(null);

    const rows = summarize(cfg)
      .map((row) => `${row.label}: ${row.value}`)
      .join("\n");
    const message = `Configurație din calculator:\n${rows}\nEstimare: ${formatMdl(total)} MDL (≈ ${formatMdl(estimateEur(settings, total))} EUR)`;

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          consent: lead.consent,
          message,
          _company: "",
          _startedAt: startedAt.current,
        }),
      });
      if (!res.ok) throw new Error();
      setLeadStatus("success");
    } catch {
      setLeadStatus("error");
      setLeadError(`Nu am putut trimite cererea. Sună-ne direct la ${SITE.phone}.`);
    }
  }

  const setQty = (group: "drawers" | "mechanisms" | "organizers", key: string, qty: number) =>
    setCfg((prev) => ({ ...prev, [group]: { ...prev[group], [key]: qty } }));

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      };

  return (
    <section aria-label="Calculator de preț" className="grain relative bg-ink-900">
      <div ref={topRef} className="mx-auto w-full max-w-3xl scroll-mt-28 px-5 pb-40 pt-14 sm:px-8 sm:pt-16">
        {/* -------------------------------------------------------- progres */}
        <div className="flex items-center justify-between gap-6">
          <p className="text-eyebrow text-fg-dim">
            Pasul {Math.min(stepIndex + 1, steps.length)} din {steps.length}
          </p>
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={stepIndex + 1}
            className="h-px max-w-56 flex-1 bg-white/10"
          >
            <div
              className="h-px bg-lime-brand transition-[width] duration-300 ease-out-strong"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={swap.initial}
            animate={{ ...swap.animate, transition: { duration: DUR.panel, ease: EASE_OUT } }}
            exit={{ ...swap.exit, transition: { duration: DUR.micro, ease: EASE_OUT } }}
            className="mt-6"
          >
            <h2 className="text-h1 text-balance text-fg">{STEP_TITLES[step]}</h2>
            {STEP_HINTS[step] ? (
              <p className="text-pretty mt-3 max-w-[52ch] text-[0.9375rem] leading-[1.65] text-fg-dim">
                {STEP_HINTS[step]}
              </p>
            ) : null}

            {/* ------------------------------------------------------- mod */}
            {step === "mod" ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {MODE_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    blurb={option.blurb}
                    selected={cfg.mode === option.value}
                    onClick={() => setCfg((prev) => ({ ...prev, mode: option.value }))}
                  />
                ))}
              </div>
            ) : null}

            {/* ------------------------------------------------------- tip */}
            {step === "tip" ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {TYPE_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    blurb={option.blurb}
                    selected={cfg.type === option.value}
                    onClick={() =>
                      setCfg((prev) => ({
                        ...prev,
                        type: option.value,
                        organizers: {},
                      }))
                    }
                  />
                ))}
              </div>
            ) : null}

            {/* ----------------------------------------------------- formă */}
            {step === "forma" ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {SHAPE_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={cfg.shape === option.value}
                    onClick={() => setCfg((prev) => ({ ...prev, shape: option.value }))}
                  />
                ))}
              </div>
            ) : null}

            {/* ------------------------------------------------ dimensiuni */}
            {step === "dims" ? (
              <div className="mt-8">
                <div className="grid gap-7 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${uid}-len`} className={FIELD_LABEL}>
                      Lungime, metri
                    </label>
                    <input
                      id={`${uid}-len`}
                      type="text"
                      inputMode="decimal"
                      placeholder="ex. 5"
                      value={lengthText}
                      onChange={(e) => {
                        setLengthText(e.target.value);
                        setDimsError(null);
                      }}
                      className={CONTROL}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-h`} className={FIELD_LABEL}>
                      Înălțime, metri
                    </label>
                    <input
                      id={`${uid}-h`}
                      type="text"
                      inputMode="decimal"
                      value={heightText}
                      onChange={(e) => {
                        setHeightText(e.target.value);
                        setDimsError(null);
                      }}
                      className={CONTROL}
                    />
                  </div>
                </div>

                {cfg.type === "bucatarie" ? (
                  <fieldset className="mt-7">
                    <legend className={FIELD_LABEL}>Adâncimea corpurilor</legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {([600, 900] as const).map((depth) => (
                        <button
                          key={depth}
                          type="button"
                          aria-pressed={cfg.depth === depth}
                          onClick={() => setCfg((prev) => ({ ...prev, depth }))}
                          className={cn(
                            "inline-flex h-9 select-none items-center rounded-pill border px-4 text-[0.875rem]",
                            "transition-[background-color,border-color,color] duration-150 ease-out-strong",
                            cfg.depth === depth
                              ? "border-bone-50 bg-bone-50 font-medium text-fg-invert"
                              : "border-white/15 text-fg-dim hover-fine:hover:border-white/35 hover-fine:hover:text-fg",
                          )}
                        >
                          {depth} mm{depth === 900 ? " — corpuri adânci" : ""}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                {dimsError ? (
                  <p role="alert" className="mt-4 text-[0.8125rem] text-[#f0937a]">
                    {dimsError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* ------------------------------------------------------ corp */}
            {step === "corp" ? (
              <div className="mt-8">
                <div className="grid gap-3 sm:grid-cols-2">
                  {CORP_BRAND_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.value}
                      label={option.label}
                      blurb={option.blurb}
                      selected={cfg.corpBrand === option.value}
                      onClick={() => setCfg((prev) => ({ ...prev, corpBrand: option.value }))}
                    />
                  ))}
                </div>
                <fieldset className="mt-7">
                  <legend className={FIELD_LABEL}>Finisajul plăcii</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CORP_FINISH_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={cfg.corpFinish === option.value}
                        onClick={() => setCfg((prev) => ({ ...prev, corpFinish: option.value }))}
                        className={cn(
                          "inline-flex h-9 select-none items-center rounded-pill border px-4 text-[0.875rem]",
                          "transition-[background-color,border-color,color] duration-150 ease-out-strong",
                          cfg.corpFinish === option.value
                            ? "border-bone-50 bg-bone-50 font-medium text-fg-invert"
                            : "border-white/15 text-fg-dim hover-fine:hover:border-white/35 hover-fine:hover:text-fg",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            ) : null}

            {/* ---------------------------------------------------- fațadă */}
            {step === "fatada" ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {FRONT_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    blurb={option.blurb}
                    selected={cfg.front === option.value}
                    onClick={() => setCfg((prev) => ({ ...prev, front: option.value }))}
                  />
                ))}
              </div>
            ) : null}

            {/* --------------------------------------------------- sertare */}
            {step === "sertare" ? (
              <div className="mt-6 border-t border-white/8">
                {DRAWER_OPTIONS.map((option) => {
                  const key = `${option.brand}_${option.type}`;
                  return (
                    <CounterRow
                      key={key}
                      label={option.label}
                      value={cfg.drawers[key] ?? 0}
                      onChange={(qty) => setQty("drawers", key, qty)}
                    />
                  );
                })}
              </div>
            ) : null}

            {/* ------------------------------------------------- mecanisme */}
            {step === "mecanisme" ? (
              <div className="mt-6 border-t border-white/8">
                {MECHANISM_OPTIONS.map((option) => (
                  <CounterRow
                    key={option.value}
                    label={option.label}
                    blurb={option.blurb}
                    value={cfg.mechanisms[option.value] ?? 0}
                    onChange={(qty) => setQty("mechanisms", option.value, qty)}
                  />
                ))}
              </div>
            ) : null}

            {/* --------------------------------------------- organizatoare */}
            {step === "organizatoare" ? (
              <div className="mt-6 border-t border-white/8">
                {ORGANIZER_OPTIONS.map((option) => (
                  <CounterRow
                    key={option.value}
                    label={`${option.label} — ${option.blurb.replace(/\.$/, "").toLowerCase()}`}
                    value={cfg.organizers[option.value] ?? 0}
                    onChange={(qty) => setQty("organizers", option.value, qty)}
                  />
                ))}
              </div>
            ) : null}

            {/* ------------------------------------------------------ blat */}
            {step === "blat" ? (
              <div className="mt-8">
                <div className="grid gap-3 sm:grid-cols-3">
                  {COUNTERTOP_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.value}
                      label={option.label}
                      blurb={option.blurb}
                      selected={cfg.countertop.brand === option.value}
                      onClick={() =>
                        setCfg((prev) => ({
                          ...prev,
                          countertop: { ...prev.countertop, brand: option.value },
                        }))
                      }
                    />
                  ))}
                </div>
                <div className="mt-7 max-w-56">
                  <label htmlFor={`${uid}-blat`} className={FIELD_LABEL}>
                    Suprafață blat, m² (opțional)
                  </label>
                  <input
                    id={`${uid}-blat`}
                    type="text"
                    inputMode="decimal"
                    placeholder="ex. 3,5"
                    value={blatText}
                    onChange={(e) => setBlatText(e.target.value)}
                    className={CONTROL}
                  />
                </div>
              </div>
            ) : null}

            {/* -------------------------------------------------- rezultat */}
            {step === "rezultat" ? (
              <div className="mt-8">
                <p className="text-eyebrow text-fg-dim">Estimare orientativă</p>
                <p className="mt-3">
                  <span className="text-display text-fg">{formatMdl(total)}</span>
                  <span className="ml-2 text-h3 text-fg-dim">MDL</span>
                  <span className="ml-4 text-[0.9375rem] text-fg-faint">
                    ≈ {formatMdl(estimateEur(settings, total))} €
                  </span>
                </p>

                <ul className="mt-8 list-none border-t border-white/8">
                  {summarize(cfg).map((row) => (
                    <li
                      key={row.label}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/8 py-3"
                    >
                      <span className="text-[0.8125rem] text-fg-faint">{row.label}</span>
                      <span className="max-w-[36ch] text-right text-[0.9375rem] text-fg-dim">
                        {row.value}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-pretty mt-5 max-w-[56ch] text-[0.8125rem] leading-[1.6] text-fg-faint">
                  Estimarea e orientativă — depinde de configurația exactă, decoruri și accesorii.
                  Prețul final îl primești după măsurători, împreună cu proiectul, fără nicio
                  obligație din partea ta.
                </p>

                {/* -------------------------------------------- mini-lead */}
                {leadStatus === "success" ? (
                  <div className="mt-9 rounded-card border border-white/10 bg-white/[0.03] p-6">
                    <h3 className="text-h3 text-fg">Am primit configurația ta.</h3>
                    <p className="text-pretty mt-2 max-w-[44ch] text-[0.9375rem] leading-[1.65] text-fg-dim">
                      Te contactăm la <span className="text-fg">{lead.phone}</span> în aceeași zi
                      lucrătoare, cu un calcul verificat de un consultant.
                    </p>
                    <button
                      type="button"
                      onClick={restart}
                      className="mt-5 text-[0.875rem] text-fg-dim underline decoration-white/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-fg"
                    >
                      Calculează altă configurație
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitLead} noValidate className="mt-9">
                    <h3 className="text-h3 text-fg">
                      Vrei calculul exact? Ți-l face un consultant.
                    </h3>
                    <div className="mt-5 grid gap-7 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`${uid}-nume`} className={FIELD_LABEL}>
                          Nume
                        </label>
                        <input
                          id={`${uid}-nume`}
                          type="text"
                          autoComplete="name"
                          maxLength={80}
                          placeholder="Numele tău"
                          value={lead.name}
                          onChange={(e) => setLead((prev) => ({ ...prev, name: e.target.value }))}
                          className={CONTROL}
                        />
                      </div>
                      <div>
                        <label htmlFor={`${uid}-tel`} className={FIELD_LABEL}>
                          Telefon
                        </label>
                        <input
                          id={`${uid}-tel`}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          maxLength={24}
                          placeholder="+373 60 000 000"
                          value={lead.phone}
                          onChange={(e) => setLead((prev) => ({ ...prev, phone: e.target.value }))}
                          className={CONTROL}
                        />
                      </div>
                    </div>

                    <label
                      htmlFor={`${uid}-acord`}
                      className="mt-5 flex cursor-pointer select-none items-start gap-3"
                    >
                      <input
                        id={`${uid}-acord`}
                        type="checkbox"
                        checked={lead.consent}
                        onChange={(e) =>
                          setLead((prev) => ({ ...prev, consent: e.target.checked }))
                        }
                        className={cn(
                          "mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border border-white/20 bg-transparent",
                          "transition-[background-color,border-color] duration-150 ease-out-strong",
                          "checked:border-lime-brand checked:bg-lime-brand",
                        )}
                      />
                      <span className="text-[0.8125rem] leading-normal text-fg-dim">
                        Sunt de acord cu prelucrarea datelor personale conform{" "}
                        <a
                          href="/politica-de-confidentialitate"
                          className="underline decoration-white/30 underline-offset-2 hover-fine:hover:text-fg"
                        >
                          Politicii de confidențialitate
                        </a>
                        .
                      </span>
                    </label>

                    <div aria-live="polite">
                      {leadError ? (
                        <p className="mt-4 rounded-md border border-[#f0937a]/30 bg-[#f0937a]/8 px-3.5 py-2.5 text-[0.875rem] text-[#f0937a]">
                          {leadError}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        disabled={leadStatus === "submitting"}
                        aria-busy={leadStatus === "submitting"}
                        className={cn(
                          "inline-flex h-[3.25rem] select-none items-center justify-center rounded-pill px-8",
                          "btn-3d btn-3d-lime text-[0.9375rem] font-medium text-lime-ink",
                          "transition-[transform,box-shadow,--btn-top,--btn-mid,--btn-bottom] duration-150 ease-out-strong",
                          "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70",
                        )}
                      >
                        {leadStatus === "submitting" ? "Se trimite…" : "Trimite configurația"}
                      </button>
                      <button
                        type="button"
                        onClick={restart}
                        className="text-left text-[0.875rem] text-fg-dim underline decoration-white/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-fg sm:text-center"
                      >
                        Reia de la zero
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------- bara de estimare */}
      {/* Sub SocialIsland (z-[80]) și nav (z-[90]) — bară utilitară, nu chrome. */}
      <div className="fixed inset-x-0 bottom-0 z-[70]">
        <div className="mx-auto w-full max-w-3xl px-5 pb-4 sm:px-8 sm:pb-5">
          <div className="glass flex items-center justify-between gap-4 rounded-pill py-2 pl-6 pr-2">
            <p className="min-w-0 text-[0.8125rem] text-fg-dim">
              <span className="hidden sm:inline">Estimare curentă: </span>
              <span className="text-[1.0625rem] font-medium tabular-nums text-fg">
                {total > 0 ? `${formatMdl(total)} MDL` : "—"}
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex h-11 select-none items-center rounded-pill px-4 text-[0.875rem] text-fg-dim transition-colors duration-150 ease-out-strong hover-fine:hover:text-fg"
                >
                  Înapoi
                </button>
              ) : null}
              {!isResult ? (
                <button
                  type="button"
                  onClick={goForward}
                  className={cn(
                    "inline-flex h-11 select-none items-center gap-2 rounded-pill px-6",
                    "btn-3d btn-3d-lime text-[0.875rem] font-medium text-lime-ink",
                    "transition-[transform,box-shadow,--btn-top,--btn-mid,--btn-bottom] duration-150 ease-out-strong",
                    "active:scale-[0.98]",
                  )}
                >
                  Continuă
                  <span aria-hidden="true">→</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
