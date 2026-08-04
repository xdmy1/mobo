"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { HERO, SITE } from "@/lib/data";
import { DUR, EASE_IN_OUT, EASE_OUT } from "@/lib/motion";

/**
 * OutroA — "Title card knockout".
 *
 * The kitchen photograph plays INSIDE the letterforms of MOBO; everything
 * outside the word is the page's darkest band. Scrolling in performs a slow
 * dolly: the photo settles from 1.18 → 1.0 behind the type while the title
 * plate itself drifts a couple of percent the other way, so the letters read
 * as a separate plane, not a flat zoom. A single specular sweep crosses the
 * letterforms once, as the card locks in.
 *
 * Knockout technique: an SVG <mask> (white field, black word) applied to an
 * ink-950 rect. The photograph is a normal next/image BEHIND the SVG; the
 * masked rect punches the word out of the dark plate. Because the word is
 * SVG <text> with textLength + lengthAdjust="spacingAndGlyphs", it occupies
 * EXACTLY 940/1000 of the viewBox at every viewport width and with any font
 * (webfont loaded or fallback) — the final "O" can never be clipped, from
 * 320px to 2560px.
 */

/* Module-level so it exists exactly once. A duplicate mask id anywhere else
   in the document would silently break the knockout. */
const MASK_ID = "outro-a-knockout-mask";

/* viewBox geometry. 260 tall (not 300): Geist caps at fontSize 300 stand
   ~216 units, leaving ~22 units of guaranteed clearance above and below —
   MOBO has no ascenders/descenders, so vertical clipping is impossible too. */
const VB_W = 1000;
const VB_H = 260;

export default function OutroA() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [locked, setLocked] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    /* "end end" completes when the section's bottom meets the viewport
       bottom — reachable regardless of how short the footer below is. */
    offset: ["start end", "end end"],
  });

  /* The dolly. Never below 1, so the photo can never expose an edge. */
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  /* Counter-drift of the title plate. The plate is overscanned 6% per side;
     2.5% of its own height ≈ 2.8% of the section — the overscan always wins,
     so the drift can never reveal the photo past the plate's edges. */
  const plateY = useTransform(scrollYProgress, [0, 1], ["2.5%", "0%"]);
  /* Brightness lift, done as opacity on an ink veil rather than filter —
     opacity composites on the GPU, filter would repaint the 4032px photo. */
  const veilOpacity = useTransform(scrollYProgress, [0, 0.85], [0.45, 0]);

  /* Fire the one-shot sweep as the card locks in (~72% scrubbed). State only
     ever flips forward, so the sweep plays exactly once. */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduce && !locked && v >= 0.72) setLocked(true);
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="outro-a-brand"
      className="grain relative h-[82svh] min-h-[30rem] overflow-hidden bg-ink-950"
    >
      {/* The brand name for assistive tech — the SVG word is decorative. */}
      <h2 id="outro-a-brand" className="sr-only">
        {SITE.shortName} — {SITE.tagline}
      </h2>

      {/* Everything visual is one aria-hidden composition. The wrapper fade is
          the whole entrance under reduced motion; otherwise it just softens
          the image pop-in while the scrub takes over. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          duration: reduce ? DUR.panel : DUR.reveal,
          ease: EASE_OUT,
        }}
      >
        {/* ---------------------------------------------------- photograph */}
        {/* HERO.image is PHOTO.kitchenWide in lib/data.ts —
            mobo.md/.../Bucatarie-la-comanda-MOBO31.jpg */}
        <motion.div
          className="absolute inset-0 will-move"
          style={reduce ? undefined : { scale: photoScale }}
        >
          <Image
            src={HERO.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/* Ink veil = the brightness lift (opacity, not filter). Skipped under
            reduced motion so the static card shows the photo at full level. */}
        {!reduce && (
          <motion.div
            className="absolute inset-0 bg-ink-950 will-move"
            style={{ opacity: veilOpacity }}
          />
        )}

        {/* One-shot specular sweep. A gradient overlay is used here (allowed
            as a one-shot cinematic accent): it sits between the photo and the
            plate, so it is only ever visible through the letterforms, and it
            animates transform only — the gradient's transparent ends handle
            its own fade in/out. mix-blend-screen makes it read as light on
            the photograph rather than a white smear. */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-0 w-[45%] mix-blend-screen will-move"
            initial={{ x: "-130%", skewX: -14 }}
            animate={locked ? { x: "270%", skewX: -14 } : undefined}
            transition={{ duration: 1.7, ease: EASE_IN_OUT, delay: 0.15 }}
          >
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          </motion.div>
        )}

        {/* --------------------------------------------------- title plate */}
        {/* Overscanned 6% per vertical side so its own drift (max ~2.8% of
            the section) can never expose the photo above or below it. The
            flex spacers ARE the dark field around the word band. */}
        <motion.div
          className="absolute inset-x-0 -inset-y-[6%] flex flex-col justify-center will-move"
          style={reduce ? undefined : { y: plateY }}
        >
          <div className="min-h-0 flex-1 bg-ink-950" />
          {/* -my-px overlaps the spacers by 1px: subpixel layout rounding can
              otherwise leave a hairline of photo between svg and divs. */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="-my-px block h-auto w-full shrink-0"
          >
            <defs>
              <mask
                id={MASK_ID}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={VB_W}
                height={VB_H}
              >
                {/* White = plate stays; black word = plate knocked out. */}
                <rect width={VB_W} height={VB_H} fill="#fff" />
                <text
                  x={VB_W / 2}
                  y={238}
                  textAnchor="middle"
                  textLength={940}
                  lengthAdjust="spacingAndGlyphs"
                  fontSize={300}
                  fontWeight={600}
                  letterSpacing="-0.02em"
                  style={{
                    fontFamily:
                      "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
                  }}
                  fill="#000"
                >
                  {SITE.shortName}
                </text>
              </mask>
            </defs>
            <rect
              width={VB_W}
              height={VB_H}
              className="fill-ink-950"
              mask={`url(#${MASK_ID})`}
            />
          </svg>
          <div className="min-h-0 flex-1 bg-ink-950" />
        </motion.div>
      </motion.div>
    </section>
  );
}
