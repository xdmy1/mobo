"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { ADVANTAGES, MATERIALS, STATS } from "@/lib/data";
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

export default function WhyMobo() {
  const reduce = useReducedMotion() ?? false;

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
              <p className="text-eyebrow text-fg-faint">De ce MOBO</p>
            </Reveal>

            <Reveal index={1}>
              <h2 id="avantaje-title" className="text-h2 mt-6 text-balance text-fg">
                Fiecare detaliu este gândit, nu improvizat.
              </h2>
            </Reveal>

            <Reveal index={2}>
              <p className="text-body mt-6 max-w-[46ch] text-pretty text-fg-dim">
                De la primul proiect 3D până la verificarea finală făcută împreună cu tine, fiecare
                etapă are un termen clar și un contract transparent în spate.
              </p>
            </Reveal>

            <Reveal index={3}>
              <div className="mt-14">
                <p className="text-eyebrow text-fg-faint">Trei categorii de materiale</p>
                {/* Three short columns, each standing on its own hairline — the
                    same "content on a rule" language as the stats below. */}
                <ul role="list" className="mt-5 grid max-w-sm list-none grid-cols-3 gap-x-4">
                  {MATERIALS.map((material, i) => (
                    <li key={material} className={cn("border-t pt-3", TIER_RULE[i])}>
                      <span className="text-[0.9375rem] font-medium text-fg">{material}</span>
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
              {ADVANTAGES.map((advantage, i) => (
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
                    <p className="text-h3 text-pretty text-fg">{advantage}</p>
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
                key={stat.label}
                variants={riseVariants(reduce, 0.1 + i * 0.08)}
                className={cn(
                  i === 1 && "border-l border-white/8 pl-6 lg:pl-10",
                  i === 2 && "lg:border-l lg:border-white/8 lg:pl-10",
                  i === 3 && "border-l border-white/8 pl-6 lg:pl-10",
                )}
              >
                <Counter
                  value={stat.value}
                  suffix={stat.suffix}
                  className={cn(
                    "block text-[clamp(2.5rem,5vw,4rem)] leading-none font-medium tracking-[-0.02em] tabular-nums",
                    /* Lime lands on the warranty alone — the core promise. */
                    i === 0 ? "text-lime-brand" : "text-fg",
                  )}
                />
                <span className="text-eyebrow mt-4 block leading-[1.6] text-balance text-fg-dim">
                  {stat.label}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
