"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { useI18n } from "@/components/ui/LangProvider";
import { HERO_SLIDES, SITE } from "@/lib/data";
import { EASE_OUT } from "@/lib/motion";

/**
 * OutroG — "The folding screen". Variant 3 of 3 (2026-09-21).
 *
 * Same brief as OutroE (see its header): timed, over in about a second, the
 * photograph — never a dark plate — is what you meet, and the lockup carries
 * the full name. OutroF (a graded title card) was turned down flat; what the
 * client liked in OutroE was the physical move and the scale of the letters.
 * So this one keeps both and adds the two things OutroE does not have: depth,
 * and the rest of the house.
 *
 * Four rooms — kitchen, living, dressing, bedroom: "Kitchens & Home", shown
 * rather than said — stand as the four leaves of a folding screen, hinged to
 * one another and folded into a zig-zag in real perspective. As the band
 * enters, the screen opens flat against the wall on the soft-close curve while
 * the camera eases back, and one giant letter rises out of the foot of each
 * leaf: M · O · B · O, a letter to a room.
 *
 * The rig is an honest one: each leaf is a child of the leaf before it,
 * rotating about their shared edge, so the hinges cannot drift apart at any
 * angle and ONE motion value (`fold`, 1 → 0) drives the whole screen — the
 * four rotations, the shading in the valleys, the recentring, the dolly.
 * Perspective is set in vw, so the geometry is identical on a phone and on a
 * 4K monitor.
 *
 * At rest it is not 3D at all. Once the screen has landed the perspective,
 * preserve-3d and will-change come off, and the four leaves are ordinary
 * abutting boxes — no composited edges left to strand a hairline.
 *
 * Cost: transforms and opacity only. The four frames are the hero rotation's,
 * requested with the hero's exact props, so they come out of the HTTP cache.
 */

/* Kitchen first — it is the first word of the name. */
const ROOMS = [HERO_SLIDES[1], HERO_SLIDES[0], HERO_SLIDES[2], HERO_SLIDES[3]] as const;

/* Where each 3:2 frame is cropped to a tall leaf: the lit cabinet and the
   table; the sofa against the glass; the two wardrobes. */
const ROOM_FOCUS = ["62% 50%", "70% 50%", "74% 50%", "74% 50%"] as const;

const LEAVES = ROOMS.length;

/* How far each leaf is turned out of the wall when folded. */
const FOLD_DEG = 46;
const FOLD_RAD = (FOLD_DEG * Math.PI) / 180;

/* How much closer the camera stands while the screen is folded. */
const DOLLY = 0.06;

/* The rig is taller than the band by this much, top and bottom: the far
   hinges shrink in perspective, and must never uncover the band's edge. */
const OVERSCAN = 8;
const OVERSCAN_FOOT = `${(OVERSCAN / (100 + OVERSCAN * 2)) * 100}%`;

/* Timeline (s):   0 ───── .2 ─────── .6 ── .8 ── 1.05 ── 1.3
 *   screen        unfold, camera eases back ──────┘
 *   letters             M  O  B  O  (70ms apart) ────┘
 *   KITCHENS & HOME                  rise ────┘
 *   tagline                                rise ─────────┘               */
const UNFOLD_DUR = 1.05;
const LETTER_AT = 0.2;
const LETTER_STEP = 0.07;
const LETTER_DUR = 0.8;
const NAME_AT = 0.6;
const TAGLINE_AT = 0.8;

/* Soft-close: off the mark at once, then a long settle against the wall. */
const EASE_UNFOLD = [0.2, 0.9, 0.25, 1] as const;

const NAME_LINE = SITE.name.replace(`${SITE.shortName} `, "");

/* One letter to a leaf. "M" is the widest at ≈0.87em, so 23vw of type sits
   inside a 25vw leaf with air either side; the svh cap bounds it on short,
   ultrawide windows. */
const LETTER_SIZE = "min(23vw, 44svh)";

const letterVariants: Variants = {
  /* No opacity: the mask alone reveals the letter, so its edge stays crisp. */
  hidden: { y: "108%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: LETTER_DUR, ease: EASE_OUT, delay: LETTER_AT + i * LETTER_STEP },
  }),
};

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (at: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT, delay: at },
  }),
};

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** What is printed on a leaf: its room, the grade at its foot, its letter. */
function LeafFace({
  index,
  reduce,
  onLoad,
  children,
}: {
  index: number;
  reduce: boolean;
  onLoad: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* alt="": all four frames are described in the hero rotation. Same
          props as the hero on purpose — same URL, so a cache hit. */}
      <Image
        src={ROOMS[index].src}
        alt=""
        fill
        quality={100}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: ROOM_FOCUS[index] }}
        onLoad={onLoad}
        onError={onLoad}
      />

      {/* Only the foot is graded down — to hold the bone letter, and to cut
          into the ink-950 footer without a border. Same gradient on every
          leaf, so it runs unbroken across the flat screen. */}
      <div className="absolute inset-x-0 bottom-0 h-[66%] bg-gradient-to-t from-ink-950 via-ink-950/55 to-transparent" />

      {children}

      <div
        className="absolute inset-x-0 flex justify-center overflow-hidden font-semibold leading-none text-bone-50"
        style={{ fontSize: LETTER_SIZE, bottom: `calc(${OVERSCAN_FOOT} + 4.75rem)` }}
      >
        <motion.span
          className="block will-change-transform"
          variants={reduce ? fadeVariants : letterVariants}
          custom={index}
        >
          {SITE.shortName[index]}
        </motion.span>
      </div>
    </div>
  );
}

/**
 * One leaf and, hinged to its far edge, the rest of the screen. The first leaf
 * turns out of the wall by θ; every leaf after it turns back 2θ against its
 * parent, which is what makes a zig-zag.
 */
function Leaf({
  index,
  fold,
  landed,
  onLoad,
}: {
  index: number;
  fold: MotionValue<number>;
  landed: boolean;
  onLoad: () => void;
}) {
  const turn = index === 0 ? 1 : index % 2 === 1 ? -2 : 2;
  const rotateY = useTransform(fold, (f) => turn * f * FOLD_DEG);

  /* Even leaves turn their face to the light, odd ones away from it; and the
     valley — the hinge pushed back into the wall — is where it gathers dark. */
  const away = index % 2 === 1;
  const tone = useTransform(fold, (f) => f * (away ? 0.14 : 0.06));
  const valley = useTransform(fold, (f) => f * 0.24);

  /* A lacquered front catches the light as it turns. The glint crosses the
     leaf with the turn itself — tied to `fold`, not to the clock — toward the
     hinge the leaf is swinging on, and it is gone at both ends of the move. */
  const sheenX = useTransform(fold, (f) => `${(away ? 1 : -1) * (2 * f - 1) * 100}%`);
  const sheen = useTransform(fold, (f) => Math.sin(Math.PI * f) * 0.85);

  return (
    <motion.div
      className={
        landed
          ? "absolute top-0 h-full"
          : "absolute top-0 h-full will-change-transform [transform-style:preserve-3d]"
      }
      style={{
        left: index === 0 ? 0 : "100%",
        width: index === 0 ? `${100 / LEAVES}%` : "100%",
        transformOrigin: "0% 50%",
        rotateY,
      }}
    >
      <LeafFace index={index} reduce={false} onLoad={onLoad}>
        {!landed && (
          <>
            <motion.div
              className={away ? "absolute inset-0 bg-ink-950" : "absolute inset-0 bg-bone-50"}
              style={{ opacity: tone }}
            />
            <motion.div
              className={
                away
                  ? "absolute inset-0 bg-gradient-to-l from-transparent to-ink-950"
                  : "absolute inset-0 bg-gradient-to-r from-transparent to-ink-950"
              }
              style={{ opacity: valley }}
            />
            <motion.div
              className="absolute inset-0 bg-[linear-gradient(100deg,transparent_28%,rgb(255_250_235/0.26)_50%,transparent_72%)]"
              style={{ x: sheenX, opacity: sheen }}
            />
          </>
        )}
      </LeafFace>

      {index < LEAVES - 1 && (
        <Leaf index={index + 1} fold={fold} landed={landed} onLoad={onLoad} />
      )}
    </motion.div>
  );
}

export default function OutroG() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { t } = useI18n();

  /* The screen waits for its four frames — they are the hero's, so normally
     already cached — but never longer than 2.5s. */
  const loadedLeaves = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [landed, setLanded] = useState(false);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });

  const onLeafLoad = () => {
    loadedLeaves.current += 1;
    if (loadedLeaves.current >= LEAVES) setLoaded(true);
  };

  useEffect(() => {
    if (!inView || loaded) return;
    const id = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(id);
  }, [inView, loaded]);

  const play = reduce ? inView : inView && loaded;

  /* 1 = folded, 0 = flat against the wall. */
  const fold = useMotionValue(1);

  /* A folded screen is narrower than an open one by cos θ. Both of its ends
     stay in the wall's plane, so scaling it by 1/cos θ from its first hinge
     puts them back on the band's edges at every angle. DOLLY is the camera
     easing back as the screen opens: that much extra scale when folded, and
     half of it taken off the left so the overshoot is shared by both edges. */
  const rigScale = useTransform(fold, (f) => (1 + DOLLY * f) / Math.cos(f * FOLD_RAD));
  const rigX = useTransform(fold, (f) => `${-50 * DOLLY * f}%`);

  useEffect(() => {
    if (!play || reduce) return;
    const controls = animate(fold, 0, {
      duration: UNFOLD_DUR,
      ease: EASE_UNFOLD,
      onComplete: () => setLanded(true),
    });
    return () => controls.stop();
  }, [play, reduce, fold]);

  return (
    <motion.section
      ref={sectionRef}
      aria-label={`${SITE.name} — ${t("site.tagline")}`}
      className="grain relative isolate h-[clamp(24rem,64svh,34rem)] w-full overflow-hidden bg-bone-100 sm:h-[clamp(30rem,82svh,56rem)]"
      initial="hidden"
      animate={play ? "visible" : "hidden"}
    >
      {/* --- the screen ------------------------------------------------------ */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0"
        style={{
          top: `-${OVERSCAN}%`,
          bottom: `-${OVERSCAN}%`,
          perspective: reduce || landed ? undefined : "90vw",
        }}
      >
        {reduce ? (
          <div className="absolute inset-0 grid grid-cols-4">
            {ROOMS.map((_, i) => (
              <div key={i} className="relative">
                <LeafFace index={i} reduce onLoad={onLeafLoad} />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className={
              landed
                ? "absolute inset-0"
                : "absolute inset-0 will-change-transform [transform-style:preserve-3d]"
            }
            style={{ x: rigX, scale: rigScale, transformOrigin: "0% 50%" }}
          >
            <Leaf index={0} fold={fold} landed={landed} onLoad={onLeafLoad} />
          </motion.div>
        )}
      </div>

      {/* --- the rest of the name --------------------------------------------
          Flat, over the screen: it belongs to the whole wall, not to a leaf. */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-5 pb-7 sm:pb-9">
        <motion.p
          aria-hidden="true"
          /* The indent balances the trailing tracking of the last glyph. */
          className="pl-[0.42em] text-[length:clamp(0.8125rem,1.5vw,1.625rem)] font-medium uppercase leading-none tracking-[0.42em] text-bone-50/90"
          variants={reduce ? fadeVariants : riseVariants}
          custom={NAME_AT}
        >
          {NAME_LINE}
        </motion.p>
        <motion.p
          className="text-eyebrow mt-4 text-center text-bone-50/80 sm:mt-5"
          variants={reduce ? fadeVariants : riseVariants}
          custom={TAGLINE_AT}
        >
          {t("site.tagline")} · {t("hero.location")}
        </motion.p>
      </div>
    </motion.section>
  );
}
