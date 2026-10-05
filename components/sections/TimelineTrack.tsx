"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Firul cronologiei și umplerea lui la derulare — partea „vie" din Timeline.
 *
 * Reperele rămân randate pe server (copiii); componenta asta doar măsoară unde
 * stau punctele lor (`[data-dot]`) și întinde firul exact de la primul la
 * ultimul punct, ca drumul să se oprească în anul curent, nu sub textul lui.
 *
 * Umplerea urmărește o linie fixă la 70% din înălțimea ecranului: vârful ei e
 * mereu acolo unde citești. E decupată cu clip-path dintr-un gradient fix, nu
 * scalată — așa culoarea depinde de POZIȚIE: firul e fildeș pe drum și se
 * aprinde în lime abia spre ultimul an. Când vârful trece de un punct, reperul
 * primește `data-reached` (setat direct în DOM, fără re-randare React), iar
 * anul și punctul lui se aprind prin variantele `group-data-[reached]`.
 *
 * Sub prefers-reduced-motion nu se mișcă nimic: firul e plin și toate reperele
 * sunt aprinse de la început — aceeași stare finală, fără drum până la ea.
 */

/** Linia de citire, ca fracție din înălțimea ecranului. */
const READ_LINE = 0.7;

/** offsetTop cumulat până la `ancestor` — ignoră transform-urile din Reveal. */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

export default function TimelineTrack({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  /** Poziția fiecărui punct pe fir, 0…1 — pragul la care reperul se aprinde. */
  const stops = useRef<number[]>([]);
  const [span, setSpan] = useState<{ top: number; height: number } | null>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: thread,
    offset: [
      [0, READ_LINE],
      [1, READ_LINE],
    ],
  });
  const clipPath = useTransform(scrollYProgress, (p) => `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0)`);

  function light(p: number) {
    const items = root.current?.querySelectorAll<HTMLElement>("[data-milestone]");
    items?.forEach((item, i) => {
      const reached = reduce || (p > 0 && p >= (stops.current[i] ?? 0) - 0.002);
      if (reached) item.dataset.reached = "";
      else delete item.dataset.reached;
    });
  }

  useMotionValueEvent(scrollYProgress, "change", light);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const dots = Array.from(el.querySelectorAll<HTMLElement>("[data-dot]"));
      if (dots.length < 2) return;
      const centers = dots.map((d) => offsetWithin(d, el) + d.offsetHeight / 2);
      const top = centers[0];
      const height = centers[centers.length - 1] - top;
      stops.current = centers.map((c) => (c - top) / height);
      setSpan((prev) => (prev && prev.top === top && prev.height === height ? prev : { top, height }));
      light(scrollYProgress.get());
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // `light` citește `reduce` la fiecare apel; măsurătoarea se reface doar la resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const geometry = span ? { top: span.top, height: span.height } : undefined;

  return (
    <div ref={root} className={`relative ${className ?? ""}`}>
      <div
        ref={thread}
        aria-hidden="true"
        style={geometry}
        className="absolute left-[5px] w-px lg:left-[12.5rem] [&:not([style])]:inset-y-1"
      >
        <div className="absolute inset-0 bg-white/12" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/55 via-[62%] to-lime-brand"
          style={{ clipPath: reduce ? "none" : clipPath }}
        />
      </div>
      {children}
    </div>
  );
}
