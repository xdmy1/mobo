/**
 * Shared motion tokens.
 *
 * Sources that shaped these values:
 *  - navarro.ro's compiled CSS (cubic-bezier(.4,0,.2,1), .2s/.3s/.8s duration tiers)
 *  - Apple's "Designing Fluid Interfaces": critically-damped springs by default,
 *    bounce reserved for momentum-carrying gestures.
 *  - Emil Kowalski: custom curves over the weak CSS built-ins; never `ease-in` on UI;
 *    UI transitions stay under 300ms; exits are faster than enters.
 *
 * Anything a user can grab uses a spring. Anything scripted uses a curve.
 */

/** Strong ease-out. Entrances, and anything that should feel instantly responsive. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Strong ease-in-out. On-screen movement and morphs. */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/** iOS drawer curve (via Ionic). Sheets, panels, mobile menu. */
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** navarro.ro's own curve, kept so shared surfaces match the reference feel. */
export const EASE_NAVARRO = [0.4, 0, 0.2, 1] as const;

/** Duration tiers, in seconds. Kept under 300ms for anything interactive. */
export const DUR = {
  press: 0.16,
  micro: 0.2,
  ui: 0.25,
  panel: 0.4,
  reveal: 0.8,
} as const;

/**
 * Springs. `bounce: 0` is critically damped — the default for UI.
 * Bounce is only ever added where a gesture carried momentum into the motion.
 */
export const SPRING = {
  /** Default UI spring — no overshoot. Apple: damping 1.0, response 0.4. */
  ui: { type: "spring", bounce: 0, duration: 0.4 },
  /** Momentum spring — a flick or drag preceded it. Apple: damping ~0.8. */
  momentum: { type: "spring", bounce: 0.2, duration: 0.4 },
  /** Cursor/pointer following. Loose enough to read as physical, not laggy. */
  pointer: { type: "spring", stiffness: 150, damping: 18, mass: 0.6 },
} as const;

/** Stagger between siblings in a cascade. 30–80ms; longer reads as slow. */
export const STAGGER = 0.06;

/**
 * The house reveal: rise + fade, no scale.
 * Scale-on-reveal fights the image crop in a photo-heavy layout.
 */
export const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: EASE_OUT },
  },
} as const;

/** Viewport config for scroll reveals — fires once, slightly before full entry. */
export const VIEWPORT = { once: true, margin: "-80px" } as const;
