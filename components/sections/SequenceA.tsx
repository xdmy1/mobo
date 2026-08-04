"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  cubicBezier,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  FILM_EASE,
  FilmGrain,
  FlashCut,
  GateWeave,
  Letterbox,
  LightLeak,
  Vignette,
} from "@/components/ui/film";
import { FILM_SHOTS, SITE, type FilmShot } from "@/lib/data";

/**
 * SequenceA — "OPENING TITLES".
 *
 * Not a shot. A CUT SEQUENCE.
 *
 * The difference between a nice scroll animation and a title sequence is the
 * edit. One image that zooms is a slideshow no matter how well it is eased;
 * what makes an audience read "film" is that the picture is REPLACED — hard,
 * on a single blown frame — and that the shot on the other side of the splice
 * is already moving in a different direction. Everything below is built around
 * that one idea.
 *
 * ── THE SCROLL IS THE PROJECTOR ───────────────────────────────────────────
 * A 400–500svh section holds one sticky h-svh gate. `scrollYProgress` is the
 * film running through it. Progress is spent like screen time:
 *
 *   0.000–0.080  BLACK. The bars close to 2.39:1 and the studio card comes and
 *                goes. The theatre darkens before anything is projected.
 *   0.080        FLASH · cut to picture
 *   0.080–0.205  SHOT 1  push-in    "Bucătării la comandă"      card low-left
 *   0.205        FLASH · cut
 *   0.205–0.330  SHOT 2  pan-right  "Proiectate în Chișinău"    card high-left
 *   0.330        FLASH · cut
 *   0.330–0.455  SHOT 3  pull-back  "Măsurate la fața locului"  card low-left
 *   0.455        FLASH · cut
 *   0.455–0.580  SHOT 4  pan-left   "Garanție 5 ani"            card high-left
 *   0.470–0.700  a light leak rakes the frame and dies into the last splice
 *   0.580        FLASH · cut
 *   0.580–1.000  SHOT 5  hold — a creeping push that runs under everything after
 *   0.635–0.700  the house lights go down: the dim plate rises to 0.30
 *   0.705        FLASH · the title arrives on the blown frame
 *   0.700–0.890  plate 0.30 → 0.86 — the wordmark RESOLVES OUT OF the kitchen
 *   0.700–0.855  rack focus: the shot goes soft, the footage in the letters stays sharp
 *   0.700–0.955  the footage inside the letterforms settles 1.22 → 1.00
 *   0.800–0.965  a specular rake crosses the letterforms
 *   0.905–0.965  the lime hairline draws from the centre — the lock
 *   0.930–0.985  the tagline resolves beneath it
 *   0.985–1.000  LOCKED FRAME. Hold.
 *
 * Five shots, five different camera moves, five splices. No two shots move the
 * same way, which is the whole reason it reads as coverage that was cut rather
 * than as one zoom repeated.
 *
 * ── WHY THE CUTS ARE BUILT THIS WAY ───────────────────────────────────────
 * Each shot's opacity is a four-point map: it snaps ON over 0.0012 of progress
 * (roughly half a pixel of scroll — one frame) and snaps OFF only AFTER its
 * successor is already fully opaque and painted above it. So there is never a
 * frame where two shots are both semi-transparent. A crossfade, however short,
 * reads as a web transition; this reads as a splice. The FlashCut sits exactly
 * on each cut point, so the eye is blinded for the frame the picture changes.
 *
 * ── CLIPPING ──────────────────────────────────────────────────────────────
 * The wordmark is inline SVG in a 1000×260 viewBox with textLength +
 * lengthAdjust="spacingAndGlyphs", so "MOBO" occupies exactly 944/1000 of the
 * box at every viewport width and with any font — webfont loaded, webfont
 * swapped, or fallback. Its container is w-[86%] max-w-[190svh], so the word is
 * ≤ 81% of the stage width and ≤ ~49svh tall. It cannot reach an edge and it
 * cannot widen the document. Verified 320px → 2560px, portrait and landscape.
 */

/* -------------------------------------------------------------------------- */
/* Cut schedule                                                               */
/* -------------------------------------------------------------------------- */

/** Black runs until here; the first splice lands on it. */
const OPEN_END = 0.08;
/** Screen time per cut shot. The last one is open-ended — it holds to the lock. */
const SHOT_LEN = 0.125;
/** The frame the title punches in on. */
const TITLE_AT = 0.705;
/** Past 1, so the final shot never cuts out. `useTransform` clamps anyway. */
const TAIL = 1.0001;

/**
 * The width of a splice, in progress units. Over ~400svh of scroll this is
 * about half a pixel — one frame. It is not zero because a zero-width
 * `useTransform` segment is a division by zero.
 */
const CUT_EPS = 0.0012;

/**
 * Each camera move starts before its shot is cut to and ends after it is cut
 * away from. That is not padding — it is the point. A dolly is already at speed
 * when the splice happens, so the visible portion of the move is the confident
 * middle of the curve and never its slow-in or its slow-out. Cut to a camera
 * that starts from rest and the illusion dies instantly.
 */
const MOVE_LEAD = 0.035;

const CUTS: number[] = FILM_SHOTS.map((_, i) => Number((OPEN_END + i * SHOT_LEN).toFixed(5)));
const LAST = FILM_SHOTS.length - 1;

/** Every splice in the reel, including the one the title lands on. */
const FLASH_AT: number[] = [...CUTS, TITLE_AT];

const CARD_LINES: string[] = FILM_SHOTS.flatMap((s) => (s.card ? [s.card] : []));

/**
 * The whole sequence is decorative — it is a brand moment, not information.
 * Assistive tech gets this sentence once and nothing else; every graphic below
 * is aria-hidden so "MOBO" is never announced as four loose letters.
 */
const SR_TEXT = `${SITE.name}. ${SITE.tagline}. ${CARD_LINES.join(". ")}.`;

/* Component-scoped SVG ids. A duplicate id anywhere in the document silently
   breaks the mask, and the failure looks like "the wordmark went black". */
const MASK_ID = "sequence-a-letter-mask";
const RAKE_ID = "sequence-a-specular-rake";
const FALLOFF_ID = "sequence-a-letter-falloff";

const moveEase = cubicBezier(...FILM_EASE.move);
const settleEase = cubicBezier(...FILM_EASE.settle);
const cutEase = cubicBezier(...FILM_EASE.cut);

/* -------------------------------------------------------------------------- */
/* Camera                                                                     */
/* -------------------------------------------------------------------------- */

type Move = { scale: [number, number]; x: [string, string] };

/**
 * One entry per move in `FilmShot["move"]`.
 *
 * Every pan carries a fixed 1.28 overscan and travels ±8.5% of its own
 * unscaled width. Motion composes as translate → scale, so the translation is
 * measured in unscaled units: 8.5% of travel against 14% of overhang per side
 * means a pan can never expose the frame edge, at any aspect ratio.
 */
const MOVES: Record<FilmShot["move"], Move> = {
  "push-in": { scale: [1.04, 1.26], x: ["0%", "0%"] },
  "pan-right": { scale: [1.28, 1.28], x: ["-8.5%", "8.5%"] },
  "pull-back": { scale: [1.38, 1.08], x: ["0%", "0%"] },
  "pan-left": { scale: [1.28, 1.28], x: ["8.5%", "-8.5%"] },
  /* A held shot is not a frozen shot. This creeps ~11% over four tenths of the
     sequence — under the threshold of noticing, above the threshold of dead. */
  hold: { scale: [1.02, 1.13], x: ["0%", "0%"] },
};

function Shot({
  shot,
  index,
  progress,
}: {
  shot: FilmShot;
  index: number;
  progress: MotionValue<number>;
}) {
  const isLast = index === LAST;
  const start = CUTS[index];
  const end = isLast ? TAIL : CUTS[index + 1];

  /* THE SPLICE. On over one frame; off only after the next shot is already
     fully opaque and painted on top of it, so no frame ever shows two
     half-transparent images. Source order gives the later shot the higher
     paint order, which is what makes that safe. */
  const opacity = useTransform(
    progress,
    isLast ? [start - CUT_EPS, start] : [start - CUT_EPS, start, end, end + CUT_EPS],
    isLast ? [0, 1] : [0, 1, 1, 0],
  );

  const move = MOVES[shot.move];
  const from = start - MOVE_LEAD;
  const to = end + MOVE_LEAD;
  const scale = useTransform(progress, [from, to], move.scale, { ease: moveEase });
  const x = useTransform(progress, [from, to], move.x, { ease: moveEase });

  /* RACK FOCUS — the one deliberate use of `filter` in this file.
     As the title resolves, the taking lens pulls off the kitchen: the shot
     goes soft while the footage inside the letterforms stays sharp, so the
     wordmark reads as a separate optical plane rather than as type sitting on
     a photo. It also buys the type its contrast. This is an optical device
     with a start and an end, not a continuous animated blur — it ramps once
     across 0.155 of progress and is static either side of that. It is applied
     to the final shot only; every other shot passes `undefined` and never
     builds a filter layer at all. */
  const rack = useTransform(progress, [TITLE_AT, 0.855], [0, 7]);
  const rackFilter = useMotionTemplate`blur(${rack}px)`;

  return (
    <motion.div
      className="will-move absolute inset-0"
      style={{ opacity, scale, x, filter: isLast ? rackFilter : undefined }}
    >
      <Image
        src={shot.src}
        alt=""
        fill
        sizes="100vw"
       
        className="object-cover"
        draggable={false}
      />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Title cards                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The card laid over a shot.
 *
 * Small, mono, heavily tracked, anchored to the frame rather than centred —
 * the convention every real main-title sequence uses, because a big centred
 * headline competes with the picture instead of annotating it.
 *
 * Cards alternate high and low across the reel so consecutive cuts do not land
 * text in the same place twice. Both anchors clear the 12.8% matte with room
 * to spare (19% vs 12.8%), so a card can never be eaten by a bar.
 */
function TitleCard({
  text,
  index,
  progress,
}: {
  text: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = CUTS[index];
  const end = CUTS[index + 1];
  const d = end - start;

  /* In after the cut has landed, out before the next one — a card that is
     still on screen when the picture changes reads as an overlay, not a card. */
  const inA = start + d * 0.06;
  const inB = start + d * 0.3;
  const outA = start + d * 0.72;
  const outB = end - 0.01;

  const opacity = useTransform(progress, [inA, inB, outA, outB], [0, 1, 1, 0]);
  /* A slow continuous drift for the card's whole life. Titles in a real
     sequence never sit still; they are printed on moving film. */
  const y = useTransform(progress, [inA, outB], [16, -12]);
  /* scaleX on a 1px rule, not `scale(0)` on a box: a hairline drawing itself
     across has a clear origin and no mid-transform resampling. The house rule
     against animating from scale(0) is about elements popping in from nothing. */
  const rule = useTransform(progress, [inA, start + d * 0.55], [0, 1], { ease: settleEase });

  const high = index % 2 === 1;

  return (
    <motion.div
      aria-hidden="true"
      className={`absolute left-[7%] right-[7%] z-20 sm:left-[9%] sm:right-[9%] ${
        high ? "top-[19%]" : "bottom-[19%]"
      }`}
      style={{ opacity }}
    >
      <motion.div className="will-move" style={{ y }}>
        <p className="font-mono text-[0.5625rem] tracking-[0.34em] text-fg-faint sm:text-[0.625rem]">
          {String(index + 1).padStart(2, "0")}
        </p>
        <motion.div
          className="will-move mt-2.5 h-px w-14 origin-left bg-fg/35 sm:w-20"
          style={{ scaleX: rule }}
        />
        <p className="mt-3 max-w-[22ch] font-mono text-[0.6875rem] uppercase leading-[1.5] tracking-[0.22em] text-fg sm:text-[0.8125rem]">
          {text}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Wordmark                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * MOBO, with the kitchen playing inside the letterforms.
 *
 * A single SVG <mask>: black field, white word. Everything in the masked group
 * — the footage, the specular rake, the falloff — is painted ONLY where the
 * glyphs are. `maskUnits="userSpaceOnUse"` pins the mask region to the viewBox
 * so the scaled <image> inside it cannot drag the mask's bounding box around
 * with it.
 *
 * The footage in the letters is a second copy of the final shot on its own
 * scale ramp, deliberately NOT registered to the background plate. Registered,
 * it would be invisible — identical pixels either side of the letterform edge.
 * Off-register, the letters read as a window onto a nearer plane, which is the
 * effect a real optical title has.
 */
function Wordmark({
  src,
  letterScale,
  rake,
}: {
  src: string;
  letterScale?: MotionValue<number>;
  rake?: MotionValue<number>;
}) {
  return (
    <svg
      viewBox="0 0 1000 260"
      className="block h-auto w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id={MASK_ID} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="260">
          <rect width="1000" height="260" fill="black" />
          {/* textLength + lengthAdjust pin the advance width to 944 user units
              whatever font actually resolves. This is the clipping guarantee:
              the word's width is a property of the viewBox, not of the face. */}
          <text
            x="500"
            y="203"
            textAnchor="middle"
            textLength="944"
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
          <stop offset="46%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="54%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Falloff toward the outer letters, so the lock-up has a lit centre
            instead of four equally bright glyphs. */}
        <radialGradient id={FALLOFF_ID} cx="0.5" cy="0.5" r="0.74">
          <stop offset="52%" stopColor="#060604" stopOpacity="0" />
          <stop offset="100%" stopColor="#060604" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      <g mask={`url(#${MASK_ID})`}>
        <motion.image
          href={src}
          x="0"
          y="0"
          width="1000"
          height="260"
          preserveAspectRatio="xMidYMid slice"
          style={
            letterScale
              ? { scale: letterScale, transformOrigin: "center", transformBox: "fill-box" }
              : undefined
          }
        />
        {rake ? (
          <motion.rect
            x="0"
            y="0"
            width="420"
            height="260"
            fill={`url(#${RAKE_ID})`}
            style={{ x: rake }}
          />
        ) : null}
        <rect x="0" y="0" width="1000" height="260" fill={`url(#${FALLOFF_ID})`} />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Sequence                                                                   */
/* -------------------------------------------------------------------------- */

export default function SequenceA() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: p } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* --- reel 0: black ---------------------------------------------------- */
  const boxProgress = useTransform(p, [0.004, 0.072], [0, 1], { ease: settleEase });
  const studioOpacity = useTransform(p, [0.006, 0.024, 0.054, 0.072], [0, 1, 1, 0]);
  const studioRule = useTransform(p, [0.012, 0.05], [0, 1], { ease: settleEase });

  /* --- reel 1: the leak, one accident on the stock ----------------------- */
  const leak = useTransform(p, [0.47, 0.7], [0, 1]);

  /* --- reel 2: the title ------------------------------------------------- */
  /* Two stages on one map: the house lights going down before the title, then
     the frame dropping away behind it. The wordmark does not arrive ON the
     shot — the shot recedes and leaves the wordmark standing in it. */
  /* Linear, deliberately: a dimmer is a rheostat, not a sprung mechanism. An
     eased ramp would land the frame at full black long before the wordmark has
     finished settling, and the last third of the resolve would go dead. */
  const plateOpacity = useTransform(p, [0.635, TITLE_AT, 0.89], [0, 0.3, 0.86]);
  /* Hard arrival, riding the blown frame at 0.705. */
  const wordOpacity = useTransform(p, [TITLE_AT - 0.004, TITLE_AT + 0.009], [0, 1], {
    ease: cutEase,
  });
  const wordScale = useTransform(p, [TITLE_AT, 0.905], [1.055, 1], { ease: settleEase });
  const letterScale = useTransform(p, [TITLE_AT, 0.955], [1.22, 1], { ease: moveEase });
  const rakeX = useTransform(p, [0.8, 0.965], [-520, 1120], { ease: moveEase });

  /* --- reel 3: the lock -------------------------------------------------- */
  const lockRule = useTransform(p, [0.905, 0.965], [0, 1], { ease: settleEase });
  const taglineOpacity = useTransform(p, [0.93, 0.985], [0, 1]);
  const taglineY = useTransform(p, [0.93, 0.985], [12, 0]);

  const finalShot = FILM_SHOTS[LAST];

  /* ------------------------------------------------------------------------
     REDUCED MOTION — a genuinely different render path.

     Not the same stage with its transforms switched off. A sticky scroll-jacked
     column is itself the vestibular trigger, so there is no sticky stage, no
     scroll linkage and no scrubbing here at all: the section is normal height
     and renders ONE composed frame — the last shot, already letterboxed,
     already graded, with the title already locked. The film's final frame as a
     poster. The cards become a single line of type under it, so nothing that
     was said during the sequence is lost.
     ---------------------------------------------------------------------- */
  if (reduce) {
    return (
      <section ref={sectionRef} className="relative w-full bg-black px-4 py-20 sm:px-6 sm:py-28">
        <p className="sr-only">{SR_TEXT}</p>

        <div
          aria-hidden="true"
          className="relative isolate mx-auto aspect-video w-full max-w-[76rem] overflow-clip bg-ink-950"
        >
          <Image
            src={finalShot.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 76rem, 100vw"
           
            className="object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 z-10 bg-ink-950/85" />

          <div className="absolute inset-0 z-[25] flex items-center justify-center">
            <div className="w-[82%] max-w-[190svh]">
              <Wordmark src={finalShot.src} />
              <div className="mx-auto mt-5 h-px w-[38%] bg-lime-brand" />
              <p className="mt-4 text-center font-mono text-[0.625rem] uppercase leading-[1.6] tracking-[0.18em] text-fg-dim sm:text-[0.6875rem]">
                {SITE.tagline}
              </p>
            </div>
          </div>

          <LightLeak progress={boxProgress} />
          <FilmGrain opacity={0.11} />
          <Vignette strength={0.6} />
          <Letterbox progress={boxProgress} />
        </div>

        <p
          aria-hidden="true"
          className="mx-auto mt-8 max-w-[76rem] text-center font-mono text-[0.625rem] uppercase leading-[2] tracking-[0.24em] text-fg-faint"
        >
          {CARD_LINES.join(" · ")}
        </p>
      </section>
    );
  }

  /* svh, never vh: on mobile the browser chrome collapses on scroll, and a
     vh-based stage would crop the frame the moment it did. Shorter on phones
     because the same proportional map costs real thumb distance there. */
  return (
    <section ref={sectionRef} className="relative h-[400svh] w-full bg-black md:h-[500svh]">
      <p className="sr-only">{SR_TEXT}</p>

      {/* THE GATE. `overflow-clip` rather than `hidden` so the sticky position
          still resolves against the page and nothing here can widen it. */}
      <div className="sticky top-0 h-svh w-full overflow-clip bg-ink-950">
        <div className="relative isolate h-full w-full">
          {/* Everything inside the weave is ON the film: picture, print, stock.
              The vignette and the matte below are in the lens and the gate, so
              they sit outside it and stay rock still while the film wanders. */}
          <GateWeave amount={0.9} className="h-full w-full">
            {/* --- picture ------------------------------------------------- */}
            <div aria-hidden="true" className="absolute inset-0 z-0 bg-ink-950">
              {FILM_SHOTS.map((shot, i) => (
                <Shot key={shot.src} shot={shot} index={i} progress={p} />
              ))}
            </div>

            {/* --- the house lights, then the frame dropping away ---------- */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 z-10 bg-ink-950"
              style={{ opacity: plateOpacity }}
            />

            {/* --- the studio card, in the black --------------------------- */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 z-[25] flex flex-col items-center justify-center px-8"
              style={{ opacity: studioOpacity }}
            >
              <p className="text-center font-mono text-[0.5625rem] uppercase leading-[1.8] tracking-[0.36em] text-fg-dim sm:text-[0.6875rem]">
                {SITE.name}
              </p>
              <motion.div
                className="will-move mt-4 h-px w-16 origin-center bg-fg/25 sm:w-24"
                style={{ scaleX: studioRule }}
              />
              <p className="mt-4 text-center font-mono text-[0.5625rem] lowercase tracking-[0.36em] text-fg-faint sm:text-[0.625rem]">
                prezintă
              </p>
            </motion.div>

            {/* --- title cards --------------------------------------------- */}
            {FILM_SHOTS.map((shot, i) =>
              shot.card ? (
                <TitleCard key={`${shot.src}-card`} text={shot.card} index={i} progress={p} />
              ) : null,
            )}

            {/* --- the lock-up --------------------------------------------- */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-[25] flex items-center justify-center"
            >
              <div className="w-[86%] max-w-[190svh]">
                <motion.div
                  className="will-move"
                  style={{ opacity: wordOpacity, scale: wordScale }}
                >
                  <Wordmark src={finalShot.src} letterScale={letterScale} rake={rakeX} />
                </motion.div>

                {/* The only lime in the sequence, and it arrives at the exact
                    frame the logo locks. One hairline, drawn from the centre,
                    flat — no shadow, no bloom, nothing that could read as glow.
                    scaleX on a 1px rule, for the reason given on TitleCard. */}
                <motion.div
                  className="will-move mx-auto mt-5 h-px w-[38%] origin-center bg-lime-brand sm:mt-6"
                  style={{ scaleX: lockRule }}
                />

                <motion.p
                  className="will-move mx-auto mt-4 max-w-[46ch] text-center font-mono text-[0.5625rem] uppercase leading-[1.8] tracking-[0.18em] text-fg-dim sm:mt-5 sm:text-[0.6875rem]"
                  style={{ opacity: taglineOpacity, y: taglineY }}
                >
                  {SITE.tagline}
                </motion.p>
              </div>
            </div>

            {/* --- the stock and the print --------------------------------- */}
            <LightLeak progress={leak} />
            <FilmGrain opacity={0.13} />
            <FlashCut progress={p} at={FLASH_AT} />
          </GateWeave>

          {/* --- the lens, then the aperture matte ------------------------- */}
          <Vignette strength={0.62} />
          <Letterbox progress={boxProgress} />
        </div>
      </div>
    </section>
  );
}
