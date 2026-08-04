"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { HERO, SITE } from "@/lib/data";

/**
 * "Soft-close" — the brand outro, staged as a film title card.
 *
 * Two ideas carry it, and neither is a zoom.
 *
 * 1. THE FRAME BECOMES CINEMA.
 *    The single strongest signal that you are watching a film is not motion, it
 *    is the shape of the frame. As the section enters, black anamorphic bars
 *    slide in and crop the viewport to 2.39:1. The page literally changes
 *    aspect ratio. Everything after that reads as footage.
 *
 * 2. THE EASING IS THE PRODUCT.
 *    MOBO makes cabinets, and the feature a customer physically remembers from
 *    a showroom is the soft-close mechanism — a door that catches itself and
 *    settles slowly instead of slamming. So the wall of cabinet fronts parts on
 *    a soft-close curve, heavily decelerated at the end. The motion means
 *    something specific to this manufacturer; it is not a generic reveal.
 *
 * Behind the fronts, the kitchen is visible *through* the letterforms, with a
 * specular rake travelling across them like light across a lacquered door.
 *
 * Clipping: the wordmark sits in a viewBox with `textLength` +
 * `lengthAdjust="spacingAndGlyphs"`, so it occupies an exact width at every
 * viewport size whether or not the webfont has loaded. It cannot overflow the
 * frame and cannot widen the document.
 */

const MASK_ID = "outro-d-letter-mask";
const RAKE_ID = "outro-d-rake";
const VIGNETTE_ID = "outro-d-vignette";
const PANELS = 6;

/** Anamorphic 2.39:1 leaves roughly this much of a 16:9 viewport as bar, each side. */
const BAR = "13%";

/**
 * Soft-close. Nearly all the travel happens early, then it creeps home.
 * Deliberately more decelerated than the house ease-out — a drawer catching
 * itself is the entire point of the gesture.
 */
const softClose = (t: number) => 1 - Math.pow(1 - t, 5);

/**
 * Outermost fronts lead, alternating up and down, so the wall parts.
 * 130% rather than 108%: at 108% a front's leading edge was still landing within
 * a subpixel of the frame boundary at some viewport heights, leaving a hairline
 * stranded across the shot. The extra travel is free — it is off-frame either way.
 */
const panelOffset = (i: number) => (i % 2 === 0 ? "-130%" : "130%");
const panelDelay = (i: number) => {
  const fromCentre = Math.abs(i - (PANELS - 1) / 2);
  return (PANELS / 2 - fromCentre) * 0.05;
};

function CabinetFront({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const start = 0.14 + panelDelay(index);
  const y = useTransform(progress, [start, start + 0.4], ["0%", panelOffset(index)], {
    ease: softClose,
  });

  const bottomEdge = index % 2 === 0;

  return (
    <motion.div className="relative h-full flex-1 will-change-transform" style={{ y }}>
      <div className="absolute inset-0 bg-ink-900" />
      {/* Seam against the neighbouring door. */}
      <div className="absolute inset-y-0 left-0 w-px bg-white/8" />
      {/* Light catching the leading edge as it travels. */}
      <div
        className={`absolute inset-x-0 h-px bg-white/18 ${bottomEdge ? "bottom-0" : "top-0"}`}
      />
      {/* Handleless grip channel — the detail that makes it read as a cabinet
          front rather than a rectangle. It is what MOBO actually builds. */}
      <div
        className={`absolute inset-x-[16%] h-[3px] rounded-full bg-ink-950/85 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.10)] ${
          bottomEdge ? "bottom-[7%]" : "top-[7%]"
        }`}
      />
    </motion.div>
  );
}

export default function OutroD() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  /* Distinct rates, so it reads as a camera move with depth, not one zoom. */
  const barScale = useTransform(scrollYProgress, [0, 0.16], [0, 1]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.24, 1.0]);
  const wordScale = useTransform(scrollYProgress, [0, 1], [1.07, 1.0]);
  const rakeX = useTransform(scrollYProgress, [0.5, 0.96], [-1300, 1300]);
  const captionOpacity = useTransform(scrollYProgress, [0.64, 0.9], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.64, 0.9], [16, 0]);

  /* Reduced motion gets a genuinely different render path — no sticky stage, no
     scrubbing, no parting wall. Scroll-jacked sticky sections are a vestibular
     trigger, so this is a different layout, not merely disabled transforms. */
  if (reduce) {
    return (
      <section
        aria-label={`${SITE.shortName} — ${SITE.tagline}`}
        className="relative isolate w-full overflow-hidden bg-ink-950 py-20 sm:py-24"
      >
        <div className="mx-auto w-full max-w-[100rem] px-5">
          <Wordmark />
          <p className="text-eyebrow mt-6 text-center text-fg-faint">
            {SITE.tagline} · {HERO.location}
          </p>
        </div>
        <span className="sr-only">{SITE.name}</span>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label={`${SITE.shortName} — ${SITE.tagline}`}
      className="relative isolate h-[230svh] w-full bg-ink-950"
    >
      <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden bg-ink-950">
        {/* --- the shot ---------------------------------------------------- */}
        <div className="relative w-full">
          <Wordmark scaleWord={wordScale} scalePhoto={photoScale} rake={rakeX} />

          <motion.p
            style={{ opacity: captionOpacity, y: captionY }}
            className="text-eyebrow mt-6 px-5 text-center text-fg-faint sm:mt-8"
          >
            {SITE.tagline} · {HERO.location}
          </motion.p>
        </div>

        {/* --- the cabinet wall -------------------------------------------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex">
          {Array.from({ length: PANELS }, (_, i) => (
            <CabinetFront key={i} index={i} progress={scrollYProgress} />
          ))}
        </div>

        {/* --- grain, over everything, like projected film ------------------ */}
        <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

        {/* --- anamorphic letterbox ----------------------------------------
            Scaled on Y from the outer edge, so it is transform-only. These sit
            above every other layer: the bars are the frame, and nothing in the
            shot may spill past them. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 origin-top bg-black"
          style={{ height: BAR, scaleY: barScale }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 origin-bottom bg-black"
          style={{ height: BAR, scaleY: barScale }}
        />
      </div>

      <span className="sr-only">{SITE.name}</span>
    </section>
  );
}

/**
 * The wordmark. Photograph, specular rake and vignette are all painted only
 * inside the letterforms, through a single text mask.
 */
function Wordmark({
  scaleWord,
  scalePhoto,
  rake,
}: {
  scaleWord?: MotionValue<number>;
  scalePhoto?: MotionValue<number>;
  rake?: MotionValue<number>;
}) {
  return (
    <motion.svg
      viewBox="0 0 1000 260"
      className="block h-auto w-full"
      style={scaleWord ? { scale: scaleWord } : undefined}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <mask id={MASK_ID}>
          {/* black hides, white reveals */}
          <rect width="1000" height="260" fill="black" />
          <text
            x="500"
            y="203"
            textAnchor="middle"
            textLength="958"
            lengthAdjust="spacingAndGlyphs"
            fontSize="248"
            fontWeight={600}
            fill="white"
            style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
          >
            {SITE.shortName}
          </text>
        </mask>

        <linearGradient id={RAKE_ID} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="48%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="52%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Falloff toward the outer letters, so the shot has a lit centre. */}
        <radialGradient id={VIGNETTE_ID} cx="0.5" cy="0.5" r="0.72">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <g mask={`url(#${MASK_ID})`}>
        <motion.image
          href={HERO.image}
          x="0"
          y="0"
          width="1000"
          height="260"
          preserveAspectRatio="xMidYMid slice"
          style={
            scalePhoto
              ? { scale: scalePhoto, transformOrigin: "center", transformBox: "fill-box" }
              : undefined
          }
        />

        {rake && (
          <motion.rect
            x="0"
            y="0"
            width="440"
            height="260"
            fill={`url(#${RAKE_ID})`}
            style={{ x: rake }}
          />
        )}

        <rect x="0" y="0" width="1000" height="260" fill={`url(#${VIGNETTE_ID})`} />
      </g>
    </motion.svg>
  );
}
