"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { HERO } from "@/lib/data";
import { DUR, EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Hero — the photograph is the ground, not an element in a layout.
 *
 * The image bleeds to all four edges of the viewport; the type sits ON it,
 * anchored bottom-left where the cabinetry runs dark (the right of the frame
 * is the bright window). Legibility comes from one directional scrim rising
 * from the anchored edge only — the upper half of the photograph stays clean.
 *
 * ENTRANCE — one event, internal timing. Not four staggered fades:
 *   0.00s  photograph settles: opacity + a 1.045 → 1 scale drift
 *   0.10s  the scrim grades in over it, like a print developing
 *   0.18s  headline rises once behind its mask, while the photo still moves
 *   0.42s  supporting line + actions rise 14px into place inside that motion
 *   0.55s  the baseline hairline draws itself left → right
 *   0.70s  plate metadata fades onto the drawn line, left then right
 * Everything overlaps; the whole breath is over in ~1.3s.
 *
 * DEPTH — three planes on scroll, each compensating a different amount:
 *   photo   −6% → +6% drift and a 1 → 1.05 scale (farthest)
 *   scrim   0 → 6% of its own height, overscanned below the fold (middle)
 *   type    0 → 32px drift with a dip-out fade (nearest, in front)
 *
 * SCROLL CUE — the baseline hairline re-draws itself on a slow loop: a
 * brighter pulse grows across the rule, holds, and dissolves. No chevron.
 */

/* First clause of HERO.subtitle. The full explanatory paragraph belongs
   further down the page, not on the photograph. */
const SUBLINE = "Proiectăm și fabricăm bucătării premium și mobilier la comandă.";

/* The CTA arrow, twice: on hover the first copy exits right as the second
   slides in from the left through an overflow-hidden viewport. */
function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  /* ±6% drift inside a frame oversized by 8% on each side — the parallax can
     never expose an edge of the image. Transform only. */
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  /* A slight scale differential rides on top of the drift: the photograph
     grows into the frame as it recedes, which is what sells it as the far
     plane rather than a flat backdrop. Scaling up only ever crops tighter. */
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  /* The scrim is the middle plane. It travels less than the photograph and in
     its own measure (6% of its own height); the element overscans 10% below
     the fold so the drift can never expose the bottom edge. */
  const scrimY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  /* The type is the nearest plane: it lags the scroll slightly and dips out
     before the section has fully left, so the photograph exits clean. */
  const typeY = useTransform(scrollYProgress, [0, 1], [0, 32]);
  const typeOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="acasa"
      aria-labelledby="hero-title"
      className="grain relative h-svh min-h-[34rem] overflow-hidden bg-ink-900"
    >
      {/* ------------------------------------------------------ photograph */}
      {/* Outer plane: scroll-driven drift + scale. Inner: the one-time
          entrance settle. Nesting keeps the scrub and the entrance from
          writing to the same transform. */}
      <motion.div
        className="absolute inset-x-0 -inset-y-[8%] will-move"
        style={reduce ? undefined : { y: imageY, scale: imageScale }}
      >
        <motion.div
          className="absolute inset-0 will-move"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.045 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? DUR.micro : DUR.reveal, ease: EASE_OUT }}
        >
          <Image
            src={HERO.image}
            alt={HERO.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Directional scrim on the anchored side only — the photograph stays
          clearly visible above it. It grades in with the photo on load and
          then moves as its own plane on scroll. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-[10%] h-[82%] bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent will-move sm:h-[72%]"
        style={reduce ? undefined : { y: scrimY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? DUR.micro : DUR.reveal, ease: EASE_OUT, delay: reduce ? 0 : 0.1 }}
      />

      {/* ------------------------------------------------------------ type */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <motion.div
          className="mx-auto w-full max-w-[88rem] px-5 pb-8 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12"
          style={reduce ? undefined : { y: typeY, opacity: typeOpacity }}
        >
          {/* Mask for the rise. The 0.12em padding keeps the descenders of
              ș, ț and g from being clipped once the type has settled. */}
          <div className="-mb-[0.12em] overflow-hidden pb-[0.12em]">
            <motion.h1
              id="hero-title"
              className="text-display text-balance max-w-[18ch] will-move"
              initial={reduce ? { opacity: 0 } : { y: "104%" }}
              animate={reduce ? { opacity: 1 } : { y: 0 }}
              transition={{
                duration: reduce ? DUR.micro : DUR.reveal,
                ease: EASE_OUT,
                delay: reduce ? 0 : 0.18,
              }}
            >
              {HERO.title}
            </motion.h1>
          </div>

          {/* Supporting line + actions arrive inside the headline's motion —
              a short rise, not a separate fade after it. */}
          <motion.div
            className="will-move"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? DUR.micro : 0.6,
              ease: EASE_OUT,
              delay: reduce ? 0.05 : 0.42,
            }}
          >
            <p className="mt-5 max-w-[36rem] text-[0.9375rem] leading-relaxed text-fg-dim">
              {SUBLINE}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
              {/* Lime is MOBO's real logo colour and may carry the one primary
                  action — flat, no glow. Built by hand for the press/arrow
                  micro-motion: scale acknowledges pointer-down, the arrow
                  swaps through an overflow mask on hover. */}
              <a
                href={HERO.primaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group inline-flex h-[3.25rem] items-center gap-2.5 rounded-pill bg-lime-brand px-7",
                  "text-[0.9375rem] font-medium whitespace-nowrap text-lime-ink select-none",
                  "transition-[scale,background-color] duration-[160ms] ease-out-strong",
                  "active:scale-[0.97]",
                  "hover-fine:hover:bg-lime-hi",
                )}
              >
                {HERO.primaryCta.label}
                <span aria-hidden="true" className="relative size-4 shrink-0 overflow-hidden">
                  <ArrowGlyph
                    className={cn(
                      "absolute inset-0",
                      "transition-transform duration-[220ms] ease-out-strong",
                      "hover-fine:group-hover:translate-x-[150%]",
                    )}
                  />
                  <ArrowGlyph
                    className={cn(
                      "absolute inset-0 -translate-x-[150%]",
                      "transition-transform duration-[220ms] ease-out-strong",
                      "hover-fine:group-hover:translate-x-0",
                    )}
                  />
                </span>
              </a>

              {/* Clearly subordinate: a quiet text link on a hairline rule that
                  brightens by a second hairline scaling in over it. */}
              <a
                href={HERO.secondaryCta.href}
                className={cn(
                  "group relative inline-flex h-11 items-center text-[0.9375rem] font-medium text-fg-dim",
                  "transition-colors duration-200 ease-out-strong",
                  "hover-fine:hover:text-fg",
                )}
              >
                {HERO.secondaryCta.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-1.5 h-px bg-white/30"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 bottom-1.5 h-px origin-left scale-x-0 bg-fg",
                    "transition-transform duration-[240ms] ease-out-strong",
                    "hover-fine:group-hover:scale-x-100",
                    "group-focus-visible:scale-x-100",
                  )}
                />
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Editorial baseline: a hairline running the full bleed width, with
            the plate metadata sitting on it. The rule draws itself in as the
            closing beat of the entrance, then keeps slowly re-drawing as a
            brighter pulse — the scroll cue, instead of a bouncing chevron. */}
        <div className="relative">
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px origin-left bg-white/15 will-move"
            initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
            animate={reduce ? { opacity: 1 } : { scaleX: 1 }}
            transition={{
              duration: reduce ? DUR.micro : 0.7,
              ease: EASE_OUT,
              delay: reduce ? 0.1 : 0.55,
            }}
          />
          {!reduce && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px origin-left bg-white/60 will-move"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1, 1, 1], opacity: [0, 0.7, 0.7, 0] }}
              transition={{
                duration: 4.2,
                times: [0, 0.68, 0.85, 1],
                ease: [EASE_IN_OUT, "linear", "easeOut"],
                delay: 1.8,
                repeat: Infinity,
                repeatDelay: 1.6,
              }}
            />
          )}
          <div className="mx-auto flex w-full max-w-[88rem] items-baseline justify-between gap-6 px-5 py-4 font-mono text-[0.6875rem] tracking-[0.12em] uppercase text-fg-dim sm:px-8 lg:px-12">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: reduce ? 0.1 : 0.7 }}
            >
              Bucătărie la comandă
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: reduce ? 0.1 : 0.78 }}
            >
              {HERO.location}
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
}
