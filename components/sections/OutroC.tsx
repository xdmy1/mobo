"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { HERO } from "@/lib/data";
import { DUR, EASE_OUT, VIEWPORT } from "@/lib/motion";

/**
 * OutroC — "Scrubbed pull-back".
 *
 * The user's scroll IS the camera. A 220svh section holds a sticky h-svh stage;
 * scrubbing through it pulls the shot back from inside the letterforms of MOBO
 * (cropped, unreadable, the kitchen pressed close behind) until the wordmark
 * settles full-width over the darkened photograph, and the tagline resolves on
 * a hairline beneath it.
 *
 * Three layers move at different rates so it reads as a camera move with depth,
 * not one uniform zoom — the "closer" a layer, the more it travels:
 *   photo (far)      scale 1.45 → 1      settles by 80% of the scrub
 *   wordmark (near)  scale 3.60 → 1      settles by 88%, with a lateral drift
 *   tagline (UI)     fades + rises last  72% → 92%
 * The maps are plain linear useTransform — no springs on the scrub, so it stays
 * 1:1 with the finger/wheel.
 */

const BRAND_LABEL = "MOBO Kitchens & Home — Bucătării la comandă, Chișinău";
const TAGLINE = "Bucătării la comandă · Chișinău";

const TAGLINE_CLASS =
  "mt-4 text-center font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-fg-dim";

/* On ultrawide-but-short windows a full-bleed wordmark plus tagline could grow
   taller than the h-svh stage; capping width at 300svh keeps the whole lock-up
   inside the frame (word height ≈ 23% of width → ≤ ~70svh). Inert elsewhere. */
const FRAME_MAX = "max-w-[300svh]";

/**
 * The wordmark is an SVG <text> with textLength + lengthAdjust, so its advance
 * width is pinned to the viewBox: it provably cannot overflow the container at
 * any viewport width, webfont loaded or not. fontSize 305 is tuned to Geist's
 * natural advance for "MOBO" (~3.12em ≈ 952/960), so lengthAdjust only absorbs
 * a few percent of font-swap variance and never visibly distorts the glyphs.
 * overflow-visible guards vertical metric differences; caps have no
 * ascenders/descenders, so any spill is ink-only and cannot create scroll.
 */
function Wordmark() {
  return (
    <svg
      viewBox="0 0 1000 232"
      className="block w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      <text
        x="500"
        y="226"
        textAnchor="middle"
        textLength="960"
        lengthAdjust="spacingAndGlyphs"
        fontSize="305"
        fontWeight="700"
        className="fill-lime-brand"
      >
        MOBO
      </text>
    </svg>
  );
}

export default function OutroC() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* Everything is settled by 0.94, leaving the final 6% of the scrub as a held,
     locked frame before the sticky releases into the footer. */
  const photoScale = useTransform(scrollYProgress, [0, 0.8], [1.45, 1]);
  const scrimOpacity = useTransform(scrollYProgress, [0.15, 0.8], [0, 0.6]);
  const wordScale = useTransform(scrollYProgress, [0, 0.88], [3.6, 1]);
  /* Off-axis start — the camera begins inside the "M/O" join, not dead centre.
     Translate precedes scale in the transform list, so the offset is a constant
     ~5vw that eases to zero rather than being multiplied by the zoom. */
  const wordX = useTransform(scrollYProgress, [0, 0.88], ["-5%", "0%"]);
  const taglineOpacity = useTransform(scrollYProgress, [0.72, 0.92], [0, 1]);
  const taglineY = useTransform(scrollYProgress, [0.72, 0.92], [20, 0]);
  const lineScaleX = useTransform(scrollYProgress, [0.74, 0.94], [0, 1]);

  /* Reduced motion: a genuinely different render path — normal-height, never
     sticky, no scrub. The final composed frame, entering with one short fade. */
  if (reduce) {
    return (
      <section ref={sectionRef} className="relative overflow-hidden bg-ink-950">
        <h2 className="sr-only">{BRAND_LABEL}</h2>

        <div aria-hidden="true" className="grain relative">
          <div className="absolute inset-0">
            <Image
              src={HERO.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/30" />
          </div>

          <motion.div
            className={`relative mx-auto w-full ${FRAME_MAX} px-5 py-24 sm:px-8 sm:py-32 lg:px-12`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: DUR.ui, ease: EASE_OUT }}
          >
            <Wordmark />
            <div className="mt-7 h-px w-full bg-white/20 sm:mt-9" />
            <p className={TAGLINE_CLASS}>{TAGLINE}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[220svh] bg-ink-950">
      <h2 className="sr-only">{BRAND_LABEL}</h2>

      {/* The stage. Its own overflow-hidden clips the pushed-in phase, so the
          oversized layers can never widen the document. svh, not vh: mobile
          browser chrome must not crop the frame. */}
      <div aria-hidden="true" className="grain sticky top-0 h-svh overflow-hidden">
        {/* Layer 1 — the kitchen, pushed in close. Scale only: at rest it fills
            the stage exactly, so no edge is ever exposed. */}
        <motion.div className="absolute inset-0 will-move" style={{ scale: photoScale }}>
          <Image src={HERO.image} alt="" fill sizes="100vw" className="object-cover" />
        </motion.div>

        {/* Layer 2 — the room darkens into a title-card ground as we pull out. */}
        <motion.div
          className="absolute inset-0 bg-ink-950 will-move"
          style={{ opacity: scrimOpacity }}
        />

        {/* Layer 3 — the lock-up. The wordmark's transform doesn't affect
            layout, so it shrinks INTO its final slot; hairline and tagline
            already occupy their resting positions and simply resolve there. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 sm:px-8 lg:px-12">
          <div className={`w-full ${FRAME_MAX}`}>
            <motion.div className="will-move" style={{ scale: wordScale, x: wordX }}>
              <Wordmark />
            </motion.div>

            <motion.div
              className="will-move"
              style={{ opacity: taglineOpacity, y: taglineY }}
            >
              <motion.div
                className="mt-7 h-px w-full bg-white/20 will-move sm:mt-9"
                style={{ scaleX: lineScaleX }}
              />
              <p className={TAGLINE_CLASS}>{TAGLINE}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
