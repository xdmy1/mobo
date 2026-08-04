"use client";

/**
 * "Object in the room" — the closing brand moment, in real 3D.
 *
 * The previous outros painted the kitchen INTO the wordmark (an SVG mask): a
 * graphic-design trick — flat, no parallax, no light. Here the wordmark is a
 * physical object: four extruded cabinet panels — graphite, oak, graphite and
 * one in the brand lime — standing in MOBO's own kitchen, lit by that kitchen
 * (the photo doubles as environment map), grounded by a contact shadow, and
 * filmed by a slow scroll-scrubbed dolly whose parallax against the backdrop
 * is what finally makes the depth undeniable.
 *
 * Layer order inside the stage, bottom to top:
 *   1. Poster — photograph + typographic wordmark. This is the loading state,
 *      the no-WebGL state and the context-lost state. Never a blank box.
 *   2. The 3D canvas, fading in over the poster once it has its textures.
 *   3. Film grain + vignette (DOM, effectively free).
 *
 * Degradation ladder:
 *   - WebGL missing / texture fails / context lost  -> poster stays.
 *   - prefers-reduced-motion  -> a genuinely different path: a single-viewport
 *     section (no 240svh track, no sticky, no scrubbing), the camera posed
 *     once at the end of the dolly, render-on-demand, zero drift.
 *
 * Performance contract: the 3D bundle (three + fiber + drei) is dynamically
 * imported and only mounts once the section is within 600px of the viewport,
 * while the frameloop runs only while the stage is actually on screen. Desktop
 * only. 6 draw calls, shadows rendered once, no postprocessing, DPR capped at
 * 2 (1.5 on coarse pointers or narrow windows).
 */

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { HERO, SITE } from "@/lib/data";

const OutroScene = dynamic(() => import("@/components/three/OutroScene"), {
  ssr: false,
});

/**
 * The photograph, routed through the Next image optimizer so the WebGL loader
 * fetches it same-origin — no CORS dependency on the WordPress host, and the
 * 4032px original is served at 1920px. (w must be a configured device size,
 * q must be an allowed quality; 1920/75 are both defaults.)
 */
const TEXTURE_URL = `/_next/image?url=${encodeURIComponent(HERO.image)}&w=1920&q=75`;

/** Catches loader/render failures inside the 3D tree; the poster remains. */
class SceneBoundary extends Component<
  { onFail: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    /* Release the probe. Browsers cap live WebGL contexts at roughly 8–16, and
       an abandoned one counts against that until it is garbage collected. */
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Desktop-class gate.
 *
 * The 3D scene runs on desktop only; phones and tablets get the poster, which
 * is a designed brand frame rather than a degraded one. Three reasons this is
 * the right split for this site specifically:
 *
 *   - The audience is furniture customers in Moldova, largely on mid-range
 *     Android over mobile data. The ~200KB three/fiber/drei chunk plus GPU
 *     load buys them very little: on a 360px stage the extruded letters are
 *     small enough that the parallax which sells the whole effect barely reads.
 *   - This is a lead-generation page. Battery, heat and jank near the contact
 *     form cost money; a slower page does not.
 *   - `pointer: fine` carries the test: it means a real cursor, so phones and
 *     tablets are excluded in every orientation without needing a height check.
 *
 * deviceMemory / hardwareConcurrency are non-standard, so they only ever veto
 * when actually reported; absent values are treated as capable.
 */
function isDesktopClass(): boolean {
  /* `pointer: fine` is the load-bearing test — it means a real cursor, which
     already excludes phones and tablets in every orientation. An earlier
     version also required min(innerWidth, innerHeight) >= 768 to catch
     landscape phones; that was redundant AND wrong, because a laptop browser
     window is only ~740-790px tall after chrome, so it rejected actual
     desktops. Width alone is the right second test. */
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const wideEnough = window.innerWidth >= 1024;

  /* Only genuinely low-end hardware is vetoed. An earlier version required
     hardwareConcurrency > 4, which rejected every 4-core machine — including
     most dual-core-with-hyperthreading laptops, which report exactly 4 and run
     this scene without difficulty. Combined with the height bug that preceded
     it, the gate was rejecting ordinary desktops. Both thresholds are now the
     floor rather than a comfort margin, and an unreported value never vetoes. */
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const notLowMemory = (nav.deviceMemory ?? 8) >= 4;
  const notSingleCore = (nav.hardwareConcurrency ?? 8) >= 4;

  return finePointer && wideEnough && notLowMemory && notSingleCore;
}

export default function OutroReal() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [near, setNear] = useState(false);
  /* Latched: the scene mounts once and stays resident; only the frameloop
     follows `near`. Unmounting on every exit would re-fetch textures and
     re-extrude geometry on every pass over the section. */
  const [everNear, setEverNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dprMax, setDprMax] = useState(2);
  const [desktopClass, setDesktopClass] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebgl(detectWebGL());
    /* Coarse pointer or a narrow window caps DPR at 1.5. The coarse test is
       what actually protects mobile GPUs from a 2x multisampled buffer. */
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    /* Capped at 1.5 even on desktop. At DPR 2 a full-viewport canvas on a
       Retina display is ~6M pixels through five post passes; 1.5 cuts that by
       ~44% and is indistinguishable once DoF and grain are applied. Very wide
       windows drop further — cost scales with area, not with how impressive
       the machine is. */
    const wide = window.innerWidth >= 2000;
    setDprMax(coarse || window.innerWidth < 1024 ? 1.5 : wide ? 1.25 : 1.5);
    setDesktopClass(isDesktopClass());
  }, []);

  /**
   * Two observers, because "mount" and "run" are different questions.
   *
   * A single 600px-margin observer meant the render loop was still running at
   * 60fps while the section sat just off-screen — which is exactly where the
   * lead form and the footer phone number are. The site was spending GPU and
   * battery animating a centimetre of camera drift at the precise moment the
   * customer was filling in the thing the site exists to collect.
   *
   *   everNear (600px) — mount the bundle, extrude geometry, build textures
   *   active   (0px)   — actually render frames
   */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const preload = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setEverNear(true);
      },
      { rootMargin: "600px 0px 600px 0px" },
    );
    const live = new IntersectionObserver(
      (entries) => setNear(entries.some((e) => e.isIntersecting)),
      { rootMargin: "0px" },
    );

    preload.observe(el);
    live.observe(el);
    return () => {
      preload.disconnect();
      live.disconnect();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const captionOpacity = useTransform(scrollYProgress, [0.7, 0.92], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.7, 0.92], [14, 0]);

  const handleFail = useCallback(() => setFailed(true), []);
  const handleReady = useCallback(() => setReady(true), []);

  /* `mounted` guard: reduced-motion resolves client-side only, and the server
     markup must hydrate cleanly before the layout may branch. */
  const still = mounted && prefersReduced === true;
  const show3d = mounted && webgl && desktopClass && !failed && everNear;

  /**
   * Warm the 3D chunk during idle time after first paint, instead of waiting
   * for the section to come within 600px.
   *
   * Reported symptom: "when i scroll first i see simple mobo text for a few
   * seconds, not the animation". The bundle only began downloading once the
   * user was already approaching the section, so on anything but a fast
   * connection the poster was still on screen when they arrived. Fetching it
   * while the browser is idle costs nothing perceptible and means the scene is
   * compiled and ready before it is ever needed.
   */
  useEffect(() => {
    if (!mounted || !webgl || !desktopClass || prefersReduced) return;
    /* Warm BOTH halves of the cold start, not just the code.
       The scene cannot begin its texture work until the photograph has been
       downloaded and decoded, so fetching the chunk alone still left the user
       staring at the poster while a ~200KB JPEG came down. Kicking off the
       image here puts it in the HTTP cache — and, with decode(), already
       decoded — long before the section is reached, so by the time the scene
       mounts the bitmap is effectively free. */
    const warm = () => {
      void import("@/components/three/OutroScene");
      const img = new window.Image();
      img.decoding = "async";
      img.src = TEXTURE_URL;
      void img.decode?.().catch(() => {});
    };
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(warm, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(warm, 1200);
    return () => window.clearTimeout(t);
  }, [mounted, webgl, desktopClass, prefersReduced]);

  /**
   * The poster's typographic wordmark is a FALLBACK, not a loading state.
   *
   * It was rendering unconditionally, so the common path showed flat display
   * type and then cross-faded it into differently-shaped, differently-placed
   * 3D glyphs — a visible double exposure, and the thing the client noticed
   * immediately. Now it appears only when the 3D genuinely is not coming.
   * While the scene loads, the photograph alone holds the frame, so the
   * letters arrive as an addition rather than a substitution.
   */
  const showPosterWordmark = mounted && (!webgl || !desktopClass || failed || still);

  const stage = (
    <>
      {/* 1 — poster. Loading frame, no-WebGL frame, context-lost frame. */}
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src={HERO.image}
          alt=""
          fill
          sizes="100vw"
          quality={75}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/15 to-ink-950/35" />
        {showPosterWordmark && (
          <p className="absolute inset-0 flex items-center justify-center">
            <span className="font-semibold tracking-[-0.03em] text-bone-50 [font-size:clamp(4.5rem,17vw,15rem)] [text-shadow:0_4px_48px_rgb(0_0_0/0.55)]">
              {SITE.shortName}
            </span>
          </p>
        )}
      </div>

      {/* 2 — the shot. Fades in over the poster once textures are resolved. */}
      {show3d && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          <SceneBoundary onFail={handleFail}>
            <OutroScene
              src={TEXTURE_URL}
              progress={still ? null : scrollYProgress}
              active={near}
              dprMax={dprMax}
              onReady={handleReady}
              onFail={handleFail}
            />
          </SceneBoundary>
        </div>
      )}

      {/* 3 — film grain + vignette, both DOM, both cheap. */}
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 55%, rgb(9 10 7 / 0.42) 100%)",
        }}
      />
    </>
  );

  /* Reduced motion: one viewport, no scroll track, no sticky, no scrubbing —
     the resolved final frame of the dolly, held. */
  if (still) {
    return (
      <section ref={sectionRef} className="relative isolate w-full overflow-hidden bg-ink-950">
        <div className="relative h-svh w-full overflow-hidden">
          {stage}
          <p className="absolute inset-x-0 bottom-[7svh] z-10 px-5 text-center text-eyebrow text-fg-dim">
            {SITE.tagline} · {HERO.location}
          </p>
        </div>
        <span className="sr-only">
          {SITE.name} — {SITE.tagline}
        </span>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative isolate h-[240svh] w-full bg-ink-950">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {stage}
        <motion.p
          style={{ opacity: captionOpacity, y: captionY }}
          className="absolute inset-x-0 bottom-[7svh] z-10 px-5 text-center text-eyebrow text-fg-dim"
        >
          {SITE.tagline} · {HERO.location}
        </motion.p>
      </div>
      {/* The visible caption already carries the tagline; repeating it here
          made screen readers announce it twice in a row. Name only. */}
      <span className="sr-only">{SITE.name}</span>
    </section>
  );
}
