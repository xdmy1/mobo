"use client";

import { useMemo, type JSX, type ReactNode } from "react";
import {
  cubicBezier,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * FILM GRADE — the layer that makes a web page read as projected film.
 *
 * A title sequence does not become cinematic because things move. It becomes
 * cinematic because of the *artefacts of the medium*: the shape of the frame,
 * the instability of the gate, grain that re-randomises every frame, the blown
 * frame at a splice, light that got onto the stock. None of those are motion
 * design — they are physical defects, and they are what the eye reads as "film".
 *
 * This module ships those defects as composable layers. Nothing here carries
 * meaning; every layer is `aria-hidden` and `pointer-events-none`, with one
 * deliberate exception documented on GateWeave.
 *
 * ── STACKING ORDER ────────────────────────────────────────────────────────
 * Each layer carries its own z so that consumers can drop them in any source
 * order and still get a physically-correct stack:
 *
 *    z-10  Vignette     lens falloff — happens at the taking lens, sits lowest
 *    z-20  LightLeak    light that reached the stock, so it is *in* the image
 *    z-30  FilmGrain    the stock itself, therefore above everything imaged
 *    z-40  FlashCut     the blown frame at a splice — the print, above the stock
 *    z-50  Letterbox    a physical matte in the projector gate. Above all of it.
 *
 * Every layer accepts `className`, merged through `cn()` so a consumer's
 * utilities win over these defaults.
 *
 * ── PERFORMANCE CONTRACT ──────────────────────────────────────────────────
 * Only `transform` and `opacity` animate. There is no CSS `filter` anywhere in
 * this file: the light leak is built from a wide multi-stop gradient (already
 * band-limited, so it needs no blur), and the grain's `feTurbulence` lives
 * inside a `background-image` data URI, which the browser rasterises once into
 * a tile — it is not a live filter on a live layer.
 *
 * ── REDUCED MOTION ────────────────────────────────────────────────────────
 * Each effect degrades to something a vestibular- or photosensitive user can
 * actually look at, not to a disabled transform:
 *    FilmGrain   keeps the texture, drops the per-frame shift.
 *    Vignette    unchanged — it never moved.
 *    Letterbox   renders the finished 2.39:1 frame, composed, not animated.
 *    GateWeave   the rAF loop is never mounted at all.
 *    FlashCut    renders nothing. A strobe is not something to soften.
 *    LightLeak   one static warm bloom instead of a sweep.
 */

/* -------------------------------------------------------------------------- */
/* Curves                                                                     */
/* -------------------------------------------------------------------------- */

type Cubic = [number, number, number, number];

/**
 * Curves tuned for film, not for UI. These are deliberately NOT the house
 * tokens in `lib/motion.ts` — those are sized for interface response (under
 * 300ms, always ease-out). A camera is a physical object with mass on a rig,
 * and it obeys different rules.
 *
 * `cut` and `move` both begin with a slow start, which the house rules forbid
 * on UI. That prohibition is about interface latency: a control must respond
 * the instant you touch it. Nothing in this module is a control — these drive
 * a camera and a splice, where an instant start is precisely what reads wrong.
 * (`EASE_IN_OUT` in lib/motion.ts is the same shape, for the same reason.)
 */
export const FILM_EASE: { cut: Cubic; move: Cubic; settle: Cubic } = {
  /**
   * The splice. Almost nothing, then everything, then almost nothing — an
   * S so steep it reads as a discontinuity rather than a transition. Use it
   * for flash frames and hard shot changes, never for travel.
   */
  cut: [0.87, 0, 0.13, 1],

  /**
   * The camera move. A dolly takes up its own slack before it goes anywhere,
   * glides for a long confident middle, and arrives without ever snapping.
   * The long near-linear centre is the whole point: snappy camera moves are
   * the single clearest tell of a web animation pretending to be cinema.
   */
  move: [0.34, 0.01, 0.15, 1],

  /**
   * The weighted landing. Enormous initial velocity, then a long creep home —
   * the soft-close drawer MOBO actually manufactures. Heavier than the house
   * `EASE_OUT`; use it for anything that should feel like it caught itself.
   */
  settle: [0.1, 0.9, 0.2, 1],
};

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Anamorphic 2.39:1 inside a 16:9 frame leaves ~12.8% of the height as bar, each side. */
const BAR_HEIGHT = "12.8%";

/* -------------------------------------------------------------------------- */
/* FilmGrain                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Grain must be driven by CSS keyframes rather than by a rAF loop.
 *
 * A rAF loop writing a transform every frame is main-thread work that runs for
 * the entire length of the sequence, competing with the scroll handler that is
 * scrubbing the actual shots. A CSS keyframe animation on `transform` is handed
 * to the compositor and costs the main thread nothing — and grain is the one
 * effect on screen at literally all times.
 *
 * `steps(1, end)` is what makes it read as film. Real grain does not slide; it
 * re-randomises on every exposed frame. Interpolating the offsets would give a
 * smoothly drifting texture, which reads as a dirty screen. Ten stops over 0.6s
 * steps the tile ~16 times a second — below 24fps, but the eye reads any
 * discontinuous re-randomisation as grain, and the cheaper rate is free.
 *
 * The offsets are deliberately not multiples of the tile: the tile is seamless
 * (`stitchTiles='stitch'`), so a whole-tile shift would be a no-op.
 */
const GRAIN_LAYER_CLASS = "mobo-film-grain-plate";

const GRAIN_CSS = `
@keyframes mobo-film-grain-step {
  0%   { transform: translate3d(0, 0, 0); }
  10%  { transform: translate3d(-9px, 5px, 0); }
  20%  { transform: translate3d(6px, -11px, 0); }
  30%  { transform: translate3d(-13px, -4px, 0); }
  40%  { transform: translate3d(11px, 8px, 0); }
  50%  { transform: translate3d(-4px, 12px, 0); }
  60%  { transform: translate3d(13px, -7px, 0); }
  70%  { transform: translate3d(-7px, -13px, 0); }
  80%  { transform: translate3d(4px, 10px, 0); }
  90%  { transform: translate3d(-11px, -2px, 0); }
}
.${GRAIN_LAYER_CLASS} {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='mobo-film-grain-turbulence' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23mobo-film-grain-turbulence)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
  will-change: transform;
  animation: mobo-film-grain-step 0.6s steps(1, end) infinite;
}
/* Grain is a property of the film stock, not of the display. Halving the tile
   on 2x panels keeps a grain particle at roughly one *device* pixel, instead of
   doubling in size and turning into visible mush. */
@media (min-resolution: 2dppx) {
  .${GRAIN_LAYER_CLASS} { background-size: 100px 100px; }
}
@media (prefers-reduced-motion: reduce) {
  .${GRAIN_LAYER_CLASS} { animation: none; }
}
`;

/**
 * Animated film grain.
 *
 * The noise is monochrome by design (`feColorMatrix saturate 0`). Raw
 * `feTurbulence` output is *colour* noise, which the eye reads as chroma
 * compression artefacts — a JPEG tell, the opposite of the intent. Real
 * silver-halide grain is achromatic.
 *
 * Blended normally rather than with `mix-blend-mode: overlay`: over the
 * near-black `ink-950` stage, overlay collapses to multiply and the grain
 * disappears into the blacks exactly where banding needs breaking up.
 *
 * @param opacity Strength of the plate. Above ~0.3 it stops being a stock and
 *                starts being a texture. Clamped to 0–0.6.
 */
export function FilmGrain({
  opacity = 0.14,
  className,
}: {
  opacity?: number;
  className?: string;
}): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-30 overflow-clip", className)}
      style={{ opacity: clamp(opacity, 0, 0.6) }}
    >
      {/* React 19 hoists and de-dupes this by `href`, so N grain layers still
          emit exactly one stylesheet. */}
      <style
        href="mobo-film-grain"
        precedence="default"
        dangerouslySetInnerHTML={{ __html: GRAIN_CSS }}
      />
      {/* Overhangs the frame by 24px so the ±13px step never exposes an edge.
          `contain` keeps the plate's repaint inside its own compositing layer
          instead of inviting the page to re-raster with it. */}
      <div
        className={cn("absolute -inset-6", GRAIN_LAYER_CLASS)}
        style={{ contain: "layout paint" }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Vignette                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Lens falloff. Never animates — a vignette that moves is a lens that is
 * falling apart.
 *
 * Three stops rather than two: a two-stop radial across a full-bleed dark
 * stage bands badly on wide-gamut panels. The centre sits slightly high (46%)
 * because that is where a real lens and a real projector put their hot spot,
 * and it flatters a horizon-height wordmark.
 *
 * The black is warmed to #060604 to sit inside the warm-graphite palette;
 * pure #000 reads blue against `ink-850`.
 *
 * @param strength Corner density, 0–1. Default is deliberately quiet.
 */
export function Vignette({
  strength = 0.55,
  className,
}: {
  strength?: number;
  className?: string;
}): JSX.Element {
  const s = clamp(strength, 0, 1);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-10", className)}
      style={{
        background: `radial-gradient(120% 88% at 50% 46%, rgba(6,6,4,0) 34%, rgba(6,6,4,${(
          s * 0.3
        ).toFixed(3)}) 68%, rgba(6,6,4,${s.toFixed(3)}) 100%)`,
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Letterbox                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Anamorphic 2.39:1 mattes, top and bottom.
 *
 * The strongest single signal that you are watching a film is not motion — it
 * is the shape of the frame. Once the page changes aspect ratio, everything
 * inside it is read as footage.
 *
 * Driven on `scaleY` from the outer edges (`origin-top` / `origin-bottom`), so
 * the bars grow inward without a single layout-affecting property. `useTransform`
 * clamps, so a progress value that overshoots 0–1 cannot invert a bar.
 *
 * Sits at z-50: the matte is physically in front of the gate, and nothing in
 * the shot — grain, flash, leak — may spill past it.
 *
 * @param progress 0 = open frame, 1 = fully letterboxed.
 */
export function Letterbox({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}): JSX.Element {
  const reduce = useReducedMotion();
  const scaleY = useTransform(progress, [0, 1], [0, 1]);

  /* Reduced motion gets the composed still: the frame is already cinema when
     you arrive, because arriving is not something you should have to watch. */
  if (reduce) {
    return (
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 z-50", className)}
      >
        <div className="absolute inset-x-0 top-0 bg-black" style={{ height: BAR_HEIGHT }} />
        <div className="absolute inset-x-0 bottom-0 bg-black" style={{ height: BAR_HEIGHT }} />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 z-50", className)}>
      <motion.div
        className="will-move absolute inset-x-0 top-0 origin-top bg-black"
        style={{ height: BAR_HEIGHT, scaleY }}
      />
      <motion.div
        className="will-move absolute inset-x-0 bottom-0 origin-bottom bg-black"
        style={{ height: BAR_HEIGHT, scaleY }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* GateWeave                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Gate weave — the physical instability of film running through a projector.
 *
 * This is the most underrated "it's film" cue there is, and the reason is that
 * you are not supposed to notice it. A locked-off digital frame is *perfectly*
 * still in a way no projected image has ever been. Restore about two pixels of
 * irregular drift and the same footage stops looking rendered.
 *
 * Amplitude is roughly 2.4px of x, 2.9px of y and 0.09° of roll — under 0.2% of
 * a 1440px frame. Push it past ~1% and it stops reading as a projector and
 * starts reading as a bug.
 *
 * Irregularity comes from three sine waves per axis at mutually irrational-ish
 * frequencies, so the pattern never visibly loops. It is driven from the frame
 * clock, NOT from `Math.random()`: random values at module scope or during
 * render produce different markup on server and client and break hydration.
 * This is deterministic — the same time always yields the same offset.
 *
 * NOTE ON ACCESSIBILITY: GateWeave is the one export here that is neither
 * `aria-hidden` nor `pointer-events-none`, because it is a *container* rather
 * than an overlay. Hiding it would hide the entire sequence — including the
 * sr-only brand name — from assistive tech, and disabling pointer events would
 * kill any control the sequence wraps.
 *
 * @param amount Multiplier on the base amplitude. Clamped to 0–3.
 */
export function GateWeave({
  children,
  amount = 1,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}): JSX.Element {
  const reduce = useReducedMotion();

  /* A different component, not a disabled transform: under reduced motion the
     rAF loop is never mounted, so there is no per-frame work at all. */
  if (reduce) {
    return <div className={cn("relative overflow-clip", className)}>{children}</div>;
  }

  return (
    <WeaveStage amount={amount} className={className}>
      {children}
    </WeaveStage>
  );
}

function WeaveStage({
  children,
  amount,
  className,
}: {
  children: ReactNode;
  amount: number;
  className?: string;
}): JSX.Element {
  const a = clamp(amount, 0, 3);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  useAnimationFrame((t) => {
    const s = t / 1000;
    /* Three octaves per axis: a slow wander, a mid tremor, and a fast jitter.
       Writing MotionValues from rAF never triggers a React render. */
    x.set(a * (Math.sin(s * 0.93) * 1.3 + Math.sin(s * 2.37 + 1.7) * 0.72 + Math.sin(s * 5.11 + 0.4) * 0.34));
    y.set(a * (Math.sin(s * 0.71 + 2.1) * 1.6 + Math.sin(s * 1.93 + 0.6) * 0.86 + Math.sin(s * 4.37 + 1.2) * 0.41));
    rotate.set(a * (Math.sin(s * 0.53 + 1.1) * 0.062 + Math.sin(s * 1.31 + 2.4) * 0.028));
  });

  return (
    <div className={cn("relative overflow-clip", className)}>
      <motion.div
        /* 1.2% overscan, exactly as a projector overscans its aperture: the
           weave and the roll would otherwise expose a hairline of background at
           the frame edge on every excursion. Static, so it costs nothing.
           `overflow-clip` on the parent (never `overflow-hidden`) keeps that
           overscan from widening the document — clip does not create a scroll
           container, so a sticky stage inside still sticks.
           `relative h-full w-full` so the inner box is coincident with the outer
           in BOTH render paths: absolutely-positioned children of a GateWeave
           land in the same place with or without reduced motion. */
        className="will-move relative h-full w-full"
        style={{ x, y, rotate, scale: 1.012 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FlashCut                                                                   */
/* -------------------------------------------------------------------------- */

/** Ramp up into the blown frame, in progress units. ~0.4% — effectively instant. */
const FLASH_IN = 0.004;
/** Decay out of it. Three times the attack: a blown frame dies, it does not switch off. */
const FLASH_OUT = 0.012;

const flashEase = cubicBezier(...FILM_EASE.cut);

/**
 * The blown frame at a splice.
 *
 * When two shots are physically cut together, the frames either side of the
 * join are over-exposed by the printer. That single white frame is what sells
 * a hard cut — without it a cut is just a fast dissolve, and reads as a web
 * transition. With it, the eye is briefly blinded and re-opens on new content,
 * which is exactly how a cut works in a cinema.
 *
 * Sharpness is geometric, not eased: each flash occupies ~1.6% of progress,
 * asymmetric (fast attack, slightly longer decay). Overlapping entries in `at`
 * are dropped rather than merged — `useTransform` requires a strictly
 * increasing input range, and two splices 1% apart is not a thing anyway.
 *
 * `mix-blend-mode: screen` rather than a flat white fill: screening a warm
 * near-white over the shot blows the highlights out first and drags the
 * shadows up last, which is what over-exposure actually does to an image.
 *
 * @param at Progress values to place a flash at.
 */
export function FlashCut({
  progress,
  at,
  className,
}: {
  progress: MotionValue<number>;
  at: number[];
  className?: string;
}): JSX.Element {
  const reduce = useReducedMotion();

  /* Keyed on the serialised values, not on array identity: an inline literal
     (`at={[0.2, 0.5]}`) is a new array every render and would rebuild the
     interpolation on every frame of a scroll. */
  const key = at.join(",");
  const [inputs, outputs] = useMemo(() => {
    const points = key
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n))
      .sort((p, q) => p - q);

    const inp: number[] = [];
    const out: number[] = [];

    for (const p of points) {
      const start = p - FLASH_IN;
      /* Strictly increasing, or the interpolation silently breaks. */
      if (inp.length > 0 && start <= inp[inp.length - 1]) continue;
      inp.push(start, p, p + FLASH_OUT * 0.28, p + FLASH_OUT);
      out.push(0, 1, 0.34, 0);
    }

    if (inp.length < 2) return [[0, 1], [0, 0]];
    return [inp, out];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` is the value identity of `at`
  }, [key]);

  const opacity = useTransform(progress, inputs, outputs, { ease: flashEase });

  /* Photosensitivity, not vestibular: a strobe cannot be made gentle, so under
     reduced motion the layer renders nothing whatsoever. */
  if (reduce) return <></>;

  return (
    <motion.div
      aria-hidden="true"
      className={cn("will-move pointer-events-none absolute inset-0 z-40 mix-blend-screen", className)}
      style={{
        opacity,
        background:
          "radial-gradient(120% 120% at 50% 42%, #fffdf4 0%, #fff3d2 38%, #ffcf8f 72%, #f7a94e 100%)",
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* LightLeak                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A warm bloom raking across the frame — light that got past the felt and hit
 * the stock before it was developed.
 *
 * Built from one wide multi-stop gradient rather than a blurred shape. A
 * gradient is already band-limited, so it needs no `filter: blur()`; on a
 * full-bleed layer that filter would be the most expensive thing on the page
 * and would buy nothing the extra stops do not already give.
 *
 * The band is rotated ~12° and travels on `x` in percentages of its own width,
 * so the sweep is pure transform. Opacity rises and falls across the pass —
 * light leaks bloom and die, they do not cut.
 *
 * @param progress 0 = leak off frame at the left, 1 = off frame at the right.
 */
export function LightLeak({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}): JSX.Element {
  const reduce = useReducedMotion();

  const x = useTransform(progress, [0, 1], ["-130%", "260%"]);
  const opacity = useTransform(progress, [0, 0.16, 0.5, 0.84, 1], [0, 0.78, 1, 0.55, 0]);

  /* Not a dimmed sweep — a still. The frame keeps its warm signature in one
     fixed corner, which is what a leak looks like in a single held frame. */
  if (reduce) {
    return (
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 z-20", className)}
        style={{
          background:
            "radial-gradient(58% 44% at 82% 16%, rgba(255,226,170,0.16) 0%, rgba(255,196,120,0.06) 46%, rgba(255,180,100,0) 72%)",
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-20 overflow-clip", className)}
    >
      <motion.div
        className="will-move absolute inset-y-[-30%] left-0 w-[46%] mix-blend-screen"
        style={{
          x,
          opacity,
          rotate: -12,
          background:
            "linear-gradient(90deg, rgba(255,214,150,0) 0%, rgba(255,206,138,0.10) 18%, rgba(255,226,170,0.34) 38%, rgba(255,247,225,0.55) 50%, rgba(255,198,120,0.30) 64%, rgba(255,170,90,0.06) 86%, rgba(255,160,80,0) 100%)",
        }}
      />
    </div>
  );
}
