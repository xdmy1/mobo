"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useI18n } from "@/components/ui/LangProvider";
import { OUTRO, SITE } from "@/lib/data";
import { EASE_OUT } from "@/lib/motion";

/**
 * OutroF — "Title card". Variant 2 of 3 (2026-09-21).
 *
 * Same brief as OutroE (see its header): timed, over in about a second, and
 * the photograph — never a dark plate — is what you meet. The ask for this one
 * was "cinematic, frumos, scurt, repede, impresionant", plus the full name:
 * "Kitchens & Home" set small under MOBO, not the four letters alone.
 *
 * So it is staged as the last shot of a film, with the four moves a title
 * sequence actually uses, all landing inside ~1.4s:
 *
 *   rack focus   the kitchen arrives soft and snaps sharp;
 *   push-in      the camera glides toward it and never quite stops — one long
 *                ease-out, most of its travel in the first second, the rest
 *                creeping for nine, so the frame is alive after the event;
 *   light pass   one warm streak of daylight crosses the lens, once;
 *   the title    MOBO tracks in — letters drifting together as they resolve —
 *                then KITCHENS & HOME does the same beneath it, and the house
 *                lights dip a stop so the bone type holds.
 *
 * Cost. Nothing here animates a filter. The soft frame is a 256px copy of the
 * same photograph (a few KB, so it is there long before the 4K one), blurred ONCE
 * and cross-faded out: the rack focus is an opacity tween. The push-in, the
 * light and every letter are transforms. The soft copy and the light unmount
 * when they are done.
 */

/* Same frame, same crop, a few KB. Hand-built because next/image has no business
   generating a srcset for something that exists to be out of focus. */
const SOFT_URL = `/_next/image?url=${encodeURIComponent(OUTRO.image)}&w=256&q=75`;

/* Timeline (s):   0 ──── .15 ── .25 ───── .65 ──── .95 ──── 1.25 ─ 1.45
 *   rack focus    soft → sharp ─────────────┘ (.9)
 *   push-in       1 → 1.07, nine seconds, nearly all of it up front
 *   house lights  dip ──────────────────────────┘ (1.1)
 *   light pass          cross the lens ─────────────────┘
 *   MOBO                       track in (40ms apart) ───┘
 *   KITCHENS & HOME                       track in ─────────────┘
 *   tagline                                        fade ─────────┘       */
const FOCUS_DUR = 0.9;
const PUSH_DUR = 9;
const LIGHT_AT = 0.15;
const LIGHT_DUR = 1.1;
const WORD_AT = 0.25;
const WORD_STEP = 0.04;
const WORD_DUR = 0.95;
const NAME_AT = 0.65;
const NAME_DUR = 0.8;
const TAGLINE_AT = 0.95;

/* A rack focus is an S-curve: the puller starts gently and lands gently. */
const EASE_FOCUS = [0.45, 0, 0.2, 1] as const;
/* Expo-out. Over nine seconds this is a glide that turns into a drift. */
const EASE_PUSH = [0.16, 1, 0.3, 1] as const;

/* How far apart neighbouring letters start, in their own em. */
const WORD_SPREAD = 0.2;
const NAME_SPREAD = 0.16;

/* The second half of the name, under the wordmark. */
const NAME_LINE = SITE.name.replace(`${SITE.shortName} `, "");

/* Centred title card, not a full-bleed wordmark: about half the frame wide.
   "MOBO" advances ≈3.0em at this tracking (measured), so 3.9em per 1em keeps
   it inside the gutters on a phone; the svh cap is what binds on a laptop. */
const WORDMARK_SIZE = "min(calc((100vw - 2.5rem) / 3.9), 30svh)";

const softVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 0, transition: { duration: FOCUS_DUR, ease: EASE_FOCUS } },
};

const pushVariants: Variants = {
  hidden: { scale: 1 },
  visible: { scale: 1.07, transition: { duration: PUSH_DUR, ease: EASE_PUSH } },
};

const lightsVariants: Variants = {
  hidden: { opacity: 0.2 },
  visible: { opacity: 1, transition: { duration: 1.1, ease: EASE_FOCUS } },
};

/* Percent of the streak's own width (45% of the band): from fully off the
   left edge to fully off the right. */
const lightVariants: Variants = {
  /* The rake lives here, not in a class: motion owns this element's
     `transform`, and would overwrite a utility's. */
  hidden: { x: "-130%", skewX: -18 },
  visible: {
    x: "260%",
    skewX: -18,
    transition: { duration: LIGHT_DUR, ease: EASE_FOCUS, delay: LIGHT_AT },
  },
};

/* Tracking-in, done with transforms: each glyph starts displaced from its
   resting place in proportion to its distance from the centre of the line.
   `custom` is that signed distance, in glyphs. */
const glyphVariants = (spread: number, at: number, dur: number, step = 0): Variants => ({
  hidden: (c: { offset: number }) => ({ opacity: 0, x: `${c.offset * spread}em` }),
  visible: (c: { offset: number; order: number }) => ({
    opacity: 1,
    x: "0em",
    transition: { duration: dur, ease: EASE_OUT, delay: at + c.order * step },
  }),
});

const wordVariants = glyphVariants(WORD_SPREAD, WORD_AT, WORD_DUR, WORD_STEP);
const nameVariants = glyphVariants(NAME_SPREAD, NAME_AT, NAME_DUR);

const taglineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT, delay: TAGLINE_AT } },
};

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

function Glyphs({
  text,
  variants,
  className,
}: {
  text: string;
  variants: Variants;
  className?: string;
}) {
  const glyphs = Array.from(text);
  const centre = (glyphs.length - 1) / 2;
  return (
    <>
      {glyphs.map((glyph, i) => (
        <motion.span
          /* Letters repeat — index is the only stable key. */
          key={i}
          className={className}
          variants={variants}
          custom={{ offset: i - centre, order: i }}
        >
          {/* inline-block collapses a bare space */}
          {glyph === " " ? "\u00A0" : glyph}
        </motion.span>
      ))}
    </>
  );
}

export default function OutroF() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { t } = useI18n();

  /* The focus cannot be pulled onto a frame that has not arrived; wait for the
     sharp photograph, but never longer than 2.5s — a stalled request must not
     cost the page its title. */
  const [loaded, setLoaded] = useState(false);
  const [wrapped, setWrapped] = useState(false);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!inView || loaded) return;
    const id = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(id);
  }, [inView, loaded]);

  const play = reduce ? inView : inView && loaded;

  return (
    <motion.section
      ref={sectionRef}
      aria-label={`${SITE.name} — ${t("site.tagline")}`}
      className="grain relative isolate flex h-[clamp(24rem,64svh,34rem)] w-full items-center justify-center overflow-hidden bg-bone-200 sm:h-[clamp(30rem,82svh,56rem)]"
      initial="hidden"
      animate={play ? "visible" : "hidden"}
    >
      {/* --- the shot -------------------------------------------------------- */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 will-change-transform"
        variants={reduce ? undefined : pushVariants}
      >
        {/* alt="": the same frame is described in the hero rotation. Phones
            crop the 3:2 frame by height, so they ask for more than their own
            width. */}
        <Image
          src={OUTRO.image}
          alt=""
          fill
          quality={90}
          sizes="(max-width: 640px) 160vw, 100vw"
          className="object-cover"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />

        {/* The same frame, out of focus. Scaled past the band so the blur's
            transparent fringe stays outside it. */}
        {!reduce && !wrapped && (
          <motion.div
            className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl will-change-[opacity]"
            style={{ backgroundImage: `url("${SOFT_URL}")` }}
            variants={softVariants}
          />
        )}
      </motion.div>

      {/* --- house lights -----------------------------------------------------
          A stop down across the frame and a little more at the corners, so the
          bone type holds over a daylight kitchen. It arrives WITH the title:
          until then the frame is at full brightness. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(19_20_16/0.3)_0%,rgb(19_20_16/0.38)_55%,rgb(19_20_16/0.64)_100%)]"
        variants={reduce ? undefined : lightsVariants}
      />
      {/* The cut into the credits: the frame meets the ink-950 footer without
          a border. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-ink-950 to-transparent"
      />

      {/* --- the light pass --------------------------------------------------- */}
      {!reduce && !wrapped && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-y-[20%] left-0 w-[45%] mix-blend-screen will-change-transform bg-[linear-gradient(90deg,transparent_0%,rgb(255_238_208/0.06)_30%,rgb(255_238_208/0.34)_50%,rgb(255_238_208/0.06)_70%,transparent_100%)]"
          variants={lightVariants}
          onAnimationComplete={(definition) => {
            if (definition === "visible") setWrapped(true);
          }}
        />
      )}

      {/* --- the title -------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="relative z-10 flex flex-col items-center px-5 text-bone-50"
        style={{ fontSize: WORDMARK_SIZE }}
      >
        <div className="flex font-semibold leading-none tracking-[-0.03em]">
          <Glyphs
            text={SITE.shortName}
            variants={reduce ? fadeVariants : wordVariants}
            className="block will-change-transform"
          />
        </div>

        {/* Sized off the wordmark, floored so it stays readable on a phone.
            The indent balances the trailing tracking of the last glyph. */}
        <div className="-mt-[0.06em] flex pl-[0.42em] text-[length:max(0.8125rem,0.09em)] font-medium uppercase leading-none tracking-[0.42em] text-bone-50/90">
          <Glyphs
            text={NAME_LINE}
            variants={reduce ? fadeVariants : nameVariants}
            className="block"
          />
        </div>
      </div>

      <motion.p
        className="text-eyebrow absolute inset-x-0 bottom-0 z-10 px-5 pb-7 text-center text-bone-50/75 sm:pb-9"
        variants={reduce ? fadeVariants : taglineVariants}
      >
        {t("site.tagline")} · {t("hero.location")}
      </motion.p>
    </motion.section>
  );
}
