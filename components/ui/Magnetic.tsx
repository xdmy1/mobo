"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { SPRING } from "@/lib/motion";

/**
 * Magnetic hover — the element leans toward the cursor as it approaches.
 *
 * Tying transform straight to pointer position feels synthetic because it has
 * no momentum. Running it through a spring gives the movement mass, so the
 * element trails the cursor slightly and settles instead of snapping.
 *
 * This is purely decorative, which is exactly why it's gated: disabled under
 * reduced motion, and disabled on coarse pointers where there is no cursor to
 * be magnetic toward.
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  /** Fraction of cursor offset the element travels. Above ~0.5 reads as broken. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  /* Independent X and Y springs — a single 2D spring desyncs when the axes
     carry different velocities. */
  const sx = useSpring(x, SPRING.pointer);
  const sy = useSpring(y, SPRING.pointer);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        /* Coarse pointers get no magnetism — there's no hover to track. */
        if (e.pointerType !== "mouse") return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
