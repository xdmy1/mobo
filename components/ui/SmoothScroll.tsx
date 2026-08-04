"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scroll — the same library navarro.ro uses, and a large part of
 * why that site feels the way it does.
 *
 * Two things matter here beyond mounting it:
 *  - It must be disabled entirely under prefers-reduced-motion. Hijacked scroll
 *    is a vestibular trigger, and it's the one animation a user cannot avoid.
 *  - It must not run on touch. Mobile browsers already have excellent native
 *    momentum scrolling; overriding it makes the page feel worse, not better.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    if (reduceMotion.matches || coarsePointer.matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      /* Exponential ease-out: fast start, long soft settle. */
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 2,
      /* Native scroll on touch — see note above. */
      syncTouch: false,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    /* Anchor links must go through Lenis or they snap while the page glides. */
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
