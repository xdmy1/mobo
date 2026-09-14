"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Counter } from "@/components/ui/Counter";
import { useI18n } from "@/components/ui/LangProvider";
import { Reveal } from "@/components/ui/Reveal";
import { STATS } from "@/lib/data";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { DUR, EASE_OUT, VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Why-MOBO + proof numbers.
 *
 * The section that closes the page back down into dark, so it carries the
 * argument in typography alone: seven full-ink statements on hairline rules,
 * the material tiers as three short columns, the stats as large bare tabular
 * numerals on a single rule. No chips, no glass, no icons.
 *
 * What makes the restraint feel deliberate is the choreography. The whole
 * advantage list is one event on one viewport trigger: each hairline draws
 * left-to-right and its statement rises in ~120ms behind it, rows offset by
 * 70ms so the rules run down the list as a single wave. The stats block
 * repeats the gesture at larger scale — the full-width rule draws first,
 * then the four numerals rise onto it and count up.
 *
 * The only visual anchor is a column of small tabular index numerals (01–07)
 * — informational, not decorative — and lime appears exactly once, on the
 * 5-year warranty figure, because that is the brand's core promise.
 */

/** Row offset inside the list cascade — close enough that the rules overlap
 *  into one continuous wave instead of seven separate reveals. */
const ROW_STEP = 0.07;
/** The statement trails its rule just enough to read as "rule, then words". */
const TEXT_LAG = 0.12;

/** Hairline draw: scaleX from the left, the standard rule-drawing gesture.
 *  Under reduced motion the rule simply fades — no travel. */
function ruleVariants(reduce: boolean, delay: number): Variants {
  return reduce
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: DUR.micro } },
      }
    : {
        hidden: { scaleX: 0 },
        visible: {
          scaleX: 1,
          transition: { duration: DUR.reveal, ease: EASE_OUT, delay },
        },
      };
}

/** House rise-and-fade, with an explicit slot in the section's timeline. */
function riseVariants(reduce: boolean, delay: number): Variants {
  return reduce
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: DUR.micro } },
      }
    : {
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR.reveal, ease: EASE_OUT, delay },
        },
      };
}

/** The material-tier rules brighten as the tier rises — the hairline itself
 *  encodes Standard → Optim → Premium, so no badge or pill is needed. */
const TIER_RULE = ["border-white/15", "border-white/35", "border-white/60"];

/* Cele trei trepte, în ordinea în care urcă. Numele lor se traduc (Standard →
   Стандарт), deci vin din dicționar, nu din constanta de date. */
const TIER_NAME_KEYS = [
  "tier.standard.name",
  "tier.optim.name",
  "tier.premium.name",
] as const satisfies readonly TranslationKey[];

/* Cele șapte angajamente, în ordinea din listă. */
const ADVANTAGE_KEYS = [
  "advantage.0",
  "advantage.1",
  "advantage.2",
  "advantage.3",
  "advantage.4",
  "advantage.5",
  "advantage.6",
] as const satisfies readonly TranslationKey[];

/* Sufixul și eticheta fiecărei cifre de probă; valoarea rămâne în STATS. */
const STAT_KEYS = [
  { suffix: "stat.0.suffix", label: "stat.0.label" },
  { suffix: "stat.1.suffix", label: "stat.1.label" },
  { suffix: "stat.2.suffix", label: "stat.2.label" },
  { suffix: "stat.3.suffix", label: "stat.3.label" },
] as const satisfies readonly { suffix: TranslationKey; label: TranslationKey }[];

export default function WhyMobo() {
  const reduce = useReducedMotion() ?? false;
  const { t } = useI18n();

  return (
    <section
      id="avantaje"
      aria-labelledby="avantaje-title"
      className="grain relative bg-ink-900 py-24 sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* ------------------------------------------------------ pitch -- */}
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-eyebrow text-fg-faint">{t("sections.why.eyebrow")}</p>
            </Reveal>

            <Reveal index={1}>
              <h2 id="avantaje-title" className="text-h2 mt-6 text-balance text-fg">
                {t("sections.why.title")}
              </h2>
            </Reveal>

            <Reveal index={2}>
              <p className="text-body mt-6 max-w-[46ch] text-pretty text-fg-dim">
                {t("sections.why.lead")}
              </p>
            </Reveal>

            <Reveal index={3}>
              <div className="mt-14">
                <p className="text-eyebrow text-fg-faint">{t("sections.why.materials")}</p>
                {/* Three short columns, each standing on its own hairline — the
                    same "content on a rule" language as the stats below. */}
                <ul role="list" className="mt-5 grid max-w-sm list-none grid-cols-3 gap-x-4">
                  {TIER_NAME_KEYS.map((key, i) => (
                    <li key={key} className={cn("border-t pt-3", TIER_RULE[i])}>
                      <span className="text-[0.9375rem] font-medium text-fg">{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* ------------------------------------------------- advantages -- */}
          <div className="lg:col-span-6 lg:col-start-7">
            {/* One trigger for the whole list: rules and statements share a
                single timeline, so the column reads as one drawn event. */}
            <motion.ul
              role="list"
              className="list-none"
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
            >
              {ADVANTAGE_KEYS.map((advantage, i) => (
                <li key={advantage} className="relative py-5 sm:py-6">
                  {i > 0 && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-px origin-left bg-white/8"
                      variants={ruleVariants(reduce, i * ROW_STEP)}
                    />
                  )}
                  <motion.div
                    className="flex items-baseline gap-4 sm:gap-5"
                    variants={riseVariants(reduce, i * ROW_STEP + TEXT_LAG)}
                  >
                    {/* The section's one anchor: a quiet index column. It is
                        information (seven commitments, in order), not décor,
                        and it rhymes with the numbered 9-step process. */}
                    <span
                      aria-hidden="true"
                      className="w-7 shrink-0 font-mono text-[0.6875rem] leading-none tracking-[0.08em] text-fg-faint tabular-nums"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-h3 text-pretty text-fg">{t(advantage)}</p>
                  </motion.div>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>

        {/* ------------------------------------------------------- stats -- */}
        {/* The list's gesture at full scale: the rule draws across the page,
            then the four proof numerals rise onto it and count up. Hairline
            verticals divide the columns so the block reads as a ledger. */}
        <motion.div
          className="mt-20 lg:mt-28"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <motion.div
            aria-hidden="true"
            className="h-px origin-left bg-white/10"
            variants={ruleVariants(reduce, 0)}
          />
          <ul
            role="list"
            className="grid list-none grid-cols-2 gap-x-6 gap-y-12 pt-10 sm:pt-12 lg:grid-cols-4 lg:gap-x-10"
          >
            {STATS.map((stat, i) => (
              <motion.li
                key={STAT_KEYS[i].label}
                variants={riseVariants(reduce, 0.1 + i * 0.08)}
                className={cn(
                  i === 1 && "border-l border-white/8 pl-6 lg:pl-10",
                  i === 2 && "lg:border-l lg:border-white/8 lg:pl-10",
                  i === 3 && "border-l border-white/8 pl-6 lg:pl-10",
                )}
              >
                <Counter
                  value={stat.value}
                  suffix={t(STAT_KEYS[i].suffix)}
                  className={cn(
                    "block text-[clamp(2.5rem,5vw,4rem)] leading-none font-medium tracking-[-0.02em] tabular-nums",
                    /* Lime lands on the warranty alone — the core promise. */
                    i === 0 ? "text-lime-brand" : "text-fg",
                  )}
                />
                <span className="text-eyebrow mt-4 block leading-[1.6] text-balance text-fg-dim">
                  {t(STAT_KEYS[i].label)}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
