"use client";

import Image from "next/image";
import { useRef, type JSX } from "react";
import {
  cubicBezier,
  motion,
  useMotionValue,
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
import { FILM_SHOTS, HERO, SITE, type FilmShot } from "@/lib/data";

/**
 * SEQUENCE C — "THE PROJECTOR".
 *
 * The other way to make a web page feel like cinema is to stop pretending the
 * cinema is invisible. A film is a physical object being dragged past a lamp at
 * 24 frames a second, and every part of that apparatus is visible if you look:
 * the leader, the sprockets, the gate, the splice, the burn. This sequence
 * leans on the apparatus instead of hiding it.
 *
 * ── THE COUNTDOWN LEADER ──────────────────────────────────────────────────
 * The section opens on an academy leader: a centred numeral counting 3 · 2 · 1
 * inside two concentric rings, with a wipe hand sweeping a full revolution per
 * numeral and the numeral cutting on the beat. It is the single most
 * unambiguous "you are watching a film" cue that exists — everyone has seen it,
 * nobody has ever seen it on a website — and it costs the user nothing to read.
 *
 * The wipe is built from two half-plane fills, each rotating inside a
 * half-frame window: the standard two-semicircle pie, which covers a 0–360°
 * sector using nothing but two `rotate`s. No conic gradient (unanimatable), no
 * per-frame path `d` (a repaint every frame), no canvas.
 *
 * ── THE RUN ───────────────────────────────────────────────────────────────
 * After the leader the shots are pulled through the gate: each one cuts in on a
 * blown frame (FlashCut) and *seats* — a 2.4% vertical drop on FILM_EASE.settle,
 * the frame catching on the register pin. Heavy GateWeave runs underneath the
 * whole thing, and sprocket strips stream down both edges at a pitch that
 * decelerates towards the end, so the film visibly slows in the gate.
 *
 * ── THE BURN ──────────────────────────────────────────────────────────────
 * The wordmark arrives as the final frame with footage running inside the
 * letterforms. Then the film stops in front of the lamp and burns: a bloom out
 * of the centre, a full blow-out, and — as the white decays — the locked logo,
 * now solid, under a single lime rule wiping open from the centre.
 *
 * ── THINGS DELIBERATELY NOT DONE ──────────────────────────────────────────
 * No CSS `filter` anywhere. The burn is a multi-stop radial gradient, which is
 * already band-limited; a real `blur()` on a full-bleed layer during a scrub is
 * the most expensive thing you can put on a page and would look identical. Only
 * `transform` and `opacity` are animated, everywhere, without exception.
 */

/* -------------------------------------------------------------------------- */
/* Curves                                                                     */
/* -------------------------------------------------------------------------- */

const easeMove = cubicBezier(...FILM_EASE.move);
const easeSettle = cubicBezier(...FILM_EASE.settle);
const easeCut = cubicBezier(...FILM_EASE.cut);
/** The film transport runs at a constant rate. Anything else reads as a stutter. */
const easeLinear = (t: number) => t;

/* -------------------------------------------------------------------------- */
/* The beat map — every value is a position in scrollYProgress, 0 → 1          */
/* -------------------------------------------------------------------------- */

/** Thread-up: bars close, stock starts moving, the leader field comes up. */
const LEAD_IN = 0.006;
const LEAD_UP = 0.03;

/** The countdown. Three beats, one full revolution of the wipe hand each. */
const COUNT_IN = 0.036;
const COUNT_OUT = 0.3;
const BEAT = (COUNT_OUT - COUNT_IN) / 3;

/** Two black frames between leader and picture, with the frame line rolling. */
const ROLL_OUT = 0.322;

/** The run. */
const SHOTS_IN = ROLL_OUT;
const SHOTS_OUT = 0.76;
const SHOT_LEN = (SHOTS_OUT - SHOTS_IN) / FILM_SHOTS.length;

/** The final frame, the burn, the lock. */
const WORD_IN = SHOTS_OUT;
const BURN_IN = 0.86;
const BURN_PEAK = 0.9;
const BURN_OUT = 0.948;

/**
 * Where the print is physically spliced. Each one gets a blown frame.
 * Module scope, so `at` keeps a stable identity across renders.
 */
const SPLICES: number[] = [
  COUNT_IN + BEAT,
  COUNT_IN + BEAT * 2,
  COUNT_OUT,
  ...FILM_SHOTS.map((_, i) => SHOTS_IN + i * SHOT_LEN),
  WORD_IN,
];

/* -------------------------------------------------------------------------- */
/* Sprocket stock                                                             */
/* -------------------------------------------------------------------------- */

/**
 * One perforation every 24px, drawn as a repeating gradient rather than as ~140
 * DOM nodes per edge. The 1.5px ramps at each end of the slot stand in for the
 * radiused corners of a real Bell & Howell perf; at this scale and opacity they
 * are indistinguishable, and this costs one element instead of hundreds.
 *
 * The period below MUST stay at exactly 24px: the strip loops by translating a
 * whole pitch, so any mismatch shows as a jump on every cycle.
 */
const PERF_PITCH = 24;
const PERF_STOCK =
  "repeating-linear-gradient(to bottom," +
  "rgba(246,245,238,0) 0px,rgba(246,245,238,0) 13px," +
  "rgba(246,245,238,0.14) 14.5px,rgba(246,245,238,0.14) 22.5px," +
  "rgba(246,245,238,0) 24px)";

/**
 * Pitches advanced across the whole scroll. Deliberately conservative: a
 * repeating pattern moving faster than roughly half a pitch per frame reverses
 * direction to the eye (wagon-wheel), and a strip that appears to run backwards
 * is worse than one that runs slowly.
 */
const PERF_CYCLES = 120;

/* -------------------------------------------------------------------------- */
/* Leader geometry                                                            */
/* -------------------------------------------------------------------------- */

const TICKS = Array.from({ length: 12 }, (_, i) => {
  const deg = i * 30;
  const rad = ((deg - 90) * Math.PI) / 180;
  const major = deg % 90 === 0;
  const inner = major ? 396 : 434;
  return {
    key: deg,
    x1: 500 + Math.cos(rad) * inner,
    y1: 500 + Math.sin(rad) * inner,
    x2: 500 + Math.cos(rad) * 468,
    y2: 500 + Math.sin(rad) * 468,
    w: major ? 5 : 2,
  };
});

/**
 * `textLength` per digit rather than one shared value: forcing "1" to the width
 * of "3" with `spacingAndGlyphs` would horizontally stretch it into a slab.
 * Every value here is well inside the 240-unit viewBox, so the numeral cannot
 * touch its own edges whatever font ends up resolving.
 */
const COUNTDOWN: { digit: string; len: number }[] = [
  { digit: "3", len: 168 },
  { digit: "2", len: 168 },
  { digit: "1", len: 94 },
];

/* -------------------------------------------------------------------------- */
/* Camera                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * One move per shot, from the `move` field in lib/data.
 *
 * Every entry keeps the plate at 1.08 scale or above, so there is at least 4%
 * of overscan on each edge — more than the 3.2% pan and the 2.4% gate settle
 * can ever consume. No move can expose the edge of a photograph.
 */
const CAMERA: Record<FilmShot["move"], { scale: [number, number]; x: [string, string] }> = {
  "push-in": { scale: [1.08, 1.22], x: ["0%", "0%"] },
  "pull-back": { scale: [1.24, 1.09], x: ["0%", "0%"] },
  "pan-left": { scale: [1.18, 1.18], x: ["3.2%", "-3.2%"] },
  "pan-right": { scale: [1.18, 1.18], x: ["-3.2%", "3.2%"] },
  hold: { scale: [1.1, 1.14], x: ["0%", "0%"] },
};

/* -------------------------------------------------------------------------- */
/* SVG ids — component-scoped, so a sibling sequence cannot steal a mask       */
/* -------------------------------------------------------------------------- */

const ID_WORD_MASK = "seqc-projector-word-mask";
const ID_WORD_FALLOFF = "seqc-projector-word-falloff";

/* -------------------------------------------------------------------------- */
/* Sprockets                                                                  */
/* -------------------------------------------------------------------------- */

function Sprockets({
  side,
  y,
  opacity,
}: {
  side: "left" | "right";
  y: MotionValue<number>;
  opacity: MotionValue<number>;
}): JSX.Element {
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={`pointer-events-none absolute inset-y-0 z-[15] w-[clamp(11px,1.6vw,19px)] overflow-clip ${
        side === "left" ? "left-0" : "right-0"
      }`}
    >
      {/* Overhangs 48px top and bottom so a full-pitch translate never exposes
          the end of the strip. */}
      <motion.div
        className="will-move absolute inset-x-[24%] inset-y-[-48px]"
        style={{ y, background: PERF_STOCK }}
      />
      {/* The edge of the picture area — the line where perforation ends and
          emulsion begins. Static; a film edge does not move relative to itself. */}
      <div
        className={`absolute inset-y-0 w-px bg-bone-100/10 ${
          side === "left" ? "right-0" : "left-0"
        }`}
      />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* The countdown leader                                                       */
/* -------------------------------------------------------------------------- */

/**
 * One beat: the wipe hand makes a single revolution while one numeral holds.
 *
 * THE WIPE. A sector of arbitrary angle α, built from two rotations and no
 * repaint:
 *
 *   sector[0°,180°]   = the right half-frame ∩ a half-plane rotating -180° → 0°
 *   sector[180°,360°] = the whole right half + the left half-frame ∩ a
 *                       half-plane rotating 0° → 180°
 *
 * Each "half-plane" is a full-disc-width box (so its centre is the disc centre,
 * hence its own default transform origin) with only its right half painted.
 * Clipped by a `rounded-full overflow-clip` parent, the painted region is
 * exactly a half-disc. `useTransform` clamps outside its input range, which is
 * what holds the right half filled for the whole second half of the beat.
 */
function LeaderBeat({
  progress,
  from,
  to,
  digit,
  len,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  digit: string;
  len: number;
}): JSX.Element {
  const mid = (from + to) / 2;

  /* The numeral cuts, it does not dissolve — 0.15% of progress is one or two
     frames of scroll at any plausible speed. */
  const opacity = useTransform(progress, [from - 0.0015, from, to - 0.0015, to], [0, 1, 1, 0]);

  const rightRot = useTransform(progress, [from, mid], [-180, 0], { ease: easeLinear });
  const leftRot = useTransform(progress, [mid, to], [0, 180], { ease: easeLinear });
  const handRot = useTransform(progress, [from, to], [0, 360], { ease: easeLinear });

  /* Same gesture as the shots below: the frame arrives and seats. */
  const numeralScale = useTransform(progress, [from, from + 0.007], [1.04, 1], {
    ease: easeSettle,
  });

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <div className="absolute inset-0 overflow-clip rounded-full">
        <div className="absolute inset-y-0 right-0 w-1/2 overflow-clip">
          <motion.div
            className="will-move absolute inset-y-0 right-0 w-[200%]"
            style={{ rotate: rightRot }}
          >
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[rgba(246,245,238,0.105)]" />
          </motion.div>
        </div>
        <div className="absolute inset-y-0 left-0 w-1/2 overflow-clip">
          <motion.div
            className="will-move absolute inset-y-0 left-0 w-[200%]"
            style={{ rotate: leftRot }}
          >
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[rgba(246,245,238,0.105)]" />
          </motion.div>
        </div>
      </div>

      {/* The hand. A radius pinned at the disc centre by `origin-bottom`; the
          -0.5px margin puts its own centreline on the 50% mark. */}
      <motion.div
        className="will-move absolute top-0 left-1/2 -ml-[0.5px] h-1/2 w-px origin-bottom bg-bone-50/75"
        style={{ rotate: handRot }}
      />

      <motion.div
        className="absolute inset-0 grid place-items-center"
        style={{ scale: numeralScale }}
      >
        <svg viewBox="0 0 240 360" className="h-[48%] w-auto" aria-hidden="true">
          <text
            x="120"
            y="316"
            textAnchor="middle"
            textLength={len}
            lengthAdjust="spacingAndGlyphs"
            fontSize="350"
            fontWeight={500}
            fill="#f6f5ee"
            fillOpacity="0.92"
            style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
          >
            {digit}
          </text>
        </svg>
      </motion.div>
    </motion.div>
  );
}

function Leader({ progress }: { progress: MotionValue<number> }): JSX.Element {
  const opacity = useTransform(
    progress,
    [LEAD_IN, LEAD_UP, COUNT_OUT, COUNT_OUT + 0.003],
    [0, 1, 1, 0],
  );

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[6] grid place-items-center"
      style={{ opacity }}
    >
      <div className="relative aspect-square w-[min(56svh,78vw)]">
        <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full">
          <circle
            cx="500"
            cy="500"
            r="470"
            fill="rgba(246,245,238,0.035)"
            stroke="rgba(246,245,238,0.3)"
            strokeWidth="2.5"
          />
          <circle
            cx="500"
            cy="500"
            r="332"
            fill="none"
            stroke="rgba(246,245,238,0.15)"
            strokeWidth="2"
          />
          {TICKS.map((t) => (
            <line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="rgba(246,245,238,0.32)"
              strokeWidth={t.w}
            />
          ))}
        </svg>

        {COUNTDOWN.map((c, i) => (
          <LeaderBeat
            key={c.digit}
            progress={progress}
            from={COUNT_IN + i * BEAT}
            to={COUNT_IN + (i + 1) * BEAT}
            digit={c.digit}
            len={c.len}
          />
        ))}
      </div>

      {/* Registration crosshair, across the whole frame rather than the disc —
          this is what the projectionist frames on. Drawn last so it also hides
          the seam where the two wipe half-frames meet. */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-bone-100/12" />
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-bone-100/12" />
    </motion.div>
  );
}

/**
 * The technical annotation on the leader itself. Sits above the vignette,
 * otherwise the corner falloff would eat it — and it lives on its own layer
 * because the leader's animated opacity makes it a stacking context.
 */
function LeaderSlate({ progress }: { progress: MotionValue<number> }): JSX.Element {
  const opacity = useTransform(
    progress,
    [LEAD_IN, LEAD_UP, COUNT_OUT, COUNT_OUT + 0.003],
    [0, 1, 1, 0],
  );

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[16] font-mono text-[9px] tracking-[0.18em] text-fg-faint uppercase sm:text-[10px]"
      style={{ opacity }}
    >
      <span className="absolute top-[15.5%] left-5 sm:left-9">{SITE.name}</span>
      <span className="absolute top-[15.5%] right-5 sm:right-9">Chișinău · MD</span>
      <span className="absolute bottom-[15.5%] left-5 sm:left-9">Bobina 01 · Imagine</span>
      <span className="absolute right-5 bottom-[15.5%] sm:right-9">2.39 : 1</span>
    </motion.div>
  );
}

/**
 * The frame line rolling through the gate in the two black frames between the
 * leader and picture. This is what a projector looks like in the half second
 * before it finds frame, and it keeps the black hold from being a dead zone.
 */
function FrameRoll({ progress }: { progress: MotionValue<number> }): JSX.Element {
  const y = useTransform(progress, [COUNT_OUT, ROLL_OUT], ["-130%", "420%"], {
    ease: easeLinear,
  });
  const opacity = useTransform(
    progress,
    [COUNT_OUT, COUNT_OUT + 0.004, ROLL_OUT - 0.006, ROLL_OUT],
    [0, 1, 1, 0],
  );

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[7] h-[24%]"
      style={{ opacity }}
    >
      <motion.div
        className="will-move absolute inset-0"
        style={{
          y,
          background:
            "linear-gradient(to bottom, rgba(255,247,228,0) 0%, rgba(255,247,228,0.05) 42%, rgba(255,247,228,0.30) 50%, rgba(255,247,228,0.05) 58%, rgba(255,247,228,0) 100%)",
        }}
      />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* The run                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * One frame pulled through the gate.
 *
 * Shots never fade *out*: the next one cuts in on top, and the blown frame from
 * FlashCut lands on the same progress value, so the 0.5% opacity ramp is never
 * seen. That is a splice, not a cross-dissolve.
 */
function Shot({
  shot,
  inAt,
  outAt,
  progress,
}: {
  shot: FilmShot;
  inAt: number;
  outAt: number;
  progress: MotionValue<number>;
}): JSX.Element {
  const cam = CAMERA[shot.move];

  const opacity = useTransform(progress, [inAt - 0.005, inAt], [0, 1]);
  const scale = useTransform(progress, [inAt, outAt], cam.scale, { ease: easeMove });
  const x = useTransform(progress, [inAt, outAt], cam.x, { ease: easeMove });
  /* The frame seating on the register pin: it arrives high and drops into the
     gate. Heavier than the house ease-out on purpose — it catches itself. */
  const y = useTransform(progress, [inAt, inAt + 0.011], ["-2.4%", "0%"], { ease: easeSettle });

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <motion.div className="will-move absolute inset-0" style={{ scale, x, y }}>
        <Image
          src={shot.src}
          /* Decorative inside a title sequence: the whole stack is aria-hidden
             and the section carries one sr-only name instead. */
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  );
}

/** The title laid over a shot. Its own layer, so the vignette cannot dim it. */
function ShotCard({
  card,
  index,
  inAt,
  outAt,
  progress,
}: {
  card: string;
  index: number;
  inAt: number;
  outAt: number;
  progress: MotionValue<number>;
}): JSX.Element {
  const stops = [inAt + 0.012, inAt + 0.03, outAt - 0.03, outAt - 0.01];
  const opacity = useTransform(progress, stops, [0, 1, 1, 0]);
  const y = useTransform(progress, stops, [14, 0, 0, -12], { ease: easeMove });

  return (
    <motion.div
      className="absolute bottom-[17.5%] left-5 z-[16] max-w-[78%] sm:left-9 lg:left-14"
      style={{ opacity, y }}
    >
      <p className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase sm:text-[10px]">
        {String(index + 1).padStart(2, "0")} / {String(FILM_SHOTS.length).padStart(2, "0")}
      </p>
      <p className="text-h2 text-balance mt-2 text-bone-50">{card}</p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* The wordmark                                                               */
/* -------------------------------------------------------------------------- */

/**
 * MOBO, as the last frame of the print.
 *
 * CLIPPING. The wordmark is an inline SVG with a `0 0 1000 260` viewBox, and
 * the letters are set with `textLength="904"` + `lengthAdjust="spacingAndGlyphs"`.
 * That pins the word to exactly 90.4% of the viewBox at every viewport width and
 * with any font — including before the webfont loads, where a fallback with
 * wider metrics is precisely what clipped an earlier `text-[36vw]` version. The
 * remaining 4.8% each side is a hard margin the glyphs cannot cross, and the
 * largest scale applied anywhere below is 1.05 (904 × 1.05 = 949 < 1000). The
 * SVG itself is `w-full` inside a padded, max-width container, so it can never
 * be wider than its column and never widen the document.
 *
 * `footage` and `lock` cross over underneath the peak of the burn, so the swap
 * from photographic letterforms to the solid locked logo is never seen.
 */
function Wordmark({
  footage,
  lock,
  photoScale,
}: {
  footage: MotionValue<number>;
  lock: MotionValue<number>;
  photoScale: MotionValue<number>;
}): JSX.Element {
  return (
    <svg viewBox="0 0 1000 260" className="block h-auto w-full" aria-hidden="true">
      <defs>
        <mask id={ID_WORD_MASK}>
          <rect width="1000" height="260" fill="black" />
          <text
            x="500"
            y="203"
            textAnchor="middle"
            textLength="904"
            lengthAdjust="spacingAndGlyphs"
            fontSize="248"
            fontWeight={600}
            fill="white"
            style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
          >
            {SITE.shortName}
          </text>
        </mask>

        <radialGradient id={ID_WORD_FALLOFF} cx="0.5" cy="0.5" r="0.72">
          <stop offset="52%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Footage running inside the letterforms. */}
      <motion.g mask={`url(#${ID_WORD_MASK})`} style={{ opacity: footage }}>
        <motion.image
          href={HERO.image}
          x="0"
          y="0"
          width="1000"
          height="260"
          preserveAspectRatio="xMidYMid slice"
          style={{ scale: photoScale, transformBox: "fill-box", transformOrigin: "center" }}
        />
        <rect width="1000" height="260" fill={`url(#${ID_WORD_FALLOFF})`} />
      </motion.g>

      {/* The locked logo: the same letterforms, printed solid. */}
      <motion.rect
        width="1000"
        height="260"
        fill="#f6f5ee"
        mask={`url(#${ID_WORD_MASK})`}
        style={{ opacity: lock }}
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

export default function SequenceC(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* Reduced motion never scrubs, but Letterbox and LightLeak still take a
     MotionValue. This one never changes. */
  const still = useMotionValue(1);

  /* --- frame ------------------------------------------------------------ */
  const letterbox = useTransform(scrollYProgress, [0, 0.042], [0, 1], { ease: easeMove });

  /* --- transport -------------------------------------------------------- */
  /* Linear for the whole run, then a long creep after the burn: the take-up
     reel losing its drive. The strip stays alive to the last pixel of scroll
     without ever being fast enough to strobe. */
  const transport = useTransform(scrollYProgress, [0, BURN_IN, 1], [0, BURN_IN, BURN_IN + 0.022], {
    ease: [easeLinear, easeSettle],
  });
  const perfY = useTransform(transport, (v) => -((v * PERF_CYCLES) % 1) * PERF_PITCH);
  const perfOpacity = useTransform(
    scrollYProgress,
    [0, 0.012, 0.05, BURN_IN, 0.96],
    [0, 0, 1, 1, 0.45],
  );

  /* --- leaks ------------------------------------------------------------ */
  /* Two passes. One rakes across the middle of the run, one blooms into the
     burn. LightLeak fades itself to nothing at both ends of its range, so
     outside these windows the layers are simply not there. */
  const leakRun = useTransform(scrollYProgress, [0.4, 0.6], [0, 1], { ease: easeMove });
  const leakBurn = useTransform(scrollYProgress, [0.78, 0.9], [0, 1], { ease: easeMove });

  /* --- final frame ------------------------------------------------------ */
  const frameOpacity = useTransform(scrollYProgress, [WORD_IN - 0.005, WORD_IN], [0, 1]);
  const frameSeat = useTransform(scrollYProgress, [WORD_IN, WORD_IN + 0.012], ["-1.6%", "0%"], {
    ease: easeSettle,
  });
  const frameScale = useTransform(scrollYProgress, [WORD_IN, BURN_IN], [1.05, 1], {
    ease: easeMove,
  });
  const photoScale = useTransform(scrollYProgress, [WORD_IN, 1], [1.22, 1.04], { ease: easeMove });
  const footageOpacity = useTransform(scrollYProgress, [0.884, 0.914], [1, 0]);
  const lockOpacity = useTransform(scrollYProgress, [0.884, 0.914], [0, 1]);

  /* --- the burn --------------------------------------------------------- */
  /* Starts at 0.22, never at 0: a scale-from-nothing entrance has a degenerate
     first frame and reads as a pop. A bloom starts small, it does not start
     non-existent. */
  const bloomScale = useTransform(scrollYProgress, [BURN_IN, BURN_PEAK], [0.22, 1.7], {
    ease: easeCut,
  });
  const bloomOpacity = useTransform(
    scrollYProgress,
    [BURN_IN, BURN_IN + 0.014, BURN_PEAK, BURN_OUT],
    [0, 0.4, 1, 0],
    { ease: easeSettle },
  );
  const sheetOpacity = useTransform(
    scrollYProgress,
    [0.878, BURN_PEAK, 0.936],
    [0, 1, 0],
    { ease: easeSettle },
  );

  /* --- the lock --------------------------------------------------------- */
  /* The one lime element in the sequence, and it arrives last. A wipe built
     from two translating bars inside two clipped halves — no scaleX, so there
     is no zero-width frame, and no glow of any kind. */
  const ruleLeft = useTransform(scrollYProgress, [0.926, 0.968], ["100%", "0%"], {
    ease: easeSettle,
  });
  const ruleRight = useTransform(scrollYProgress, [0.926, 0.968], ["-100%", "0%"], {
    ease: easeSettle,
  });
  const taglineOpacity = useTransform(scrollYProgress, [0.94, 0.978], [0, 1]);
  const taglineY = useTransform(scrollYProgress, [0.94, 0.986], [12, 0], { ease: easeSettle });

  /* ======================================================================
     REDUCED MOTION — a genuinely different page.

     No sticky stage, no scroll driving anything, normal document height. A
     scroll-jacked pin is itself the vestibular trigger, so it is the thing that
     has to go; what remains is the sequence's destination composed as one still
     frame — locked logo, stock, gate, lens falloff, 2.39:1 matte.
     ====================================================================== */
  if (reduce) {
    return (
      <section
        ref={sectionRef}
        className="relative isolate w-full bg-ink-950 py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-[100rem] px-4 sm:px-6">
          <GateWeave className="relative h-[min(70svh,40rem)] w-full bg-ink-950">
            <div className="absolute inset-0 grid place-items-center px-6">
              <div className="flex w-full max-w-[64rem] flex-col items-center">
                <div className="w-full">
                  <StillWordmark />
                </div>
                <div className="mt-5 flex w-[90.4%] sm:mt-7">
                  <div className="h-[2px] flex-1 bg-lime-brand" />
                  <div className="h-[2px] flex-1 bg-lime-brand" />
                </div>
                <p className="text-eyebrow text-balance mt-4 text-center text-fg-dim sm:mt-5">
                  {SITE.tagline} · {HERO.location}
                </p>
              </div>
            </div>

            <StaticSprockets side="left" />
            <StaticSprockets side="right" />

            <Vignette strength={0.5} />
            <LightLeak progress={still} />
            <FilmGrain opacity={0.13} />
            <Letterbox progress={still} />
          </GateWeave>
        </div>

        <span className="sr-only">{SITE.name}</span>
      </section>
    );
  }

  /* ======================================================================
     THE SEQUENCE
     ====================================================================== */
  return (
    <section ref={sectionRef} className="relative isolate h-[520svh] w-full bg-ink-950">
      {/* `isolate` on the pinned stage as well as the section: FlashCut and
          LightLeak use mix-blend-screen and would otherwise blend against the
          page behind. `overflow-clip` guarantees nothing here can widen the
          document at any scroll position. */}
      <div className="sticky top-0 isolate h-svh w-full overflow-clip bg-ink-950">
        <GateWeave amount={1.7} className="h-full w-full">
          {/* --- the run ---------------------------------------------- */}
          <div aria-hidden="true" className="absolute inset-0">
            {FILM_SHOTS.map((shot, i) => (
              <Shot
                key={shot.src}
                shot={shot}
                inAt={SHOTS_IN + i * SHOT_LEN}
                outAt={SHOTS_IN + (i + 1) * SHOT_LEN}
                progress={scrollYProgress}
              />
            ))}
          </div>

          {/* --- academy leader --------------------------------------- */}
          <Leader progress={scrollYProgress} />
          <FrameRoll progress={scrollYProgress} />

          {/* --- the final frame -------------------------------------- */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 z-[8] bg-ink-950"
            style={{ opacity: frameOpacity }}
          >
            <motion.div
              className="will-move absolute inset-0 grid place-items-center px-5 sm:px-8"
              style={{ y: frameSeat, scale: frameScale }}
            >
              <div className="flex w-full max-w-[64rem] flex-col items-center">
                <div className="w-full">
                  <Wordmark
                    footage={footageOpacity}
                    lock={lockOpacity}
                    photoScale={photoScale}
                  />
                </div>

                {/* Lime, once, at the lock. Two clipped halves wiping open from
                    the centre — pure translation. */}
                <div className="mt-5 flex w-[90.4%] sm:mt-7">
                  <div className="relative h-[2px] flex-1 overflow-clip">
                    <motion.div
                      className="will-move absolute inset-0 bg-lime-brand"
                      style={{ x: ruleLeft }}
                    />
                  </div>
                  <div className="relative h-[2px] flex-1 overflow-clip">
                    <motion.div
                      className="will-move absolute inset-0 bg-lime-brand"
                      style={{ x: ruleRight }}
                    />
                  </div>
                </div>

                <motion.p
                  className="text-eyebrow text-balance mt-4 text-center text-fg-dim sm:mt-5"
                  style={{ opacity: taglineOpacity, y: taglineY }}
                >
                  {SITE.tagline} · {HERO.location}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>

          {/* --- title cards ------------------------------------------ */}
          {FILM_SHOTS.map((shot, i) =>
            shot.card ? (
              <ShotCard
                key={shot.src}
                card={shot.card}
                index={i}
                inAt={SHOTS_IN + i * SHOT_LEN}
                outAt={SHOTS_IN + (i + 1) * SHOT_LEN}
                progress={scrollYProgress}
              />
            ) : null,
          )}
          <LeaderSlate progress={scrollYProgress} />

          {/* --- the stock -------------------------------------------- */}
          <Sprockets side="left" y={perfY} opacity={perfOpacity} />
          <Sprockets side="right" y={perfY} opacity={perfOpacity} />

          {/* --- grade ------------------------------------------------- */}
          <Vignette strength={0.5} />
          <LightLeak progress={leakRun} />
          <LightLeak progress={leakBurn} />
          <FilmGrain opacity={0.15} />
          <FlashCut progress={scrollYProgress} at={SPLICES} />

          {/* --- the burn ---------------------------------------------
              z-44: above the blown frame at z-40, below the matte at z-50, so
              the blow-out stays inside the 2.39:1 frame like a real print. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[44]">
            <motion.div
              className="will-move absolute top-1/2 left-1/2 aspect-square w-[120%]"
              style={{
                scale: bloomScale,
                opacity: bloomOpacity,
                x: "-50%",
                y: "-50%",
                background:
                  "radial-gradient(closest-side, rgba(255,253,244,1) 0%, rgba(255,250,232,0.92) 34%, rgba(255,238,200,0.42) 66%, rgba(255,226,170,0) 100%)",
              }}
            />
            <motion.div
              className="will-move absolute inset-0 bg-[#fffdf4]"
              style={{ opacity: sheetOpacity }}
            />
          </div>

          {/* --- the matte -------------------------------------------- */}
          <Letterbox progress={letterbox} />
        </GateWeave>
      </div>

      <span className="sr-only">{SITE.name}</span>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Reduced-motion still — composed, not animated                              */
/* -------------------------------------------------------------------------- */

function StillWordmark(): JSX.Element {
  return (
    <svg viewBox="0 0 1000 260" className="block h-auto w-full" aria-hidden="true">
      <defs>
        <mask id={`${ID_WORD_MASK}-still`}>
          <rect width="1000" height="260" fill="black" />
          <text
            x="500"
            y="203"
            textAnchor="middle"
            textLength="904"
            lengthAdjust="spacingAndGlyphs"
            fontSize="248"
            fontWeight={600}
            fill="white"
            style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
          >
            {SITE.shortName}
          </text>
        </mask>
        <radialGradient id={`${ID_WORD_FALLOFF}-still`} cx="0.5" cy="0.5" r="0.72">
          <stop offset="52%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <g mask={`url(#${ID_WORD_MASK}-still)`}>
        <image
          href={HERO.image}
          x="0"
          y="0"
          width="1000"
          height="260"
          preserveAspectRatio="xMidYMid slice"
        />
        <rect width="1000" height="260" fill={`url(#${ID_WORD_FALLOFF}-still)`} />
      </g>
    </svg>
  );
}

function StaticSprockets({ side }: { side: "left" | "right" }): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 z-[15] w-[clamp(11px,1.6vw,19px)] overflow-clip ${
        side === "left" ? "left-0" : "right-0"
      }`}
    >
      <div className="absolute inset-x-[24%] inset-y-0" style={{ background: PERF_STOCK }} />
      <div
        className={`absolute inset-y-0 w-px bg-bone-100/10 ${
          side === "left" ? "right-0" : "left-0"
        }`}
      />
    </div>
  );
}
