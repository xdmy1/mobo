"use client";

import { Fragment, useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/components/ui/LangProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import {
  CORP_OPTIONS,
  COUNTERTOP_OPTIONS,
  DEFAULT_CONFIG,
  DRAWER_OPTIONS,
  FRONT_OPTIONS,
  MECHANISM_OPTIONS,
  MODE_OPTIONS,
  ORGANIZER_OPTIONS,
  SHAPE_OPTIONS,
  TYPE_OPTIONS,
  breakdown,
  calculationRows,
  estimateEur,
  estimatePrice,
  formatMdl,
  hasCountertop,
  hasOrganizers,
  mechanismsFor,
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
 * materialul montat într-o casă adevărată), iar pe desktop configurația se
 * adună într-un panou lateral lipicios, ca un bon de configurare. A treia
 * rundă de feedback (2026-09-10): sertarele și mecanismele au primit și ele
 * fotografii de pe montaje, formele bucătăriei sunt mici planuri ale camerei
 * văzute de sus (cu chiuvetă și plită, ca la concurență), prețul se arată în
 * euro cu leii dedesubt, iar formularul de lead stă lipit de preț. Motorul de
 * preț rămâne cel din lib/calculator.ts — formula și prețurile reale ale MOBO.
 *
 * Bilingv (RO/RU): tot ce se vede pe ecran vine din dicționar — opțiunile
 * poartă `labelKey`/`blurbKey`, iar rezumatul afișat se construiește aici, din
 * chei. Ce pleacă spre CRM NU trece pe aici: `summarize(cfg)` întoarce rânduri
 * românești și ele urcă neatinse în payload, fiindcă echipa MOBO citește
 * CRM-ul în română oricare ar fi limba vizitatorului.
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

const STEP_TITLES: Record<StepId, TranslationKey> = {
  mod: "calc.step.mod.title",
  tip: "calc.step.tip.title",
  forma: "calc.step.forma.title",
  dims: "calc.step.dims.title",
  corp: "calc.step.corp.title",
  fatada: "calc.step.fatada.title",
  sertare: "calc.step.sertare.title",
  mecanisme: "calc.step.mecanisme.title",
  organizatoare: "calc.step.organizatoare.title",
  blat: "calc.step.blat.title",
  rezultat: "calc.step.rezultat.title",
};

/** Pasul „rezultat" n-are subtitlu — prețul vorbește singur. */
const STEP_HINTS: Partial<Record<StepId, TranslationKey>> = {
  mod: "calc.step.mod.hint",
  tip: "calc.step.tip.hint",
  forma: "calc.step.forma.hint",
  dims: "calc.step.dims.hint",
  corp: "calc.step.corp.hint",
  fatada: "calc.step.fatada.hint",
  sertare: "calc.step.sertare.hint",
  mecanisme: "calc.step.mecanisme.hint",
  organizatoare: "calc.step.organizatoare.hint",
  blat: "calc.step.blat.hint",
};

/**
 * Erorile rutei de lead vin ca CHEI de dicționar, nu ca proză — ruta e aceeași
 * pentru ambele limbi, deci traducerea se face aici, în limba paginii.
 *
 * Lista e închisă intenționat: un 502 de la CDN sau o pagină de proxy poate
 * întoarce orice, iar `t()` pe o cheie inexistentă n-ar avea ce interpola. Ce
 * nu recunoaștem cade pe mesajul generic, cel cu numărul de telefon.
 */
const API_ERROR_KEYS: readonly TranslationKey[] = [
  "api.error.rateLimited",
  "api.error.invalid",
  "api.error.incomplete",
  "api.error.sendFailed",
];

function apiErrorKey(value: unknown): TranslationKey | null {
  return typeof value === "string" && (API_ERROR_KEYS as readonly string[]).includes(value)
    ? (value as TranslationKey)
    : null;
}

function stepsFor(type: FurnitureType): StepId[] {
  return [
    "mod",
    "tip",
    ...(type === "bucatarie" ? (["forma"] as StepId[]) : []),
    "dims",
    "corp",
    "fatada",
    "sertare",
    ...(mechanismsFor(type).length > 0 ? (["mecanisme"] as StepId[]) : []),
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

/* Schițele formelor de bucătărie — redesenate (client, 2026-09-10: liniile
   simple nu se înțelegeau) ca mici planuri ale camerei văzute de sus, în felul
   schemelor de la proiectare: conturul e camera, banda verde e corpul de
   mobilier împărțit în module, iar chiuveta și plita sunt marcate pe traseu. */

const planBand = (x: number, y: number, w: number, h: number) => (
  <rect
    x={x}
    y={y}
    width={w}
    height={h}
    rx="1.5"
    fill="var(--color-lime-brand)"
    fillOpacity="0.15"
    stroke="var(--color-lime-brand)"
    strokeWidth="1.5"
  />
);

/* Rosturile dintre module — liniuțe discrete în interiorul benzii. */
const planSeps = (d: string) => (
  <path d={d} stroke="var(--color-lime-brand)" strokeWidth="1" opacity="0.35" />
);

const planSink = (cx: number, cy = 17.5) => (
  <g stroke="var(--color-lime-brand)" strokeWidth="1.2" opacity="0.95">
    <rect x={cx - 6} y={cy - 4.3} width="12" height="8.6" rx="1.5" />
    <circle cx={cx} cy={cy} r="1.5" />
  </g>
);

const planHob = (cx: number, cy = 17.5) => (
  <g stroke="var(--color-lime-brand)" strokeWidth="1.2" opacity="0.95">
    <circle cx={cx - 2.7} cy={cy - 2.7} r="1.6" />
    <circle cx={cx + 2.7} cy={cy - 2.7} r="1.6" />
    <circle cx={cx - 2.7} cy={cy + 2.7} r="1.6" />
    <circle cx={cx + 2.7} cy={cy + 2.7} r="1.6" />
  </g>
);

const planStool = (cx: number, cy: number) => (
  <circle cx={cx} cy={cy} r="2.6" stroke="var(--color-lime-brand)" strokeWidth="1.2" opacity="0.6" />
);

const SHAPE_PLANS: Record<KitchenShape, ReactNode> = {
  dreapta: (
    <>
      {planBand(9, 11, 102, 13)}
      {planSeps("M43 11v13M77 11v13")}
      {planSink(26)}
      {planHob(94)}
    </>
  ),
  colt: (
    <>
      {planBand(9, 11, 102, 13)}
      {planBand(9, 24, 13, 49)}
      {planSeps("M43 11v13M77 11v13M9 41h13M9 57h13")}
      {planSink(64)}
      {planHob(15.5, 49)}
    </>
  ),
  u: (
    <>
      {planBand(9, 11, 102, 13)}
      {planBand(9, 24, 13, 49)}
      {planBand(98, 24, 13, 49)}
      {planSeps("M43 11v13M77 11v13M9 41h13M9 57h13M98 41h13M98 57h13")}
      {planSink(60)}
      {planHob(104.5, 49)}
    </>
  ),
  bar: (
    <>
      {planBand(9, 11, 102, 13)}
      {planBand(9, 24, 13, 49)}
      {/* Bar-ul iese perpendicular din linie, cu scaunele alături. */}
      {planBand(62, 24, 12, 26)}
      {planSeps("M43 11v13M77 11v13M9 41h13M9 57h13")}
      {planSink(30)}
      {planHob(15.5, 49)}
      {planStool(81, 31)}
      {planStool(81, 43)}
    </>
  ),
  insula: (
    <>
      {planBand(9, 11, 102, 13)}
      {planBand(42, 44, 36, 15)}
      {planSeps("M43 11v13M77 11v13")}
      {planSink(26)}
      {planHob(60, 51.5)}
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
        rx="4"
        stroke="rgb(246 245 238 / 22%)"
        strokeWidth="1.5"
      />
      {SHAPE_PLANS[shape]}
    </svg>
  );
}

/* ------------------------------------------------------------ subcomponente */

/**
 * Un `{placeholder}` care trebuie să devină markup, nu text.
 *
 * `t(key)` fără variabile întoarce șablonul neatins, deci putem tăia exact în
 * locul marcat de traducător — așa linkul din acord și numărul din mesajul de
 * confirmare stau acolo unde cere fraza, în ambele limbi, fără să lipim bucăți
 * de propoziție în cod.
 */
function withNode(template: string, name: string, node: ReactNode): ReactNode {
  const parts = template.split(`{${name}}`);
  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? node : null}
      {part}
    </Fragment>
  ));
}

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
  image,
  label,
  blurb,
  value,
  onChange,
}: {
  icon: CalcIcon;
  /** Fotografia sistemului montat de MOBO; fără ea, rândul rămâne pe glifă. */
  image?: StaticImageData;
  label: string;
  blurb?: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const { t } = useI18n();
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
            "relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border",
            "transition-colors duration-200 ease-out-strong",
            value > 0 ? "border-lime-brand/60 text-lime-brand" : "border-white/10 text-fg-dim",
          )}
        >
          {image ? (
            <Image src={image} alt="" fill sizes="56px" placeholder="blur" className="object-cover" />
          ) : (
            <Glyph icon={icon} className="size-7" />
          )}
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
          aria-label={t("calc.counter.decrease", { item: label })}
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
          aria-label={t("calc.counter.increase", { item: label })}
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
  const { t, lang, href } = useI18n();
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
        setDimsError(t("calc.dims.error.length"));
        return;
      }
      if (!(height >= 1 && height <= 3.5)) {
        setDimsError(t("calc.dims.error.height"));
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
  }, [step, lengthText, heightText, blatText, steps.length, scrollToTop, t]);

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
      setLeadError(t("calc.lead.error.fields"));
      return;
    }

    setLeadStatus("submitting");
    setLeadError(null);

    /* Configurația pleacă în CRM ca rânduri etichetate — cerință de client:
       „să vină info completă", nu doar numele și telefonul. `summarize()` dă
       ce a ales clientul, `calculationRows()` cum a ieșit prețul (rând cu
       rând, cu tarife și coeficienți) — cerință de client (2026-09-16): „să
       meargă tot calculul". Rândurile sunt ROMÂNEȘTI și așa rămân: CRM-ul se
       citește în română chiar dacă vizitatorul a configurat pe varianta rusă;
       limba paginii pleacă separat, ca echipa să știe în ce limbă să sune. */
    try {
      const res = await fetch("/api/calculator-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          consent: lead.consent,
          rows: [...summarize(cfg), ...calculationRows(settings, cfg)],
          breakdown: breakdown(settings, cfg).lines.map((line) => ({
            label: line.label,
            detail: line.detail,
            amount: Math.round(line.amount),
          })),
          lang,
          total,
          totalEur: estimateEur(settings, total),
          _company: "",
          _startedAt: startedAt.current,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: unknown } | null;
        setLeadStatus("error");
        setLeadError(
          t(apiErrorKey(data?.error) ?? "calc.lead.error.send", { phone: SITE.phone }),
        );
        return;
      }
      setLeadStatus("success");
    } catch {
      setLeadStatus("error");
      setLeadError(t("calc.lead.error.send", { phone: SITE.phone }));
    }
  }

  const setQty = (group: "drawers" | "mechanisms" | "organizers", key: string, qty: number) =>
    setCfg((prev) => ({ ...prev, [group]: { ...prev[group], [key]: qty } }));

  /* Bonul de configurare din panoul lateral: doar pașii DEJA parcurși — panoul
     crește pe măsură ce alegi, nu divulgă pașii care urmează. */
  const receipt = useMemo(() => {
    /* Un pas absent din flux (indexOf -1) nu e „parcurs" — altfel „Mecanisme"
       apărea în bon la piese mici, unde pasul nici nu există. */
    const done = (id: StepId) => {
      const index = steps.indexOf(id);
      return index !== -1 && index < stepIndex;
    };
    const rows: { label: string; value: string; image?: StaticImageData }[] = [];

    if (done("mod")) {
      const option = MODE_OPTIONS.find((o) => o.value === cfg.mode);
      rows.push({
        label: t("calc.row.mode"),
        value: option ? t(option.labelKey) : "",
        image: option?.image,
      });
    }
    if (done("tip")) {
      rows.push({
        label: t("calc.row.type"),
        value: typeOption ? t(typeOption.labelKey) : "",
        image: typeOption?.image,
      });
    }
    if (done("forma") && cfg.type === "bucatarie") {
      const option = SHAPE_OPTIONS.find((o) => o.value === cfg.shape);
      rows.push({ label: t("calc.row.shape"), value: option ? t(option.labelKey) : "" });
    }
    if (done("dims")) {
      rows.push({
        label: t("calc.row.dims"),
        value:
          cfg.type === "bucatarie"
            ? t("calc.value.dims.depth", {
                length: cfg.lengthM,
                height: cfg.heightM,
                depth: cfg.depth,
              })
            : t("calc.value.dims", { length: cfg.lengthM, height: cfg.heightM }),
      });
    }
    if (done("corp")) {
      const option = CORP_OPTIONS.find((o) => o.value === cfg.corp);
      rows.push({ label: t("calc.row.corp"), value: option ? t(option.labelKey) : cfg.corp });
    }
    if (done("fatada")) {
      rows.push({
        label: t("calc.row.front"),
        value: frontOption ? t(frontOption.labelKey) : "",
        image: frontOption?.image,
      });
    }
    if (done("sertare")) {
      const count = Object.values(cfg.drawers).reduce((a, b) => a + b, 0);
      rows.push({
        label: t("calc.row.drawers"),
        value: count > 0 ? t("calc.value.count", { n: count }) : "—",
      });
    }
    if (done("mecanisme")) {
      const count = Object.values(cfg.mechanisms).reduce((a, b) => a + b, 0);
      rows.push({
        label: t("calc.row.mechanisms"),
        value: count > 0 ? t("calc.value.count", { n: count }) : "—",
      });
    }
    if (done("organizatoare") && hasOrganizers(cfg.type)) {
      const count = Object.values(cfg.organizers).reduce((a, b) => a + b, 0);
      rows.push({
        label: t("calc.row.organizers"),
        value: count > 0 ? t("calc.value.count", { n: count }) : "—",
      });
    }
    if (done("blat") && hasCountertop(cfg.type)) {
      const option = COUNTERTOP_OPTIONS.find((o) => o.value === cfg.countertop.brand);
      rows.push({
        label: t("calc.row.countertop"),
        value:
          cfg.countertop.m2 > 0
            ? t("calc.value.countertop", {
                label: option ? t(option.labelKey) : cfg.countertop.brand,
                area: cfg.countertop.m2,
              })
            : "—",
        image: cfg.countertop.m2 > 0 ? option?.image : undefined,
      });
    }
    return rows;
  }, [cfg, steps, stepIndex, typeOption, frontOption, t]);

  /**
   * Rezumatul complet de sub preț — perechea AFIȘATĂ a lui `summarize()`.
   *
   * Aceleași rânduri, în aceeași ordine, dar din dicționar. `summarize()` nu se
   * atinge: el rămâne pentru sârmă, în română, și e singurul care ajunge în
   * CRM. Dacă se adaugă un rând acolo, se adaugă și aici.
   */
  const summaryRows = useMemo(() => {
    const rows: { label: string; value: string }[] = [];

    const mode = MODE_OPTIONS.find((o) => o.value === cfg.mode);
    rows.push({ label: t("calc.row.mode"), value: mode ? t(mode.labelKey) : cfg.mode });
    rows.push({ label: t("calc.row.type"), value: typeOption ? t(typeOption.labelKey) : cfg.type });

    if (cfg.type === "bucatarie") {
      const shape = SHAPE_OPTIONS.find((o) => o.value === cfg.shape);
      rows.push({ label: t("calc.row.shape"), value: shape ? t(shape.labelKey) : cfg.shape });
    }

    rows.push({
      label: t("calc.row.dims"),
      value:
        cfg.type === "bucatarie"
          ? t("calc.value.dims.full.depth", {
              length: cfg.lengthM,
              height: cfg.heightM,
              depth: cfg.depth,
            })
          : t("calc.value.dims.full", { length: cfg.lengthM, height: cfg.heightM }),
    });

    const corp = CORP_OPTIONS.find((o) => o.value === cfg.corp);
    rows.push({ label: t("calc.row.corp"), value: corp ? t(corp.labelKey) : cfg.corp });
    rows.push({
      label: t("calc.row.front"),
      value: frontOption ? t(frontOption.labelKey) : cfg.front,
    });

    const drawers = DRAWER_OPTIONS.filter((o) => (cfg.drawers[`${o.brand}_${o.type}`] ?? 0) > 0)
      .map((o) =>
        t("calc.value.qty", {
          label: t(o.labelKey),
          n: cfg.drawers[`${o.brand}_${o.type}`] ?? 0,
        }),
      )
      .join(", ");
    rows.push({ label: t("calc.row.drawers"), value: drawers || "—" });

    const mechanisms = MECHANISM_OPTIONS.filter((o) => (cfg.mechanisms[o.value] ?? 0) > 0)
      .map((o) => t("calc.value.qty", { label: t(o.labelKey), n: cfg.mechanisms[o.value] ?? 0 }))
      .join(", ");
    rows.push({ label: t("calc.row.mechanisms"), value: mechanisms || "—" });

    if (hasOrganizers(cfg.type)) {
      const organizers = ORGANIZER_OPTIONS.filter((o) => (cfg.organizers[o.value] ?? 0) > 0)
        .map((o) =>
          t("calc.value.qty.detail", {
            label: t(o.labelKey),
            /* Blurb-ul distinge suporturile cu același nume; fără punctul final. */
            detail: t(o.blurbKey).replace(/\.$/, ""),
            n: cfg.organizers[o.value] ?? 0,
          }),
        )
        .join(", ");
      rows.push({ label: t("calc.row.organizers"), value: organizers || "—" });
    }

    if (hasCountertop(cfg.type)) {
      const option = COUNTERTOP_OPTIONS.find((o) => o.value === cfg.countertop.brand);
      rows.push({
        label: t("calc.row.countertop"),
        value:
          cfg.countertop.m2 > 0
            ? t("calc.value.countertop", {
                label: option ? t(option.labelKey) : cfg.countertop.brand,
                area: cfg.countertop.m2,
              })
            : "—",
      });
    }

    return rows;
  }, [cfg, typeOption, frontOption, t]);

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      };

  return (
    <section aria-label={t("calc.aria.section")} className="grain relative bg-ink-900">
      <div className="mx-auto w-full max-w-[88rem] px-5 pb-40 pt-14 sm:px-8 sm:pt-16 lg:px-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* ------------------------------------------------------- pașii -- */}
          <div ref={topRef} className="scroll-mt-28 lg:col-span-7 xl:col-span-8">
            <div className="flex items-center justify-between gap-6">
              <p className="text-eyebrow text-fg-dim">
                {t("calc.progress", {
                  current: Math.min(stepIndex + 1, steps.length),
                  total: steps.length,
                })}
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
                <h2 className="text-h1 text-balance text-fg">{t(STEP_TITLES[step])}</h2>
                {STEP_HINTS[step] ? (
                  <p className="text-pretty mt-3 max-w-[56ch] text-[0.9375rem] leading-[1.65] text-fg-dim">
                    {t(STEP_HINTS[step])}
                  </p>
                ) : null}

                {/* ----------------------------------------------------- mod */}
                {step === "mod" ? (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {MODE_OPTIONS.map((option) => (
                      <PhotoCard
                        key={option.value}
                        label={t(option.labelKey)}
                        blurb={t(option.blurbKey)}
                        image={option.image}
                        selected={cfg.mode === option.value}
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            mode: option.value,
                            /* Ca în vechiul calculator: premium pornește pe
                               placa în culoare, standart pe alb — se poate
                               schimba la pasul „Corp". */
                            corp: option.value === "premium" ? "egger_color" : "egger_alb",
                          }))
                        }
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
                        label={t(option.labelKey)}
                        blurb={t(option.blurbKey)}
                        image={option.image}
                        selected={cfg.type === option.value}
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            type: option.value,
                            organizers: {},
                            mechanisms: {},
                          }))
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
                        label={t(option.labelKey)}
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
                            {t("calc.dims.length.label")}
                          </label>
                          <input
                            id={`${uid}-len`}
                            type="text"
                            inputMode="decimal"
                            placeholder={t("calc.dims.length.placeholder")}
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
                            {t("calc.dims.height.label")}
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
                          <legend className={FIELD_LABEL}>{t("calc.dims.depth.legend")}</legend>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {([600, 900] as const).map((depth) => (
                              <button
                                key={depth}
                                type="button"
                                aria-pressed={cfg.depth === depth}
                                onClick={() => setCfg((prev) => ({ ...prev, depth }))}
                                className={CHIP(cfg.depth === depth)}
                              >
                                {t(depth === 900 ? "calc.dims.depth.900" : "calc.dims.depth.600")}
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
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {CORP_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={cfg.corp === option.value}
                        onClick={() => setCfg((prev) => ({ ...prev, corp: option.value }))}
                        className={cn(
                          "rounded-card border p-4 text-left transition-[border-color,box-shadow,transform] duration-200 ease-out-strong sm:p-5",
                          "active:scale-[0.99]",
                          cfg.corp === option.value
                            ? "border-lime-brand shadow-[0_0_28px_-6px_rgba(204,223,16,0.35)]"
                            : "border-white/10 hover-fine:hover:border-white/30",
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          {/* Mostra plăcii — alb curat vs. decoruri colorate. */}
                          <span
                            aria-hidden="true"
                            className={cn(
                              "inline-block size-3.5 shrink-0 rounded-full border border-black/20",
                              option.value === "egger_alb"
                                ? "bg-bone-50"
                                : "bg-[conic-gradient(from_0deg,#8da4c0,#b56a6a,#7d9b76,#c49a6c,#8da4c0)]",
                            )}
                          />
                          <span
                            className={cn(
                              "text-[0.9375rem] font-medium",
                              cfg.corp === option.value ? "text-lime-brand" : "text-fg",
                            )}
                          >
                            {t(option.labelKey)}
                          </span>
                        </span>
                        <span className="text-pretty mt-1.5 block text-[0.8125rem] leading-[1.55] text-fg-dim">
                          {t(option.blurbKey)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {/* -------------------------------------------------- fațadă */}
                {step === "fatada" ? (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {FRONT_OPTIONS.map((option) => (
                      <PhotoCard
                        key={option.value}
                        label={t(option.labelKey)}
                        blurb={t(option.blurbKey)}
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
                          image={option.image}
                          label={t(option.labelKey)}
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
                    {mechanismsFor(cfg.type).map((option) => (
                      <CounterRow
                        key={option.value}
                        icon={option.icon}
                        image={option.image}
                        label={t(option.labelKey)}
                        blurb={t(option.blurbKey)}
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
                        label={t(option.labelKey)}
                        blurb={t(option.blurbKey)}
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
                          label={t(option.labelKey)}
                          blurb={t(option.blurbKey)}
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
                        {t("calc.blat.area.label")}
                      </label>
                      <input
                        id={`${uid}-blat`}
                        type="text"
                        inputMode="decimal"
                        placeholder={t("calc.blat.area.placeholder")}
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
                    {/* Banner: proiectul real care seamănă cu alegerea — la
                        bucătărie, cadrul ales de client e proiectul Ialoveni. */}
                    {typeOption ? (
                      <div className="relative aspect-[21/9] overflow-hidden rounded-card">
                        <Image
                          src={typeOption.resultImage ?? typeOption.image}
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
                          {t("calc.result.banner", { type: t(typeOption.lowerKey) })}
                        </p>
                      </div>
                    ) : null}

                    <p className="text-eyebrow mt-8 text-fg-dim">{t("calc.result.eyebrow")}</p>
                    {/* Client, 2026-09-10: euro pronunțat, leii mai jos și mai mici. */}
                    <p className="mt-3">
                      <span className="text-display text-lime-brand">
                        {formatMdl(estimateEur(settings, total), lang)}
                      </span>
                      <span className="text-h3 ml-2 text-fg-dim">€</span>
                    </p>
                    <p className="mt-1 text-[0.9375rem] tabular-nums text-fg-faint">
                      {t("calc.result.mdl", { value: formatMdl(total, lang) })}
                    </p>

                    {/* --------------------------------------------- lead --
                        Formularul stă lipit de preț — client, 2026-09-10:
                        „este prea jos, și clientul poate să nu ajungă". */}
                    {leadStatus === "success" ? (
                      <div className="mt-8 rounded-card border border-white/10 bg-white/[0.03] p-6">
                        <h3 className="text-h3 text-fg">{t("calc.lead.success.title")}</h3>
                        <p className="text-pretty mt-2 max-w-[44ch] text-[0.9375rem] leading-[1.65] text-fg-dim">
                          {withNode(
                            t("calc.lead.success.body"),
                            "phone",
                            <span className="text-fg">{lead.phone}</span>,
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={restart}
                          className="mt-5 text-[0.875rem] text-fg-dim underline decoration-white/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-fg"
                        >
                          {t("calc.lead.success.again")}
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={submitLead}
                        noValidate
                        className="mt-8 rounded-card border border-white/10 bg-white/[0.03] p-6 sm:p-7"
                      >
                        <h3 className="text-h3 text-fg">{t("calc.lead.title")}</h3>
                        <div className="mt-5 grid gap-7 sm:grid-cols-2">
                          <div>
                            <label htmlFor={`${uid}-nume`} className={FIELD_LABEL}>
                              {t("calc.lead.name.label")}
                            </label>
                            <input
                              id={`${uid}-nume`}
                              type="text"
                              autoComplete="name"
                              maxLength={80}
                              placeholder={t("calc.lead.name.placeholder")}
                              value={lead.name}
                              onChange={(e) =>
                                setLead((prev) => ({ ...prev, name: e.target.value }))
                              }
                              className={CONTROL}
                            />
                          </div>
                          <div>
                            <label htmlFor={`${uid}-tel`} className={FIELD_LABEL}>
                              {t("calc.lead.phone.label")}
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
                            {withNode(
                              t("calc.lead.consent"),
                              "link",
                              <a
                                href={href("/politica-de-confidentialitate")}
                                className="underline decoration-white/30 underline-offset-2 hover-fine:hover:text-fg"
                              >
                                {t("calc.lead.consent.link")}
                              </a>,
                            )}
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
                            {leadStatus === "submitting"
                              ? t("calc.lead.submitting")
                              : t("calc.lead.submit")}
                          </button>
                          <button
                            type="button"
                            onClick={restart}
                            className="text-left text-[0.875rem] text-fg-dim underline decoration-white/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-fg sm:text-center"
                          >
                            {t("calc.lead.restart")}
                          </button>
                        </div>
                      </form>
                    )}

                    <ul className="mt-9 list-none border-t border-white/8">
                      {summaryRows.map((row) => (
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
                      {t("calc.result.note")}
                    </p>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* --------------------------------------------- bonul de config -- */}
          <aside className="hidden lg:col-span-4 lg:col-start-9 lg:block xl:col-start-9">
            <div className="sticky top-28 rounded-card-lg border border-white/10 bg-white/[0.03] p-6">
              <p className="text-eyebrow text-fg-dim">{t("calc.aside.title")}</p>

              {receipt.length === 0 ? (
                <p className="text-pretty mt-4 text-[0.875rem] leading-[1.6] text-fg-faint">
                  {t("calc.aside.empty")}
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
                <p className="text-[0.8125rem] text-fg-faint">{t("calc.aside.estimate")}</p>
                {total > 0 ? (
                  <p className="mt-1.5">
                    {/* Euro mai pronunțat, leii dedesubt — client, 2026-09-10. */}
                    <span className="text-h1 tabular-nums text-lime-brand">
                      {formatMdl(estimateEur(settings, total), lang)}
                    </span>
                    <span className="ml-2 text-[0.9375rem] text-fg-dim">€</span>
                    <span className="mt-0.5 block text-[0.8125rem] tabular-nums text-fg-faint">
                      {t("calc.aside.mdl", { value: formatMdl(total, lang) })}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-[0.9375rem] text-fg-dim">{t("calc.aside.pending")}</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ------------------------------------------------- bara de estimare */}
      {/* Sub nav (z-[90]) — bară utilitară, nu chrome. */}
      <div className="fixed inset-x-0 bottom-0 z-[70]">
        <div className="mx-auto w-full max-w-3xl px-5 pb-4 sm:px-8 sm:pb-5">
          <div className="glass flex items-center justify-between gap-4 rounded-pill py-2 pl-6 pr-2">
            <p className="min-w-0 truncate text-[0.8125rem] text-fg-dim">
              <span className="hidden sm:inline">{t("calc.bar.current")} </span>
              <span className="text-[1.0625rem] font-medium tabular-nums text-fg">
                {total > 0 ? `${formatMdl(estimateEur(settings, total), lang)} €` : "—"}
              </span>
              {total > 0 ? (
                <span className="ml-2 hidden tabular-nums text-fg-faint sm:inline">
                  {t("calc.result.mdl", { value: formatMdl(total, lang) })}
                </span>
              ) : null}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex h-11 select-none items-center rounded-pill px-4 text-[0.875rem] text-fg-dim transition-colors duration-150 ease-out-strong hover-fine:hover:text-fg"
                >
                  {t("calc.bar.back")}
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
                  {t("calc.bar.next")}
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
