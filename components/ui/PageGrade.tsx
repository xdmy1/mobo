"use client";

import type { JSX } from "react";
import { motion, useReducedMotion, useScroll } from "motion/react";

/**
 * PAGE GRADE — one fixed layer that grades the whole page as a single piece of
 * footage, so the outro's film treatment (grain / vignette / letterbox) reads
 * as the culmination of the page rather than a costume change in the last
 * screen.
 *
 * Mounted once in app/layout.tsx, above all content, `pointer-events-none`.
 *
 * ── WHAT IT SHIPS ─────────────────────────────────────────────────────────
 *   1. Grain     — 0.02 opacity (the outro's `.grain` is 0.035 and film.tsx's
 *                  FilmGrain defaults to 0.14; this is deliberately far below
 *                  both — it runs for the whole visit). Achromatic feTurbulence
 *                  tile rasterised ONCE from a data URI, stepped by a CSS
 *                  keyframe on `transform` at ~5 re-randomisations/s. Stepped,
 *                  not drifting: sliding noise reads as dirt on the screen;
 *                  re-randomising noise reads as stock.
 *   2. Vignette  — static radial falloff, corners max 0.13 alpha of warmed
 *                  black #060604 (pure #000 reads blue against ink-850).
 *                  Three stops so it cannot band on wide-gamut panels.
 *   3. Progress  — a 1px lime hairline at the viewport top, `scaleX` driven
 *                  from `useScroll().scrollYProgress`. Transform-only, never
 *                  width. (A timecode readout was considered and rejected: it
 *                  needs per-scroll text writes on the main thread and has no
 *                  guaranteed-legible background to sit on.)
 *   4. First-paint veil — resolves from black once per session, 480ms + 40ms
 *                  delay on the house EASE_OUT. The gate is a synchronous
 *                  inline script (parses before the veil element) that checks
 *                  sessionStorage and, only on the first load, arms the CSS
 *                  animation by appending a one-rule <style> to <head>.
 *                  Head insertion is the one pre-hydration DOM write React 19
 *                  tolerates without mismatch warnings (every analytics tag
 *                  does it); nothing React-managed is ever touched. The fade
 *                  itself is pure CSS: it completes even if hydration never
 *                  happens, and if sessionStorage is unavailable the catch
 *                  block leaves the veil at its base `opacity: 0` — skipped
 *                  entirely, never repeated. Layout persists across client
 *                  navigations, and the flag guards any remount besides.
 *
 * ── DELIBERATELY LEFT OUT ─────────────────────────────────────────────────
 *   Gate weave  — wobbling the entire product UI (forms, nav, buttons) is a
 *                 bug, not a grade. It belongs to the outro's sealed stage.
 *   Light leaks / flash frames / scanlines / chroma — colour events over live
 *                 content are exactly the "effects demo" register to avoid.
 *
 * ── WHY THIS CANNOT BREAK THE GLASS (`backdrop-filter`) BELOW ─────────────
 *   `backdrop-filter` samples what is painted BEHIND an element within its
 *   backdrop root. This layer (a) is a SIBLING of the page content — it wraps
 *   nothing, so it can never be an ancestor of a glass surface and can never
 *   introduce a filter/opacity-induced backdrop root into a glass element's
 *   ancestor chain; and (b) paints ABOVE everything, so it is never part of
 *   any glass element's sampled backdrop. It uses NO `filter`, NO
 *   `backdrop-filter`, NO `mix-blend-mode` anywhere — the grain is a
 *   pre-rasterised background-image tile, not a live filter. The root's own
 *   z-index stacking context contains only its own leaves.
 *
 * ── PERFORMANCE CONTRACT ──────────────────────────────────────────────────
 *   Steady-state main-thread cost: zero. The grain steps on a compositor-run
 *   CSS transform animation; the vignette paints once into the root's layer;
 *   the veil is a one-shot CSS opacity animation; the hairline is a
 *   MotionValue write only on scroll frames. Two viewport-sized compositor
 *   layers total (root+vignette, grain tile) ≈ 8–9 MB GPU at 375×812 @2x.
 *   Nothing repaints after the first rasterisation.
 *
 * ── ACCESSIBILITY ─────────────────────────────────────────────────────────
 *   prefers-reduced-motion      grain freezes, veil never shows, hairline is
 *                               not rendered. Static and calm.
 *   prefers-contrast: more,
 *   prefers-reduced-transparency,
 *   forced-colors               grain, vignette and veil are display:none.
 *   Everything is aria-hidden and pointer-events-none — it can never take a
 *   click, hover, focus or scroll.
 */

const GRADE_CSS = `
@keyframes mobo-grade-grain-step {
  0%     { transform: translate3d(0, 0, 0); }
  12.5%  { transform: translate3d(-11px, 7px, 0); }
  25%    { transform: translate3d(7px, -13px, 0); }
  37.5%  { transform: translate3d(-15px, -5px, 0); }
  50%    { transform: translate3d(12px, 10px, 0); }
  62.5%  { transform: translate3d(-6px, 15px, 0); }
  75%    { transform: translate3d(16px, -9px, 0); }
  87.5%  { transform: translate3d(-9px, -16px, 0); }
}
.mobo-grade-grain {
  opacity: 0.02;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='176' height='176'%3E%3Cfilter id='g' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='176' height='176' filter='url(%23g)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 176px 176px;
  will-change: transform;
  animation: mobo-grade-grain-step 1.5s steps(1, end) infinite;
  contain: layout paint;
}
/* Grain is a property of the stock, not the display: halve the tile on 2x
   panels so a grain particle stays ~1 device pixel instead of turning to mush. */
@media (min-resolution: 2dppx) {
  .mobo-grade-grain { background-size: 88px 88px; }
}
.mobo-grade-vignette {
  background: radial-gradient(
    140% 105% at 50% 44%,
    rgb(6 6 4 / 0) 60%,
    rgb(6 6 4 / 0.045) 82%,
    rgb(6 6 4 / 0.13) 100%
  );
}
@keyframes mobo-page-veil-fade {
  from { opacity: 1; }
  to   { opacity: 0; }
}
/* Base state is invisible. Only the session-gated inline script can arm the
   fade, by injecting the animation rule — so with no JS, no storage, or a
   repeat visit, this stays 0 and never covers content. */
#mobo-page-veil {
  opacity: 0;
  background: #0a0a08;
}
@media (prefers-reduced-motion: reduce) {
  .mobo-grade-grain { animation: none !important; }
  #mobo-page-veil   { animation: none !important; }
}
/* A user asking for maximum contrast or minimum transparency does not want a
   film texture over their text. The functional hairline stays; the grade goes. */
@media (prefers-contrast: more), (prefers-reduced-transparency: reduce), (forced-colors: active) {
  .mobo-grade-texture { display: none !important; }
}
`;

/**
 * Runs synchronously during HTML parse, before the veil element exists and
 * before hydration. Touches only <head> (hydration-safe) and sessionStorage.
 * Any storage failure — disabled, full, private mode — lands in the catch and
 * the fade is skipped for good, never risked on repeat.
 */
const VEIL_SCRIPT =
  '(function(){try{var k="mobo-grade-resolved";if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,"1");var s=document.createElement("style");s.textContent="#mobo-page-veil{animation:mobo-page-veil-fade 480ms cubic-bezier(0.23,1,0.32,1) 40ms both}";document.head.appendChild(s)}catch(e){}})();';

export default function PageGrade(): JSX.Element {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] overflow-clip"
    >
      {/* React 19 hoists and de-dupes this by `href` — one stylesheet, once. */}
      <style
        href="mobo-page-grade"
        precedence="default"
        dangerouslySetInnerHTML={{ __html: GRADE_CSS }}
      />

      {/* Vignette. Static — a vignette that moves is a lens falling apart.
          No will-change: it paints once into the root's own layer. */}
      <div className="mobo-grade-texture mobo-grade-vignette absolute inset-0" />

      {/* Grain. Overhangs by 24px so the ±16px steps never expose an edge;
          the root's overflow-clip keeps the overhang out of the document. */}
      <div className="mobo-grade-texture mobo-grade-grain absolute -inset-6" />

      {/* First-paint veil. The script MUST precede the element: it executes
          while parsing, so the animation is armed before the veil can paint. */}
      <script dangerouslySetInnerHTML={{ __html: VEIL_SCRIPT }} />
      <div id="mobo-page-veil" className="mobo-grade-texture absolute inset-0" />

      {/* Scroll progress — a hairline, not a loading bar. Transform-only:
          scaleX from the left edge, written by Motion outside React renders,
          and only on frames where the scroll position actually changed.
          Invisible at the top of the page (scaleX 0), complete at the outro. */}
      {!reduce && (
        <motion.div
          className="absolute inset-x-0 top-0 h-px origin-left bg-lime-brand/90 will-change-transform"
          style={{ scaleX: scrollYProgress }}
        />
      )}
    </div>
  );
}
