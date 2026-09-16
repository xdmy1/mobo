"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useI18n } from "@/components/ui/LangProvider";
import { OUTRO, SITE } from "@/lib/data";

/* Same-origin and resized. `href={OUTRO.image}` would pull the 3872px
   original — the largest asset on the page, for a masked decoration. */
const PHOTO_URL = `/_next/image?url=${encodeURIComponent(OUTRO.image)}&w=1920&q=75`;

/**
 * "Soft-close" — the brand outro, staged as a film title card.
 *
 * One idea carries it, and it is not a zoom: THE EASING IS THE PRODUCT.
 * MOBO makes cabinets, and the feature a customer physically remembers from a
 * showroom is the soft-close mechanism — a door that catches itself and
 * settles slowly instead of slamming. So a wall of cabinet fronts parts on a
 * soft-close curve, heavily decelerated at the end, and the wordmark is what
 * stands behind it: MOBO's own kitchen, seen through the letterforms.
 *
 * Client feedback, 2026-09-16, and what changed:
 *   - "bare negre sus-jos care ocupă height aiurea" — the anamorphic letterbox
 *     (black bars cropping the viewport to 2.39:1) is gone. It was the "frame
 *     becomes cinema" idea; on a laptop it read as wasted height.
 *   - "o linie orizontală sus-jos, se vede urât" — two hairlines, one at the
 *     top and one at the bottom edge of the wordmark's box. The masked group
 *     (photo + fills) ran to the exact edge of the SVG viewport, and with the
 *     whole SVG scaling under scroll the clipped edge row rasterised as a
 *     faint line on some GPUs. The content now stops short of the viewport
 *     (inset), the mask's black field extends well past it, and the fronts
 *     lost their 1px seams and edge highlights for the same reason.
 *   - "stuttering" — the photo scale and the specular rake lived INSIDE the
 *     mask, so every scroll frame re-rasterised the masked SVG at ~3M pixels.
 *     Nothing changes inside the SVG any more: it rasterises once, and the
 *     only scroll-driven motion is compositor work — the fronts' transforms,
 *     a gentle scale on a will-change wrapper, and the caption's fade.
 *   - "prea lungă, să nu distragă", then "așa rapidă că parcă e glitch" — the
 *     track went 230svh → 160svh → 200svh. At 160 the wall parted inside
 *     ~30svh of scroll, under a quintic ease that spends most of that on the
 *     first few pixels: it read as a jump cut. Now the parting spans ~70svh
 *     of scroll on a cubic ease, so it reads as a door, not a glitch.
 *   - "se văd niște perdele" — the living-room hero showed curtains through
 *     the letters; the kitchen frame from the same shoot shows fronts.
 *
 * Clipping: the wordmark sits in a viewBox with `textLength` +
 * `lengthAdjust="spacingAndGlyphs"`, so it occupies an exact width at every
 * viewport size whether or not the webfont has loaded. It cannot overflow the
 * frame and cannot widen the document.
 */

const MASK_ID = "outro-d-letter-mask";
const VIGNETTE_ID = "outro-d-vignette";
const PANELS = 6;

/* The wordmark's viewBox, and how far the painted content stays inside it.
   The glyphs never come near the edge (cap height ends ~25 units from the
   top); the inset only exists so no pixel row at the viewport boundary ever
   has content to rasterise. */
const VB_W = 1000;
const VB_H = 260;
const INSET = 4;

/**
 * Soft-close. Fast off the mark, then it creeps home. Cubic, not the quintic
 * it started as: under scroll-scrubbing a quintic spends its whole travel in
 * the first few percent of the range and the eye reads a cut, not a motion.
 */
const softClose = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Outermost fronts lead, alternating up and down, so the wall parts.
 * 130% rather than 108%: at 108% a front's leading edge was still landing
 * within a subpixel of the frame boundary at some viewport heights.
 */
const panelOffset = (i: number) => (i % 2 === 0 ? "-130%" : "130%");
const panelDelay = (i: number) => {
  const fromCentre = Math.abs(i - (PANELS - 1) / 2);
  return (PANELS / 2 - fromCentre) * 0.05;
};

/** Where in the track the first front starts moving, and how long each takes. */
const PART_START = 0.06;
const PART_TRAVEL = 0.55;

function CabinetFront({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const start = PART_START + panelDelay(index);
  const y = useTransform(progress, [start, start + PART_TRAVEL], ["0%", panelOffset(index)], {
    ease: softClose,
  });

  return (
    <motion.div className="relative h-full flex-1 will-change-transform" style={{ y }}>
      {/* A plain slab. The faint vertical gradient is what makes the door
          read as a surface in motion — no edge lines, nothing that can strand
          a hairline across the shot. */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-850 via-ink-900 to-ink-900" />
    </motion.div>
  );
}

export default function OutroD() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { t } = useI18n();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* The wordmark settles from slightly large to rest — the camera easing in.
     It is the only transform on the wordmark, and it sits on a wrapper with
     will-change, so the SVG rasterises once and the scale is compositor-only. */
  const wordScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.0]);
  const captionOpacity = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.55, 0.8], [16, 0]);

  /* Reduced motion gets a genuinely different render path — no sticky stage, no
     scrubbing, no parting wall. Scroll-jacked sticky sections are a vestibular
     trigger, so this is a different layout, not merely disabled transforms. */
  if (reduce) {
    return (
      <section
        aria-label={`${SITE.shortName} — ${t("site.tagline")}`}
        className="relative isolate w-full overflow-hidden bg-ink-950 py-20 sm:py-24"
      >
        <div className="mx-auto w-full max-w-[100rem] px-5">
          <Wordmark />
          <p className="text-eyebrow mt-6 text-center text-fg-dim">
            {t("site.tagline")} · {t("hero.location")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label={`${SITE.shortName} — ${t("site.tagline")}`}
      className="relative isolate h-[200svh] w-full bg-ink-950"
    >
      <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden bg-ink-950">
        {/* --- the shot ---------------------------------------------------- */}
        <div className="relative w-full">
          <motion.div style={{ scale: wordScale }} className="will-change-transform">
            <Wordmark />
          </motion.div>

          <motion.p
            style={{ opacity: captionOpacity, y: captionY }}
            className="text-eyebrow mt-6 px-5 text-center text-fg-dim sm:mt-8"
          >
            {t("site.tagline")} · {t("hero.location")}
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
      </div>
    </section>
  );
}

/**
 * The wordmark. Photograph and vignette are painted only inside the
 * letterforms, through a single text mask. Nothing in here animates — see
 * the header on why — so the browser rasterises it once.
 */
function Wordmark() {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="block h-auto w-full"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <mask id={MASK_ID}>
          {/* black hides, white reveals — the black field runs well past the
              viewport so its own edge never coincides with the clip edge */}
          <rect x={-VB_W} y={-VB_H} width={VB_W * 3} height={VB_H * 3} fill="black" />
          <text
            x={VB_W / 2}
            y="203"
            textAnchor="middle"
            textLength="930"
            lengthAdjust="spacingAndGlyphs"
            fontSize="248"
            fontWeight={600}
            fill="white"
            style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
          >
            {SITE.shortName}
          </text>
        </mask>

        {/* Falloff toward the outer letters, so the shot has a lit centre. */}
        <radialGradient id={VIGNETTE_ID} cx="0.5" cy="0.5" r="0.72">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <g mask={`url(#${MASK_ID})`}>
        {/* Fallback fill: the letterforms must exist even if the photo never
            arrives, otherwise the brand moment degrades to a black frame. */}
        <rect
          x={INSET}
          y={INSET}
          width={VB_W - INSET * 2}
          height={VB_H - INSET * 2}
          fill="var(--color-ink-800)"
        />
        <image
          href={PHOTO_URL}
          x={INSET}
          y={INSET}
          width={VB_W - INSET * 2}
          height={VB_H - INSET * 2}
          preserveAspectRatio="xMidYMid slice"
        />
        <rect
          x={INSET}
          y={INSET}
          width={VB_W - INSET * 2}
          height={VB_H - INSET * 2}
          fill={`url(#${VIGNETTE_ID})`}
        />
      </g>
    </svg>
  );
}
