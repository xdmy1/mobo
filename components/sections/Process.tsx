"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { PROCESS, type Step } from "@/lib/data";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The nine-step process.
 *
 * Two earlier attempts failed in opposite directions, and this is the midpoint:
 * dark ground, material glass cards, and ONE continuous rail down the left
 * gutter. The rail sits beside the cards, so unlike the first attempt's
 * per-card connector there is no geometry in which it can cross content.
 *
 * What travels between the cards (all transform/opacity, all scrubbed):
 *   - the fill is a comet, not a bar: a gradient that is brightest at its
 *     leading edge and dims into the trail behind it;
 *   - a short light pulse rides the leading edge down the rail — measured
 *     against the track and moved with translateY only;
 *   - each node ignites as the edge reaches it: its shell and number cross-fade
 *     from dim graphite ink to lime (opacity-only, so no paint-property
 *     animation), with a small expanding ring acknowledging the arrival;
 *   - passed nodes stay lit, so the column reads as accumulated progress, and
 *     the rail visually terminates AT step 09 — the guarantee is the terminus.
 */

/** Height of the travelling light pulse, px. Static style — never animated. */
const PULSE_H = 44;

type StepRowProps = { step: Step; final: boolean };

/**
 * Own component so each row can own its `useScroll` — hooks cannot live in the
 * map. Everything on the node is SCRUBBED, not fired once, so it stays in
 * lockstep with the rail's leading edge in both scroll directions. Only the
 * card entrance fires once — content should not fade back out while re-reading.
 */
function StepRow({ step, final }: StepRowProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 0.85", "start 0.6"],
  });

  /* The rail's leading edge crosses this node at roughly p ≈ 0.43 of the row
     window, so the ignition ramps are anchored there: approach lightens the
     node, contact ignites the lime ink, the ring blooms just after contact. */
  const nodeOpacity = useTransform(scrollYProgress, [0, 0.55], [0.45, 1]);
  const nodeScale = useTransform(scrollYProgress, [0, 0.62, 1], [0.94, 1.06, 1]);
  const litInk = useTransform(scrollYProgress, [0.42, 0.78], [0, 1]);
  const ringOpacity = useTransform(scrollYProgress, [0.42, 0.66, 1], [0, 0.55, 0]);
  const ringScale = useTransform(scrollYProgress, [0.42, 1], [1, 1.65]);

  return (
    <li
      ref={rowRef}
      className="relative grid grid-cols-[2.75rem_1fr] gap-x-4 sm:grid-cols-[4.5rem_1fr] sm:gap-x-6"
    >
      {/* In the final row, the rail must not run on past its terminus: this
          strip repaints the section ground over the track below node 09, so
          the line visibly ENDS at the guarantee. The travelling pulse slips
          under it at the end — absorbed by the last node. */}
      {final && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-16 w-11 bg-ink-900 sm:w-[4.5rem]"
        />
      )}

      {/* --- node sitting on the rail ------------------------------------- */}
      <motion.div
        className="relative z-10 flex justify-center pt-5"
        style={reduce ? undefined : { opacity: nodeOpacity, scale: nodeScale }}
      >
        <span className="relative grid size-11 place-items-center">
          {/* Resting shell: dim graphite. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-pill border border-white/12 bg-ink-800"
          />
          {/* Lit shell, cross-faded in as the edge arrives — opacity-only, so
              no border-color or background paint animation. Step 09 ignites
              as a solid lime slab; the rest hold a lime outline. */}
          <motion.span
            aria-hidden="true"
            style={reduce ? undefined : { opacity: litInk }}
            className={cn(
              "absolute inset-0 rounded-pill",
              final
                ? "bg-lime-brand"
                : "border border-lime-brand/45 bg-lime-brand/10",
            )}
          />
          {/* Arrival ring: blooms outward from the pill edge and dissolves.
              Scrubbed like everything else, so it reverses cleanly. */}
          {!reduce && (
            <motion.span
              aria-hidden="true"
              style={{ opacity: ringOpacity, scale: ringScale }}
              className="will-move absolute inset-0 rounded-pill border border-lime-brand/50"
            />
          )}
          {/* The number, twice: resting ink below, lime ink cross-faded above. */}
          <span className="relative font-mono text-[0.8125rem] tabular-nums text-fg-dim [grid-area:1/1]">
            {step.n}
          </span>
          <motion.span
            aria-hidden="true"
            style={reduce ? undefined : { opacity: litInk }}
            className={cn(
              "relative font-mono text-[0.8125rem] tabular-nums [grid-area:1/1]",
              final ? "text-lime-ink" : "text-lime-brand",
            )}
          >
            {step.n}
          </motion.span>
        </span>
      </motion.div>

      {/* --- card ---------------------------------------------------------- */}
      <div className="pb-5">
        {/* Slides in FROM the rail side, as if the line delivered it. The
            glass element itself is the animated element — wrapping it in an
            opacity-animating parent would flatten the backdrop blur. */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reduce ? DUR.micro : 0.7, ease: EASE_OUT }}
          className={cn("glass rounded-card p-5 sm:p-6", final && "glass-lime")}
        >
          <div className="flex items-center gap-3.5">
            {/* The source icons are generic dark line-art PNGs; bare, they
                read as an afterthought. Set into a recessed graphite well —
                inset shadow, hairline border — they read as etched hardware
                keys instead, which is what makes the treatment deliberate. */}
            <span
              aria-hidden="true"
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-[0.625rem] border bg-ink-900/45 shadow-[inset_0_2px_4px_rgb(0_0_0/0.35)]",
                final ? "border-lime-brand/25" : "border-white/10",
              )}
            >
              <Image
                src={step.icon}
                alt=""
                width={16}
                height={16}
                className="size-4 opacity-75 invert"
                unoptimized
              />
            </span>
            <h3 className="text-h3 text-fg">{step.title}</h3>
          </div>
          <p className="text-pretty mt-3 text-[0.9375rem] leading-[1.65] text-fg-dim">
            {step.description}
          </p>
        </motion.div>
      </div>
    </li>
  );
}

export default function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /* The rail tracks the list itself, so it begins drawing as the first card
     arrives and completes on the last — not on arbitrary section padding. */
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.8", "end 0.75"],
  });

  /* The pulse needs the track's pixel height to ride the leading edge with
     translateY. Held as a MotionValue so the transform below re-derives on
     resize without re-rendering. Measuring layout is fine — animating it
     would not be. */
  const trackH = useMotionValue(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => trackH.set(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [trackH]);

  /* Bottom of the pulse == leading edge of the fill, clamped inside the track. */
  const pulseY = useTransform(() => {
    const h = trackH.get();
    if (h <= 0) return 0;
    return Math.min(Math.max(scrollYProgress.get() * h - PULSE_H, 0), h - PULSE_H);
  });
  const pulseOpacity = useTransform(() => {
    if (trackH.get() <= 0) return 0;
    const v = scrollYProgress.get();
    return v <= 0 ? 0 : Math.min(v / 0.04, 1);
  });

  return (
    <section
      id="servicii"
      aria-labelledby="servicii-title"
      className="grain relative bg-ink-900 py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[76rem] px-5 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal>
            <h2 id="servicii-title" className="text-h2 text-balance max-w-[20ch] text-fg">
              Nouă etape clare, de la prima discuție până la montajul final.
            </h2>
          </Reveal>
          <Reveal index={1} className="lg:max-w-sm lg:pb-1">
            <p className="text-pretty text-[0.9375rem] leading-[1.7] text-fg-dim">
              Fiecare proiect trece prin același traseu, fără improvizații. Știi tot timpul la ce
              etapă ești — iar la capăt rămâne garanția de 5 ani.
            </p>
          </Reveal>
        </header>

        <div className="relative mt-12 sm:mt-14">
          {/* The rail. Sits behind the nodes and beside the cards, so unlike
              the old per-card connector there is no geometry in which it can
              cross content. Centred on the node column at each breakpoint:
              half of 2.75rem / 4.5rem, minus the hairline. */}
          <div
            ref={trackRef}
            aria-hidden="true"
            className="absolute inset-y-0 left-[1.34rem] w-px bg-white/10 sm:left-[2.22rem]"
          >
            {/* The fill — a comet, not a bar. The gradient rides the scaleY,
                so the drawn length is always brightest at its leading edge and
                dims into the trail; fully drawn, the brightest point rests on
                step 09. Under reduced motion it renders fully drawn. */}
            <motion.span
              style={{
                scaleY: reduce ? 1 : scrollYProgress,
                background:
                  "linear-gradient(to top, var(--color-lime-hi) 0%, var(--color-lime-brand) 12%, rgb(204 223 16 / 0.45) 100%)",
              }}
              className="will-move absolute inset-0 origin-top"
            />
            {/* The travelling light: a short streak whose foot sits exactly on
                the leading edge, so between cards you watch it run down the
                empty gutter. translateY only — height is a static style. */}
            {!reduce && (
              <motion.span
                style={{
                  y: pulseY,
                  opacity: pulseOpacity,
                  height: PULSE_H,
                  background:
                    "linear-gradient(to bottom, rgb(223 242 60 / 0) 0%, var(--color-lime-hi) 100%)",
                }}
                className="will-move absolute left-0 top-0 w-px"
              />
            )}
          </div>

          <ol ref={listRef} className="relative">
            {PROCESS.map((step, i) => (
              <StepRow key={step.n} step={step} final={i === PROCESS.length - 1} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
