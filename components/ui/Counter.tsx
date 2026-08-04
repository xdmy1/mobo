"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Count-up on scroll into view.
 *
 * Written to the DOM through a motion value subscription rather than React
 * state — a spring emitting ~60 values/sec through setState would re-render
 * the tree on every frame for a number that only needs its text node touched.
 */
export function Counter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1.2, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    if (reduce) return;
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(Math.round(v));
    });
  }, [spring, reduce]);

  return (
    <span className={className}>
      {/* Server-renders the final value, so it's correct with JS disabled and
          for screen readers; the animation only overwrites it client-side. */}
      <span ref={ref}>{reduce || !inView ? value : 0}</span>
      {suffix}
    </span>
  );
}
