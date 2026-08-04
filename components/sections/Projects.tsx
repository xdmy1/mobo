"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { PROJECTS, PROJECTS_INDEX_HREF, type Project } from "@/lib/data";
import { DUR, EASE_IN_OUT, EASE_OUT, STAGGER, VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FILTERS = ["Toate", "Bucătărie", "Living"] as const;
type Filter = (typeof FILTERS)[number];

/** Romanian needs "de" above 19 ("21 de proiecte"), and a singular below 2. */
function projectCountLabel(n: number): string {
  if (n === 1) return "1 proiect";
  const rest = n % 100;
  return rest > 19 || rest === 0 ? `${n} de proiecte` : `${n} proiecte`;
}

/**
 * Realised projects — the page's first light band.
 *
 * The filter transition is choreographed as ONE braided event, not three
 * independent effects:
 *
 *   t=0        exits begin (fade + scale to 0.95, 180ms — a leaving card is no
 *              longer information) and survivors start travelling to their new
 *              slots (`layout` + popLayout, so they move instead of snapping).
 *   t=80ms+    newcomers arrive INTO the vacated slots, staggered by their slot
 *              index in reading order, entering from the same scale-0.95 state
 *              the exits collapse to — arrivals and departures share one
 *              grammar, so the grid reads as material being rearranged rather
 *              than two unrelated animations.
 *   t≈400ms    travel, exits and the first arrivals all settle together.
 *
 * The same hidden→visible variant also drives the first scroll reveal: the
 * grid arrives as a single tight wave (60ms stagger), so "how cards appear" is
 * one vocabulary everywhere in the section. The 0.95 entrance scale is the
 * filter grammar mirrored; at card size it does not reframe the photo crop the
 * way scale-on-reveal would on a hero image.
 *
 * The card treatment stays deliberately bare — photo + caption. The one hover
 * layer added on top of the slow photo scale is a hairline underline drawing
 * under the title, the same device as the travelling tab indicator above, so
 * hovering a card answers the filter bar's visual language and marks the whole
 * card as one link. No badges, scrims, shines or arrow buttons.
 */
export default function Projects() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("Toate");

  const projects = useMemo<Project[]>(
    () => (filter === "Toate" ? PROJECTS : PROJECTS.filter((p) => p.kind === filter)),
    [filter],
  );

  const countLabel = projectCountLabel(projects.length);

  const indicatorTransition: Transition = reduce
    ? { duration: 0 }
    : { duration: DUR.ui, ease: EASE_IN_OUT };

  /* One arrival grammar for both the scroll reveal and filter entrances.
     Under reduced motion filtering still works — pure cross-fades, no travel,
     no stagger. The 450ms arrival is content choreography, not control
     feedback; the sub-300ms budget is spent where the UI answers the click
     (tab indicator, count flip), which respond instantly. */
  const cardVariants: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: DUR.micro } },
      }
    : {
        hidden: { opacity: 0, y: 16, scale: 0.95 },
        visible: (slot: number) => ({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.45,
            ease: EASE_OUT,
            /* 80ms head start lets exits visibly clear first; then cards land
               in reading order into their slots. */
            delay: 0.08 + Math.min(slot, 5) * STAGGER,
          },
        }),
      };

  return (
    <section id="proiecte" aria-labelledby="proiecte-titlu" className="relative bg-bone-50 text-fg-invert">
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        {/* Heading and lead share a baseline rule instead of stacking
            label / heading / paragraph — that stack was repeating verbatim in
            every section on the page. */}
        <header className="flex flex-col gap-6 border-b border-ink-850/15 pb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal>
            <h2 id="proiecte-titlu" className="text-h2 text-balance max-w-[20ch]">
              Bucătării și livinguri deja montate în case reale.
            </h2>
          </Reveal>

          <Reveal index={1} className="lg:max-w-sm lg:pb-1">
            <p className="text-pretty text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
              Fiecare proiect a fost măsurat la fața locului, desenat în 3D și fabricat în
              atelierul nostru.
            </p>
          </Reveal>
        </header>

        {/* ------------------------------------------------------------ filters */}
        <Reveal index={2}>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            {/* Text tabs with a travelling underline. A segmented pill control
                filled with lime is a dashboard component, not a catalogue one. */}
            <ul
              aria-label="Filtrează proiectele după categorie"
              className="-mx-1 flex items-center gap-1"
            >
              {FILTERS.map((option) => {
                const active = option === filter;
                return (
                  <li key={option}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(option)}
                      className={cn(
                        "relative px-3 py-2 text-[0.9375rem]",
                        "transition-[color,scale] duration-[200ms] ease-out-strong active:scale-[0.97]",
                        active
                          ? "font-medium text-fg-invert"
                          : "text-fg-invert-dim hover-fine:hover:text-fg-invert",
                      )}
                    >
                      <span className="whitespace-nowrap">{option}</span>
                      {active && (
                        <motion.span
                          layoutId="proiecte-filtru-activ"
                          aria-hidden="true"
                          transition={indicatorTransition}
                          className="absolute inset-x-2 -bottom-px h-px bg-fg-invert"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* The count answers the click instantly: the old value slides up
                and out, the new one rises in — an odometer tick, well inside
                the 300ms feedback budget. aria-live sits on the static parent
                so screen readers announce the change regardless of animation. */}
            <p aria-live="polite" className="text-eyebrow text-fg-invert-dim">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={countLabel}
                  className="block"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reduce
                      ? { opacity: 0, transition: { duration: 0.1 } }
                      : { opacity: 0, y: -5, transition: { duration: 0.1, ease: EASE_OUT } }
                  }
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                >
                  {countLabel}
                </motion.span>
              </AnimatePresence>
            </p>
          </div>
        </Reveal>

        {/* --------------------------------------------------------------- grid */}
        {/* The ul only carries the variant labels; whileInView flips every card
            to `visible` at once and each card's slot-indexed delay turns that
            flip into a single tight wave. `once: true`, so after the first
            reveal the parent stays `visible` and any card mounted by a filter
            change animates hidden→visible on its own — same grammar, no
            re-trigger. */}
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="relative mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-16"
        >
          <AnimatePresence mode="popLayout">
            {projects.map((project, slot) => (
              <motion.li
                key={project.slug}
                layout={!reduce}
                variants={cardVariants}
                custom={slot}
                /* Exits run at under half the entrance and collapse to the same
                   0.95 the newcomers grow from — departures hand their scale
                   straight to arrivals. Never to 0. */
                exit={
                  reduce
                    ? { opacity: 0, transition: { duration: 0.12 } }
                    : { opacity: 0, scale: 0.95, transition: { duration: 0.18, ease: EASE_OUT } }
                }
                /* Survivor travel between slots: scripted movement, so a curve
                   rather than a spring, timed to finish alongside the first
                   arrivals so the whole rearrangement settles as one beat. */
                transition={{ layout: { duration: DUR.panel, ease: EASE_IN_OUT } }}
              >
                {/* The whole card is the link; the drawn title underline (and
                    the global focus-visible ring) is its affordance — no
                    button chrome needed. */}
                <a href={project.href} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[3px] bg-bone-200">
                    <Image
                      src={project.image}
                      alt={`${project.title} — proiect realizat de MOBO Kitchens & Home`}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                      className={cn(
                        "object-cover",
                        /* Slow ambience, not feedback — well outside the sub-300ms
                           interaction budget on purpose. */
                        "transition-[scale] duration-[600ms] ease-out-strong",
                        "hover-fine-motion:group-hover:scale-[1.03]",
                      )}
                    />
                  </div>

                  {/* Caption block: kind and title on one baseline, like a plate
                      caption in a catalogue. */}
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h3 className="text-h3 relative text-balance">
                      {project.title}
                      {/* Hairline drawing left→right under the title — the tab
                          indicator's device, reused as the card's hover/focus
                          affordance. scaleX only: transform + opacity, nothing
                          layout-affecting. Also drawn for keyboard focus. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-fg-invert",
                          "transition-transform duration-[240ms] ease-out-strong",
                          "group-focus-visible:scale-x-100 hover-fine-motion:group-hover:scale-x-100",
                        )}
                      />
                    </h3>
                    <span className="text-eyebrow shrink-0 text-fg-invert-dim">{project.kind}</span>
                  </div>

                  <p className="mt-2 text-pretty text-sm leading-[1.65] text-fg-invert-dim">
                    {project.description}
                  </p>
                </a>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <Reveal className="mt-14 border-t border-ink-850/15 pt-7">
          <a
            href={PROJECTS_INDEX_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex items-baseline gap-2 text-[0.9375rem] font-medium",
              "transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light",
            )}
          >
            Vezi toate proiectele
            <span
              aria-hidden="true"
              className="transition-transform duration-200 ease-out-strong hover-fine:group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
