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
 * imported and only mounts once the section is within 600px of the viewport;
 * the frameloop stops again beyond that margin. 6 draw calls, shadows rendered
 * once, no postprocessing, DPR capped at 2 (1.5 under 768px).
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
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
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

  useEffect(() => {
    setMounted(true);
    setWebgl(detectWebGL());
    setDprMax(window.innerWidth < 768 ? 1.5 : 2);
  }, []);

  // Mount the 3D bundle 600px out; park the frameloop beyond that margin.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const isNear = entries.some((e) => e.isIntersecting);
        setNear(isNear);
        if (isNear) setEverNear(true);
      },
      { rootMargin: "600px 0px 600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
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
  const show3d = mounted && webgl && !failed && everNear;

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
        <p className="absolute inset-0 flex items-center justify-center">
          <span className="font-semibold tracking-[-0.03em] text-bone-50 [font-size:clamp(4.5rem,17vw,15rem)] [text-shadow:0_4px_48px_rgb(0_0_0/0.55)]">
            {SITE.shortName}
          </span>
        </p>
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
      <span className="sr-only">
        {SITE.name} — {SITE.tagline}
      </span>
    </section>
  );
}
