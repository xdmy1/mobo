"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import {
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CATEGORIES, type Category } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";
import { DUR, EASE_OUT, SPRING, STAGGER, VIEWPORT } from "@/lib/motion";

/**
 * Recoloring the category icons.
 *
 * The PNGs from mobo.md are near-black line art on transparency, which is
 * invisible on a dark card. They have to be driven to the brand lime.
 *
 * This cannot be expressed with Tailwind's filter utilities: v4 composes them
 * in a fixed order (blur → brightness → contrast → grayscale → hue-rotate →
 * invert → saturate → sepia), and this chain needs `brightness` twice, at both
 * ends. So the chain is written out as one declaration.
 *
 * How it lands on #CCDF10:
 *   brightness(0)    → flatten every pixel to black, alpha preserved
 *   invert(1)        → pure white artwork
 *   sepia(1)         → white picks up a faint warm cast, rgb(255,255,239)
 *   saturate(16)     → amplifies that 6% cast into saturated yellow (255,255,15)
 *   hue-rotate(8deg) → yellow (60°) → the brand's yellow-green (65.5°)
 *   brightness(0.9)  → settles at ≈#CBE60D, a hair off --color-lime-brand
 */
const ICON_TO_LIME =
  "brightness(0) invert(1) sepia(1) saturate(16) hue-rotate(8deg) brightness(0.9)";

/**
 * Maximum pointer tilt, in degrees. Deliberately tiny: the card should feel
 * like a heavy slab that acknowledges the hand, not a playing card stuck to
 * the cursor. Past ~3° the photo crop visibly shears and the glass edges
 * catch light they shouldn't.
 */
const TILT_MAX = 2.5;

/**
 * True only on devices with a real cursor. The tilt must never run on touch:
 * a finger drag would smear the card around mid-scroll, and there is no
 * "pointer leaves" moment to settle it back. Mirrors the CSS `hover-fine`
 * variant so JS-driven and CSS-driven hover agree on when they exist.
 * SSR-safe — starts false, upgrades after mount.
 */
function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * Current column count of the category grid. The breakpoints here MUST stay
 * in sync with the <ul>'s `sm:grid-cols-2 lg:grid-cols-3` below — this is the
 * JS half of that CSS. SSR-safe: assumes one column (mobile-first) and
 * corrects itself on mount, long before the section scrolls into view.
 */
function useGridColumns(): number {
  const [cols, setCols] = useState(1);
  useEffect(() => {
    const two = window.matchMedia("(min-width: 640px)"); /* sm */
    const three = window.matchMedia("(min-width: 1024px)"); /* lg */
    const update = () => setCols(three.matches ? 3 : two.matches ? 2 : 1);
    update();
    two.addEventListener("change", update);
    three.addEventListener("change", update);
    return () => {
      two.removeEventListener("change", update);
      three.removeEventListener("change", update);
    };
  }, []);
  return cols;
}

/**
 * Cascade timing that reads as ONE event instead of a queue.
 *
 * A flat `index * STAGGER` breaks in one column: each card enters the
 * viewport alone, yet card six would sit invisible for 300ms before rising.
 * So the delay is grid-aware:
 *
 *   - 1 column  → no delay; every card rises the moment it appears.
 *   - 2/3 cols  → (column + row) * STAGGER: a diagonal sweep from the top-left
 *     when the grid arrives together, and rows that enter later simply join
 *     the same diagonal one step down. 60ms steps, 180ms worst case.
 */
function cascadeDelay(index: number, cols: number): number {
  if (cols === 1) return 0;
  return ((index % cols) + Math.floor(index / cols)) * STAGGER;
}

/** The arrow glyph, extracted so the chip can hold two of them (see below). */
function ArrowGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * One category card.
 *
 * The reveal is deliberately split across leaf layers instead of one wrapper.
 * The card contains three `.glass` surfaces, and a `backdrop-filter` element
 * must never sit inside a parent that animates opacity: the animating parent
 * becomes a backdrop root, the blur samples an empty group, and the glass
 * renders as a flat rectangle for the entire animation. So:
 *
 *   - the <li> wrapper animates TRANSFORM ONLY (the y-rise) — safe, because
 *     the glass and its backdrop (the photo) travel together;
 *   - the photo layer, the arrow chip and the caption panel each fade their
 *     OWN opacity, in lockstep, so no glass ever sits under an animated-
 *     opacity ancestor.
 *
 * Hover is one physical story told across three layers: the slab lifts and
 * tips toward the hand, the caption panel rises a step further off the photo
 * and light drifts across its glass, and the arrow leaves along its own
 * diagonal. Transform ownership is split so nothing fights:
 *
 *   - motion owns `transform` on the <a> — the spring tilt;
 *   - CSS owns `translate` (hover lift) and `scale` (press), which are
 *     separate properties in v4 and compose with the tilt instead of
 *     overwriting it. The <a>'s transition list therefore names
 *     `translate,scale` — never `transform`, or the 250ms curve would be
 *     applied on top of every spring frame and turn the tilt to mush.
 */
function CategoryCard({ cat, delay }: { cat: Category; delay: number }) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  /* Coarse pointer or reduced motion → the tilt simply does not exist. */
  const tiltEnabled = fine && !reduce;

  /* Pointer tilt. Raw values track the cursor; the render reads them through
     springs (SPRING.pointer ≈ critically damped, a whisper of momentum), so
     the card settles after the hand rather than tracking it rigidly. */
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, SPRING.pointer);
  const rotateY = useSpring(tiltY, SPRING.pointer);

  /* If the preference flips mid-session (OS toggle, mouse unplugged),
     park the card flat instead of freezing it mid-tilt. */
  useEffect(() => {
    if (!tiltEnabled) {
      tiltX.set(0);
      tiltY.set(0);
    }
  }, [tiltEnabled, tiltX, tiltY]);

  function handleTiltMove(e: ReactPointerEvent<HTMLAnchorElement>) {
    /* Hybrid laptops: a touch on a hover-capable screen still fires pointer
       events — only the mouse may steer the tilt. */
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; /* -0.5 … 0.5 */
    const py = (e.clientY - r.top) / r.height - 0.5;
    /* Cursor high → top edge dips toward it (negative rotateX), and so on:
       the card leans to meet the hand, like pressing a floating tile. */
    tiltY.set(px * 2 * TILT_MAX);
    tiltX.set(py * -2 * TILT_MAX);
  }

  function handleTiltEnd() {
    tiltX.set(0);
    tiltY.set(0);
  }

  /* Travel lives on the wrapper — never opacity (see the note above). */
  const rise: Variants = {
    hidden: reduce ? {} : { y: 24 },
    visible: {
      y: 0,
      transition: { duration: DUR.reveal, ease: EASE_OUT, delay },
    },
  };

  /* Fades run on the leaves themselves. Reduced motion keeps the cross-fade
     (gentler feedback, not the absence of it) — only the travel goes. */
  const fade: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reduce ? DUR.micro : DUR.reveal,
        ease: EASE_OUT,
        delay,
      },
    },
  };

  return (
    <motion.li
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={rise}
    >
      <motion.a
        href="#contact"
        onPointerMove={tiltEnabled ? handleTiltMove : undefined}
        onPointerLeave={tiltEnabled ? handleTiltEnd : undefined}
        /* motion composes this as perspective() rotateX() rotateY() on the
           `transform` property. When the tilt is disabled the springs hold 0
           and the transform is identity. Rotating the whole <a> is safe for
           the glass: photo and panels rotate as one, so the backdrop each
           blur samples stays correct. */
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        className={[
          /* aspect-4/5 on every card: equal column widths → identical card
             heights across the row at every breakpoint. */
          "group relative flex aspect-4/5 flex-col justify-end overflow-hidden",
          "rounded-card-lg bg-ink-800",
          /* translate + scale are separate CSS properties in v4, so the
             hover lift and the press compose instead of overwriting — and
             `transform` is deliberately NOT in this list; motion owns it
             (see the component note). */
          "transition-[translate,scale] duration-[250ms] ease-out-strong active:scale-[0.97]",
          "hover-fine-motion:hover:-translate-y-1",
        ].join(" ")}
      >
        {/* Photo + scrim share one fading layer; no glass lives inside it,
            so this layer is allowed to animate opacity. */}
        <motion.div variants={fade} className="absolute inset-0">
          <Image
            src={cat.image}
            /* Four categories borrow a photo of another room until MOBO
               shoots them (`needsPhoto`). Their alt must not claim the room
               it is not — it stays generic but truthful. */
            alt={
              cat.needsPhoto
                ? "Mobilier la comandă realizat de MOBO Kitchens & Home"
                : `${cat.label} — mobilier la comandă realizat de MOBO Kitchens & Home`
            }
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={[
              "object-cover",
              /* 500ms sits past the 300ms interactive cap on purpose: this
                 drift is ambience — the room breathing behind the glass —
                 not feedback. Feedback lives on the panel, chip and tilt. */
              "transition-transform duration-500 ease-out-strong",
              "hover-fine-motion:group-hover:scale-105",
            ].join(" ")}
          />

          {/* Scrim, not a flat overlay: the photo stays readable up top and
              only darkens where the glass panel has to sit. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-ink-950/95 from-5% via-ink-950/45 via-40% to-transparent to-75%"
          />
        </motion.div>

        {/* Arrow affordance. Same glass material as the icon chip, and inset
            on the same 3/4 spacing step as the caption panel's margin, so it
            reads as part of the card system rather than a stray circle.

            On hover the arrow TRAVELS: the resting glyph exits along its own
            up-right diagonal and a twin arrives from down-left — departure
            and arrival of the same arrow, clipped by the pill. Reduced
            motion keeps only the color swap. */}
        <motion.span
          variants={fade}
          aria-hidden="true"
          className={[
            "glass glass-thin absolute top-3 right-3 grid size-9 place-items-center overflow-hidden rounded-pill text-fg",
            "sm:top-4 sm:right-4",
            "transition-[background-color,color] duration-200 ease-out-strong",
            "hover-fine:group-hover:bg-lime-brand",
            "hover-fine:group-hover:text-lime-ink",
          ].join(" ")}
        >
          <ArrowGlyph
            className={[
              "size-4 transition-[translate,opacity] duration-200 ease-out-strong",
              "hover-fine-motion:group-hover:translate-x-5",
              "hover-fine-motion:group-hover:-translate-y-5",
              "hover-fine-motion:group-hover:opacity-0",
            ].join(" ")}
          />
          <ArrowGlyph
            className={[
              /* inset-0 + m-auto centers the twin over the first glyph
                 regardless of how the grid places absolute children. */
              "absolute inset-0 m-auto size-4",
              "-translate-x-5 translate-y-5 opacity-0",
              "transition-[translate,opacity] duration-200 ease-out-strong",
              "hover-fine-motion:group-hover:translate-x-0",
              "hover-fine-motion:group-hover:translate-y-0",
              "hover-fine-motion:group-hover:opacity-100",
            ].join(" ")}
          />
        </motion.span>

        {/* Caption panel. Bottom-anchored, so any height difference shows up
            as a ragged TOP edge across the row — every element inside is
            therefore height-fixed: 44px icon chip, one-line label, and a
            reserved two-line blurb box. Identical structure → identical
            panel height → top edges, label baselines and blurb baselines
            all sit on the same line in 1-, 2- and 3-column layouts.

            On hover the panel rises 4px on top of the card's own 4px lift —
            the glass floats a step further off the photo, answering the
            photo's push back. */}
        <motion.div
          variants={fade}
          className={[
            "glass relative m-2.5 rounded-card p-3 sm:m-3.5 sm:p-3.5",
            "transition-[translate] duration-200 ease-out-strong",
            "hover-fine-motion:group-hover:-translate-y-1",
          ].join(" ")}
        >
          {/* Directional light: as the panel lifts, a soft diagonal highlight
              drifts from the left edge toward the center of the glass — the
              slab turning slightly under a fixed light, not a sweep effect.
              Clipped to the panel's radius; opacity + translate only. Under
              reduced motion the light still appears (opacity via hover-fine)
              but does not travel. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          >
            <span
              className={[
                "absolute inset-y-0 -left-1/4 w-3/4",
                "bg-linear-105 from-white/0 via-white/10 to-white/0",
                "opacity-0 transition-[translate,opacity] duration-[250ms] ease-out-strong",
                "hover-fine:group-hover:opacity-100",
                "hover-fine-motion:group-hover:translate-x-1/2",
              ].join(" ")}
            />
          </span>

          {/* `relative` so the content paints above the light layer. */}
          <div className="relative flex items-start gap-2.5 sm:gap-3.5">
            <span className="glass glass-thin grid size-8 shrink-0 place-items-center rounded-xl sm:size-11 sm:rounded-2xl">
              <Image
                src={cat.icon}
                /* Decorative: the icon restates the label sitting beside
                   it, so naming it again only adds noise for screen
                   readers. */
                alt=""
                aria-hidden="true"
                width={22}
                height={22}
                className="size-4 sm:size-[22px]"
                style={{ filter: ICON_TO_LIME }}
              />
            </span>

            <div className="min-w-0">
              {/* line-clamp-1 guards the one-line label: at extreme user
                  font sizes a wrapped label would re-break the row; an
                  ellipsis keeps alignment and the full text stays in the
                  accessibility tree. No label wraps at normal sizes. */}
              <h3 className="line-clamp-1 text-[0.9375rem] font-medium tracking-[-0.012em] text-fg sm:text-h3">
                {cat.label}
                <span className="sr-only"> — solicită o ofertă</span>
              </h3>
              {/* One line, ellipsised — which also solves the ragged panel
                  tops that the previous two-line reserve was there to fix, and
                  solves it better. A reserved 3.25em box kept every panel two
                  lines tall even when the blurb was one, so "Bucătării" sat
                  above a block of empty glass. Clamping to a single line makes
                  every blurb exactly one line high, so the panels match by
                  construction instead of by reservation, and the card gets its
                  height back. `truncate` rather than line-clamp-1: it is a
                  single line by definition and gets the ellipsis for free. */}
              <p className="mt-1 truncate text-[0.75rem] leading-relaxed text-fg-dim sm:mt-1.5 sm:text-[0.8125rem]">
                {cat.blurb}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.a>
    </motion.li>
  );
}

export default function Categories() {
  const cols = useGridColumns();

  return (
    <section
      id="categorii"
      aria-labelledby="categorii-title"
      className="grain relative bg-ink-850 py-24 sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12">
        <header className="max-w-3xl">
          <Reveal>
            <p className="text-eyebrow text-fg-faint">Ce producem</p>
          </Reveal>
          <Reveal index={1}>
            <h2 id="categorii-title" className="text-h2 text-balance mt-5 text-fg">
              Mobilier la comandă pentru{" "}
              fiecare încăpere a casei.
            </h2>
          </Reveal>
        </header>

        {/* Column classes must stay in sync with useGridColumns above. */}
        <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.slug} cat={cat} delay={cascadeDelay(i, cols)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
