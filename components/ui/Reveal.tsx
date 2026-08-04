"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE_OUT, STAGGER, VIEWPORT } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds. Prefer `index` on siblings over hand-tuning this. */
  delay?: number;
  /** Position in a cascade — multiplied by the house stagger. */
  index?: number;
  /** Travel direction. `none` fades only. */
  from?: "bottom" | "left" | "right" | "none";
  as?: "div" | "section" | "li" | "article" | "span";
};

const OFFSET = 24;

/**
 * The house scroll reveal: rise + fade, fired once.
 *
 * Under prefers-reduced-motion this becomes a pure cross-fade — reduced motion
 * means gentler feedback, not the absence of it, so the element still announces
 * its arrival, it just doesn't travel.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  index = 0,
  from = "bottom",
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  const offset = reduce || from === "none" ? {} : from === "bottom" ? { y: OFFSET } : from === "left" ? { x: -OFFSET } : { x: OFFSET };

  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: reduce ? DUR.micro : DUR.reveal,
        ease: EASE_OUT,
        delay: delay + index * STAGGER,
      },
    },
  };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Word-by-word headline reveal.
 *
 * Words are wrapped in an overflow-hidden span and pushed up from below their
 * own line box, so they read as rising into place rather than fading in.
 */
export function RevealText({
  text,
  className,
  wordClassName,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.micro, delay }}
      >
        {text}
      </motion.span>
    );
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      transition={{ staggerChildren: 0.045, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          // -0.15em bottom padding keeps descenders (ș, ț, g) from being clipped.
          className="inline-block overflow-hidden pb-[0.15em] align-bottom"
          aria-hidden="true"
        >
          <motion.span
            className={`inline-block ${wordClassName ?? ""}`}
            variants={{
              hidden: { y: "110%" },
              visible: { y: 0, transition: { duration: 0.75, ease: EASE_OUT } },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
