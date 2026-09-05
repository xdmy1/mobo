"use client";

import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
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
  type CalcIcon,
  type CalcSettings,
  type FurnitureType,
  type KitchenShape,
} from "@/lib/calculator";
import { SITE } from "@/lib/data";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Calculatorul de preț — configurator vizual în gramatica site-ului.
 *
 * A doua iterație, după feedbackul clientului („ceva mai complicat, cu poze"):
 * fiecare opțiune de mod / tip / fațadă / blat e un card cu o fotografie REALĂ
 * din proiectele MOBO (aceleași ședințe ca galeriile — materialul de pe card e
 * materialul montat într-o casă adevărată), formele bucătăriei sunt desenate ca
 * schițe din vedere de sus, sertarele și mecanismele au glife de linie, iar pe
 * desktop configurația se adună într-un panou lateral lipicios, ca un bon de
 * configurare. Motorul de preț rămâne cel din lib/calculator.ts — formula și
 * prețurile reale ale MOBO.
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
  mod: "Nivelul stabilește gama de materiale și feronerie din care pornim. Fotografiile sunt din proiectele noastre.",
  tip: "Fiecare card e un proiect MOBO real — apasă pe cel care seamănă cu planul tău.",
  forma: "Schițele sunt văzute de sus: linia verde e mobilierul, conturul e camera.",
  dims: "Lungimea desfășurată a mobilierului, în metri. Înălțimea implicită e tavanul standard de 2,6 m.",
  corp: "Placa din care sunt construite corpurile — scheletul mobilierului.",
  fatada: "Fața mobilierului — materialul pe care îl vezi și îl atingi zilnic. Toate cadrele sunt din casele clienților noștri.",
  sertare: "Adaugă numărul aproximativ de sertare. Poți lăsa zero — le stabilim la proiectare.",
  mecanisme: "Sisteme de ridicare, glisare și colț. Opționale.",
  organizatoare: "Accesorii interioare pentru haine și încălțăminte. Opționale.",
  blat: "Doar dacă vrei blat în calcul — alege materialul și introdu suprafața aproximativă.",
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

const CHIP = (active: boolean) =>
  cn(
    "inline-flex h-9 select-none items-center rounded-pill border px-4 text-[0.875rem]",
    "transition-[background-color,border-color,color] duration-150 ease-out-strong",
    active
      ? "border-bone-50 bg-bone-50 font-medium text-fg-invert"
      : "border-white/15 text-fg-dim hover-fine:hover:border-white/35 hover-fine:hover:text-fg",
  );

/* ------------------------------------------------------------------- glife -- */

/* Glife de linie, desenate pentru acest calculator — 28px, trasă 1.5, aceeași
   familie vizuală cu iconografia socială a site-ului. */
const GLYPH_PATHS: Record<CalcIcon, ReactNode> = {
  drawer: (
    <>
      <rect x="4.5" y="12.5" width="19" height="10" rx="1.8" />
      <path d="M11 17.5h6" />
      <path d="M8 8.5h12M10 4.5h8" />
    </>
  ),
  "drawer-metal": (
    <>
      <rect x="4.5" y="10.5" width="19" height="12" rx="1.8" />
      <path d="M4.5 14.5h19M4.5 18.5h19" />
    </>
  ),
  flap: (
    <>
      <rect x="4.5" y="12.5" width="19" height="10" rx="1.8" />
      <path d="M14 8.5v-5M14 3.5l-3 3M14 3.5l3 3" />
    </>
  ),
  fold: (
    <>
      <path d="M4.5 22.5v-11l9.5 4 9.5-4v11" />
      <path d="M14 15.5v-12M14 3.5l-3 3M14 3.5l3 3" />
    </>
  ),
  lift: (
    <>
      <path d="M4.5 22.5h19" />
      <rect x="7" y="14" width="14" height="8.5" rx="1.8" />
      <path d="M14 10.5v-7M14 3.5l-3.5 3.5M14 3.5l3.5 3.5" />
    </>
  ),
  slide: (
    <>
      <rect x="4" y="6.5" width="11" height="14" rx="1.5" />
      <rect x="13" y="8.5" width="11" height="14" rx="1.5" />
      <path d="M8 25.5h6M12 25.5l-2-1.6M12 25.5l-2 1.6" transform="translate(2 -1)" />
    </>
  ),
  corner: (
    <>
      <path d="M4.5 4.5h9v9h9v9h-18z" />
      <circle cx="15.5" cy="16.5" r="3.5" />
    </>
  ),
  shoe: (
    <>
      <path d="M4.5 19.5c5.5 0 8-6 10-6 1.8 0 3 3.5 9 4v4h-19z" />
      <path d="M4.5 13.5v4" />
    </>
  ),
  trousers: (
    <>
      <path d="M10 4.5h8l2.5 18h-5l-1.5-10-1.5 10h-5z" />
      <path d="M10 8.5h8" />
    </>
  ),
  pantograph: (
    <>
      <path d="M4.5 6.5h19" />
      <path d="M14 6.5v10M14 16.5l-3-3M14 16.5l3-3" />
      <path d="M8 22.5h12" />
    </>
  ),
};

function Glyph({ icon, className }: { icon: CalcIcon; className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {GLYPH_PATHS[icon]}
    </svg>
  );
}

/* Schițele formelor de bucătărie — vedere de sus: conturul camerei în alb
   stins, traseul mobilierului în lime. */
const SHAPE_RUNS: Record<KitchenShape, ReactNode> = {
  dreapta: <path d="M16 20h88" />,
  colt: <path d="M16 64V20h88" />,
  u: <path d="M16 64V20h88v44" />,
  bar: (
    <>
      <path d="M16 64V20h88" />
      <path d="M72 20v30" />
    </>
  ),
  insula: (
    <>
      <path d="M16 20h88" />
      <path d="M46 52h28" strokeWidth="12" />
    </>
  ),
};

function ShapeDiagram({ shape }: { shape: KitchenShape }) {
  return (
    <svg viewBox="0 0 120 84" fill="none" aria-hidden="true" className="h-auto w-full">
      <rect
        x="7"
        y="9"
        width="106"
        height="66"
        rx="5"
        stroke="rgb(246 245 238 / 22%)"
        strokeWidth="1.5"
      />
      <g
        stroke="var(--color-lime-brand)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      >
        {SHAPE_RUNS[shape]}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------ subcomponente */

function PhotoCard({
  label,
  blurb,
  image,
  selected,
  onClick,
  imageSizes = "(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw",
}: {
  label: string;
  blurb?: string;
  image: StaticImageData;
  selected: boolean;
  onClick: () => void;
  imageSizes?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group overflow-hidden rounded-card border text-left",
        "transition-[border-color,box-shadow,transform] duration-200 ease-out-strong",
        "active:scale-[0.99]",
        selected
          ? "border-lime-brand shadow-[0_0_28px_-6px_rgba(204,223,16,0.35)]"
          : "border-white/10 hover-fine:hover:border-white/30",
      )}
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-ink-800">
        <Image
          src={image}
          alt=""
          fill
          sizes={imageSizes}
          placeholder="blur"
          className={cn(
            "object-cover transition-transform duration-500 ease-out-strong",
            "hover-fine:group-hover:scale-[1.04]",
          )}
        />
        {/* Bifa plutește peste fotografie — starea se citește fără să cobori
            privirea la text. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-3 top-3 grid size-6 place-items-center rounded-full border backdrop-blur-sm",
            "transition-[background-color,border-color,opacity] duration-200 ease-out-strong",
            selected
              ? "border-lime-brand bg-lime-brand"
              : "border-white/40 bg-ink-950/30 opacity-80",
          )}
        >
          {selected ? (
            <svg viewBox="0 0 12 12" fill="none" className="size-3 text-lime-ink">
              <path
                d="M2.25 6.25 4.75 8.75 9.75 3.25"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </span>
      <span className="block p-4">
        <span
          className={cn(
            "block text-[0.9375rem] font-medium",
            selected ? "text-lime-brand" : "text-fg",
          )}
        >
          {label}
        </span>
        {blurb ? (
          <span className="text-pretty mt-1 block text-[0.8125rem] leading-[1.55] text-fg-dim">
            {blurb}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function DiagramCard({
  label,
  shape,
  selected,
  onClick,
}: {
  label: string;
  shape: KitchenShape;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-card border p-4 text-left transition-[border-color,box-shadow,transform] duration-200 ease-out-strong",
        "active:scale-[0.99]",
        selected
          ? "border-lime-brand shadow-[0_0_28px_-6px_rgba(204,223,16,0.35)]"
          : "border-white/10 hover-fine:hover:border-white/30",
      )}
    >
      <ShapeDiagram shape={shape} />
      <span
        className={cn(
          "mt-3 block text-[0.875rem] font-medium",
          selected ? "text-lime-brand" : "text-fg",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function CounterRow({
  icon,
  label,
  blurb,
  value,
  onChange,
}: {
  icon: CalcIcon;
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
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl border transition-colors duration-200 ease-out-strong",
            value > 0 ? "border-lime-brand/50 text-lime-brand" : "border-white/10 text-fg-dim",
          )}
        >
          <Glyph icon={icon} className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.9375rem] text-fg">{label}</p>
          {blurb ? <p className="mt-0.5 text-[0.8125rem] text-fg-dim">{blurb}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
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

  const typeOption = TYPE_OPTIONS.find((o) => o.value === cfg.type);
  const frontOption = FRONT_OPTIONS.find((o) => o.value === cfg.front);

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

  /* Bonul de configurare din panoul lateral: doar pașii DEJA parcurși — panoul
     crește pe măsură ce alegi, nu divulgă pașii care urmează. */
  const receipt = useMemo(() => {
    const done = (id: StepId) => steps.indexOf(id) < stepIndex;
    const rows: { label: string; value: string; image?: StaticImageData }[] = [];

    if (done("mod")) {
      const option = MODE_OPTIONS.find((o) => o.value === cfg.mode);
      rows.push({ label: "Mod", value: option?.label ?? "", image: option?.image });
    }
    if (done("tip")) rows.push({ label: "Tip", value: typeOption?.label ?? "", image: typeOption?.image });
    if (done("forma") && cfg.type === "bucatarie") {
      rows.push({
        label: "Formă",
        value: SHAPE_OPTIONS.find((o) => o.value === cfg.shape)?.label ?? "",
      });
    }
    if (done("dims")) {
      rows.push({
        label: "Dimensiuni",
        value:
          `${cfg.lengthM} × ${cfg.heightM} m` +
          (cfg.type === "bucatarie" ? `, ${cfg.depth} mm` : ""),
      });
    }
    if (done("corp")) {
      rows.push({
        label: "Corp",
        value: `${CORP_BRAND_OPTIONS.find((o) => o.value === cfg.corpBrand)?.label}, ${CORP_FINISH_OPTIONS.find((o) => o.value === cfg.corpFinish)?.label?.toLowerCase()}`,
      });
    }
    if (done("fatada")) {
      rows.push({ label: "Fațadă", value: frontOption?.label ?? "", image: frontOption?.image });
    }
    if (done("sertare")) {
      const count = Object.values(cfg.drawers).reduce((a, b) => a + b, 0);
      rows.push({ label: "Sertare", value: count > 0 ? `${count} buc` : "—" });
    }
    if (done("mecanisme")) {
      const count = Object.values(cfg.mechanisms).reduce((a, b) => a + b, 0);
      rows.push({ label: "Mecanisme", value: count > 0 ? `${count} buc` : "—" });
    }
    if (done("organizatoare") && hasOrganizers(cfg.type)) {
      const count = Object.values(cfg.organizers).reduce((a, b) => a + b, 0);
      rows.push({ label: "Organizatoare", value: count > 0 ? `${count} buc` : "—" });
    }
    if (done("blat") && hasCountertop(cfg.type)) {
      const option = COUNTERTOP_OPTIONS.find((o) => o.value === cfg.countertop.brand);
      rows.push({
        label: "Blat",
        value: cfg.countertop.m2 > 0 ? `${option?.label}, ${cfg.countertop.m2} m²` : "—",
        image: cfg.countertop.m2 > 0 ? option?.image : undefined,
      });
    }
    return rows;
  }, [cfg, steps, stepIndex, typeOption, frontOption]);

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      };

  return (
    <section aria-label="Calculator de preț" className="grain relative bg-ink-900">
      <div className="mx-auto w-full max-w-[88rem] px-5 pb-40 pt-14 sm:px-8 sm:pt-16 lg:px-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* ------------------------------------------------------- pașii -- */}
          <div ref={topRef} className="scroll-mt-28 lg:col-span-7 xl:col-span-8">
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
                  <p className="text-pretty mt-3 max-w-[56ch] text-[0.9375rem] leading-[1.65] text-fg-dim">
                    {STEP_HINTS[step]}
                  </p>
                ) : null}

                {/* ----------------------------------------------------- mod */}
                {step === "mod" ? (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {MODE_OPTIONS.map((option) => (
                      <PhotoCard
                        key={option.value}
                        label={option.label}
                        blurb={option.blurb}
                        image={option.image}
                        selected={cfg.mode === option.value}
                        onClick={() => setCfg((prev) => ({ ...prev, mode: option.value }))}
                      />
                    ))}
                  </div>
                ) : null}

                {/* ----------------------------------------------------- tip */}
                {step === "tip" ? (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {TYPE_OPTIONS.map((option) => (
                      <PhotoCard
                        key={option.value}
                        label={option.label}
                        blurb={option.blurb}
                        image={option.image}
                        selected={cfg.type === option.value}
                        onClick={() =>
                          setCfg((prev) => ({ ...prev, type: option.value, organizers: {} }))
                        }
                      />
                    ))}
                  </div>
                ) : null}

                {/* --------------------------------------------------- formă */}
                {step === "forma" ? (
                  <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {SHAPE_OPTIONS.map((option) => (
                      <DiagramCard
                        key={option.value}
                        label={option.label}
                        shape={option.value}
                        selected={cfg.shape === option.value}
                        onClick={() => setCfg((prev) => ({ ...prev, shape: option.value }))}
                      />
                    ))}
                  </div>
                ) : null}

                {/* ---------------------------------------------- dimensiuni */}
                {step === "dims" ? (
                  <div className="mt-8 grid gap-10 sm:grid-cols-[1fr_11rem]">
                    <div>
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
                                className={CHIP(cfg.depth === depth)}
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

                    {/* Schița cotelor — L pe orizontală, H pe verticală. */}
                    <svg
                      viewBox="0 0 120 120"
                      fill="none"
                      aria-hidden="true"
                      className="hidden h-auto w-full max-w-44 self-start sm:block"
                    >
                      <rect
                        x="26"
                        y="14"
                        width="80"
                        height="76"
                        rx="4"
                        stroke="rgb(246 245 238 / 25%)"
                        strokeWidth="1.5"
                      />
                      <path d="M46 14v76M66 14v76M86 14v76" stroke="rgb(246 245 238 / 12%)" strokeWidth="1.5" />
                      <g stroke="var(--color-lime-brand)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M26 104h80M26 104l5-3M26 104l5 3M106 104l-5-3M106 104l-5 3" />
                        <path d="M12 14v76M12 14l-3 5M12 14l3 5M12 90l-3-5M12 90l3-5" />
                      </g>
                      <text x="62" y="117" textAnchor="middle" fill="var(--color-lime-brand)" fontSize="10">
                        L
                      </text>
                      <text x="5" y="55" textAnchor="middle" fill="var(--color-lime-brand)" fontSize="10">
                        H
                      </text>
                    </svg>
                  </div>
                ) : null}

                {/* ---------------------------------------------------- corp */}
                {step === "corp" ? (
                  <div className="mt-8">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {CORP_BRAND_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={cfg.corpBrand === option.value}
                          onClick={() => setCfg((prev) => ({ ...prev, corpBrand: option.value }))}
                          className={cn(
                            "rounded-card border p-4 text-left transition-[border-color,box-shadow,transform] duration-200 ease-out-strong sm:p-5",
                            "active:scale-[0.99]",
                            cfg.corpBrand === option.value
                              ? "border-lime-brand shadow-[0_0_28px_-6px_rgba(204,223,16,0.35)]"
                              : "border-white/10 hover-fine:hover:border-white/30",
                          )}
                        >
                          <span
                            className={cn(
                              "block text-[0.9375rem] font-medium",
                              cfg.corpBrand === option.value ? "text-lime-brand" : "text-fg",
                            )}
                          >
                            {option.label}
                          </span>
                          <span className="text-pretty mt-1.5 block text-[0.8125rem] leading-[1.55] text-fg-dim">
                            {option.blurb}
                          </span>
                        </button>
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
                            onClick={() =>
                              setCfg((prev) => ({ ...prev, corpFinish: option.value }))
                            }
                            className={CHIP(cfg.corpFinish === option.value)}
                          >
                            {/* Mostra de finisaj — punctul spune culoarea înaintea cuvântului. */}
                            <span
                              aria-hidden="true"
                              className={cn(
                                "mr-2 inline-block size-3 rounded-full border border-black/20",
                                option.value === "alb" && "bg-bone-50",
                                option.value === "color" &&
                                  "bg-[conic-gradient(from_0deg,#8da4c0,#b56a6a,#7d9b76,#8da4c0)]",
                                option.value === "lemn" &&
                                  "bg-[linear-gradient(115deg,#9a6f4b,#c49a6c_55%,#8a5f3f)]",
                              )}
                            />
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                ) : null}

                {/* -------------------------------------------------- fațadă */}
                {step === "fatada" ? (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {FRONT_OPTIONS.map((option) => (
                      <PhotoCard
                        key={option.value}
                        label={option.label}
                        blurb={option.blurb}
                        image={option.image}
                        selected={cfg.front === option.value}
                        onClick={() => setCfg((prev) => ({ ...prev, front: option.value }))}
                        imageSizes="(min-width: 1280px) 280px, (min-width: 640px) 45vw, 90vw"
                      />
                    ))}
                  </div>
                ) : null}

                {/* ------------------------------------------------- sertare */}
                {step === "sertare" ? (
                  <div className="mt-6 border-t border-white/8">
                    {DRAWER_OPTIONS.map((option) => {
                      const key = `${option.brand}_${option.type}`;
                      return (
                        <CounterRow
                          key={key}
                          icon={option.icon}
                          label={option.label}
                          value={cfg.drawers[key] ?? 0}
                          onChange={(qty) => setQty("drawers", key, qty)}
                        />
                      );
                    })}
                  </div>
                ) : null}

                {/* ----------------------------------------------- mecanisme */}
                {step === "mecanisme" ? (
                  <div className="mt-6 border-t border-white/8">
                    {MECHANISM_OPTIONS.map((option) => (
                      <CounterRow
                        key={option.value}
                        icon={option.icon}
                        label={option.label}
                        blurb={option.blurb}
                        value={cfg.mechanisms[option.value] ?? 0}
                        onChange={(qty) => setQty("mechanisms", option.value, qty)}
                      />
                    ))}
                  </div>
                ) : null}

                {/* ------------------------------------------- organizatoare */}
                {step === "organizatoare" ? (
                  <div className="mt-6 border-t border-white/8">
                    {ORGANIZER_OPTIONS.map((option) => (
                      <CounterRow
                        key={option.value}
                        icon={option.icon}
                        label={option.label}
                        blurb={option.blurb}
                        value={cfg.organizers[option.value] ?? 0}
                        onChange={(qty) => setQty("organizers", option.value, qty)}
                      />
                    ))}
                  </div>
                ) : null}

                {/* ---------------------------------------------------- blat */}
                {step === "blat" ? (
                  <div className="mt-8">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {COUNTERTOP_OPTIONS.map((option) => (
                        <PhotoCard
                          key={option.value}
                          label={option.label}
                          blurb={option.blurb}
                          image={option.image}
                          selected={cfg.countertop.brand === option.value}
                          onClick={() =>
                            setCfg((prev) => ({
                              ...prev,
                              countertop: { ...prev.countertop, brand: option.value },
                            }))
                          }
                          imageSizes="(min-width: 640px) 30vw, 90vw"
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

                {/* ------------------------------------------------ rezultat */}
                {step === "rezultat" ? (
                  <div className="mt-8">
                    {/* Banner: proiectul real care seamănă cu alegerea. */}
                    {typeOption ? (
                      <div className="relative aspect-[21/9] overflow-hidden rounded-card">
                        <Image
                          src={typeOption.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 60vw, 92vw"
                          placeholder="blur"
                          className="object-cover"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/10 to-transparent"
                        />
                        <p className="absolute bottom-4 left-5 text-[0.8125rem] text-fg">
                          Fotografie dintr-un proiect MOBO — {typeOption.label.toLowerCase()} la
                          comandă.
                        </p>
                      </div>
                    ) : null}

                    <p className="text-eyebrow mt-8 text-fg-dim">Estimare orientativă</p>
                    <p className="mt-3">
                      <span className="text-display text-lime-brand">{formatMdl(total)}</span>
                      <span className="text-h3 ml-2 text-fg-dim">MDL</span>
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
                      Estimarea e orientativă — depinde de configurația exactă, decoruri și
                      accesorii. Prețul final îl primești după măsurători, împreună cu proiectul,
                      fără nicio obligație din partea ta.
                    </p>

                    {/* ------------------------------------------ mini-lead */}
                    {leadStatus === "success" ? (
                      <div className="mt-9 rounded-card border border-white/10 bg-white/[0.03] p-6">
                        <h3 className="text-h3 text-fg">Am primit configurația ta.</h3>
                        <p className="text-pretty mt-2 max-w-[44ch] text-[0.9375rem] leading-[1.65] text-fg-dim">
                          Te contactăm la <span className="text-fg">{lead.phone}</span> în aceeași
                          zi lucrătoare, cu un calcul verificat de un consultant.
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
                              onChange={(e) =>
                                setLead((prev) => ({ ...prev, name: e.target.value }))
                              }
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
                              onChange={(e) =>
                                setLead((prev) => ({ ...prev, phone: e.target.value }))
                              }
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

          {/* --------------------------------------------- bonul de config -- */}
          <aside className="hidden lg:col-span-4 lg:col-start-9 lg:block xl:col-start-9">
            <div className="sticky top-28 rounded-card-lg border border-white/10 bg-white/[0.03] p-6">
              <p className="text-eyebrow text-fg-dim">Configurația ta</p>

              {receipt.length === 0 ? (
                <p className="text-pretty mt-4 text-[0.875rem] leading-[1.6] text-fg-faint">
                  Alegerile tale se adună aici, pas cu pas — ca un bon de configurare.
                </p>
              ) : (
                <ul className="mt-4 list-none">
                  {receipt.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center justify-between gap-4 border-b border-white/8 py-2.5 last:border-b-0"
                    >
                      <span className="shrink-0 text-[0.8125rem] text-fg-faint">{row.label}</span>
                      <span className="flex min-w-0 items-center justify-end gap-2.5">
                        <span className="truncate text-right text-[0.875rem] text-fg">
                          {row.value}
                        </span>
                        {row.image ? (
                          <span className="relative size-9 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={row.image}
                              alt=""
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-[0.8125rem] text-fg-faint">Estimare orientativă</p>
                {total > 0 ? (
                  <p className="mt-1.5">
                    <span className="text-h1 tabular-nums text-lime-brand">{formatMdl(total)}</span>
                    <span className="ml-2 text-[0.9375rem] text-fg-dim">MDL</span>
                    <span className="mt-0.5 block text-[0.8125rem] text-fg-faint">
                      ≈ {formatMdl(estimateEur(settings, total))} € · prețul final, după măsurători
                    </span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-[0.9375rem] text-fg-dim">
                    Apare după ce introduci dimensiunile.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
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
