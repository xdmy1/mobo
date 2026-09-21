"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { useI18n } from "@/components/ui/LangProvider";
import { OUTRO, SITE } from "@/lib/data";
import { EASE_OUT } from "@/lib/motion";

/**
 * OutroE — "Fronts fall into line". Variant 1 of 3 (2026-09-21).
 *
 * Client feedback on OutroD, 2026-09-21: "prea mult timp ia și direct e ceva
 * negru, deci cu asta te vezi prima dată". Two faults, both structural:
 *   - a 200svh sticky track is a toll booth: the reader has to scroll two
 *     screens to get to the footer, however the wall is eased;
 *   - the wall was ink, and it covered the whole viewport, so the brand
 *     moment opened on a black screen.
 *
 * What changed, in the same order:
 *   - No sticky stage, no scrubbing. The band is an ordinary section; the
 *     animation is timed, fires once as the band enters, and is over in ~1.1s.
 *   - The first thing on screen is the photograph. The cabinet wall is still
 *     the idea, but the fronts ARE the kitchen now: the frame is cut into six
 *     vertical fronts hanging slightly out of line, with a sliver of light
 *     between them, and they settle into one seamless photograph on the
 *     soft-close curve. Nothing covers anything; there is no dark plate.
 *   - The wordmark rises out of its baseline, letter by letter, while the
 *     fronts are still landing, so the two read as one event.
 *
 * Seams: six slices of one image can never be trusted to meet to the subpixel
 * at every viewport width (the "linie urâtă" class of bug from OutroD). So the
 * slices only exist while they move. Each overlaps its neighbour by 1px, and
 * the moment they land an unsliced copy of the same frame fades in over them
 * and the slices unmount — at rest this is literally one <img>.
 *
 * Everything that moves is transform/opacity on its own layer.
 */

const FRONTS = 6;

/* Alternating, uneven: a wall of doors left ajar by hand, not a sine wave.
   Percent of the front's own height (the stage is 120% of the band). */
const FRONT_OFFSET = ["-5%", "4%", "-3%", "5%", "-4%", "3%"] as const;

/* Timeline (s):     0 ───── .15 ───────── .6 ────── 1.05 ── 1.25
 *   fronts          land, left to right (50ms apart) ┘
 *   letters               M  O  B  O  (70ms apart) ───┘
 *   caption                               fade ───────┘
 *   unsliced frame                                   fade ─┘                */
const FRONT_DUR = 0.8;
const FRONT_STEP = 0.05;
const FRONTS_LANDED = FRONT_DUR + (FRONTS - 1) * FRONT_STEP;
const LETTER_AT = 0.15;
const LETTER_STEP = 0.07;
const LETTER_DUR = 0.75;
const CAPTION_AT = 0.6;

/* "MOBO" in Geist Semibold at this tracking advances ≈3.0em (measured) and
   no sans fallback exceeds ~3.3em, so budgeting 3.5em per 1em of font-size
   keeps the word inside the gutters at every width, webfont or not. The svh
   cap bounds it on short, ultrawide windows. */
const WORDMARK_SIZE = "min(calc((100vw - 2.5rem) / 3.5), 44svh)";

const frontVariants: Variants = {
  hidden: (i: number) => ({ y: FRONT_OFFSET[i], scaleX: 0.98 }),
  visible: (i: number) => ({
    y: "0%",
    scaleX: 1,
    transition: { duration: FRONT_DUR, ease: EASE_OUT, delay: i * FRONT_STEP },
  }),
};

/* The camera settling as the wall closes. */
const stageVariants: Variants = {
  hidden: { scale: 1.05 },
  visible: { scale: 1, transition: { duration: FRONTS_LANDED, ease: EASE_OUT } },
};

const coverVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "linear", delay: FRONTS_LANDED } },
};

const scrimVariants: Variants = {
  hidden: { opacity: 0.4 },
  visible: { opacity: 1, transition: { duration: FRONTS_LANDED, ease: EASE_OUT } },
};

const letterVariants: Variants = {
  /* No opacity: the baseline mask alone reveals the letter, so the emerging
     edge stays crisp. */
  hidden: { y: "108%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: LETTER_DUR, ease: EASE_OUT, delay: LETTER_AT + i * LETTER_STEP },
  }),
};

const captionVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT, delay: CAPTION_AT },
  },
};

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/* alt="" throughout: the same frame is already described in the hero
   rotation; here it is scenery behind the wordmark. Phones crop the 3:2 frame
   by height, so they are asked for more than their own width. */
function Frame({ onLoad }: { onLoad?: () => void }) {
  return (
    <Image
      src={OUTRO.image}
      alt=""
      fill
      quality={90}
      sizes="(max-width: 640px) 160vw, 100vw"
      className="object-cover"
      onLoad={onLoad}
      onError={onLoad}
    />
  );
}

export default function OutroE() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { t } = useI18n();

  /* The fronts wait for their pixels: on a slow connection the band can be in
     view before the lazy frame has arrived, and a wall of empty fronts
     settling is worse than a wall that settles a beat late. */
  const loadedFronts = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [settled, setSettled] = useState(false);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });

  const onFrontLoad = () => {
    loadedFronts.current += 1;
    if (loadedFronts.current >= FRONTS) setLoaded(true);
  };

  /* …but not forever. A stalled request must not cost the page its wordmark. */
  useEffect(() => {
    if (!inView || loaded) return;
    const id = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(id);
  }, [inView, loaded]);

  /* After the wall has landed the band is not a still: the frame drifts a few
     percent against the scroll, inside the stage's overscan. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  const play = reduce ? inView : inView && loaded;

  return (
    <motion.section
      ref={sectionRef}
      aria-label={`${SITE.shortName} — ${t("site.tagline")}`}
      className="grain relative isolate h-[clamp(24rem,64svh,34rem)] w-full overflow-hidden bg-bone-100 sm:h-[clamp(30rem,82svh,56rem)]"
      initial="hidden"
      animate={play ? "visible" : "hidden"}
    >
      {/* --- the photograph ------------------------------------------------
          The stage overscans the band by 10% top and bottom: room for the
          fronts to hang out of line, and for the drift, without ever showing
          an edge. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 -inset-y-[10%] will-change-transform"
        style={reduce ? undefined : { y: drift }}
      >
        {reduce ? (
          <Frame />
        ) : (
          <motion.div className="absolute inset-0 will-change-transform" variants={stageVariants}>
            {!settled &&
              Array.from({ length: FRONTS }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-y-0 overflow-hidden will-change-transform"
                  style={{
                    left: `calc(100% / ${FRONTS} * ${i})`,
                    width: `calc(100% / ${FRONTS} + 1px)`,
                  }}
                  variants={frontVariants}
                  custom={i}
                >
                  {/* The whole frame, registered to the stage rather than to
                      this front: (100% - 1px) is exactly one front's pitch. */}
                  <div
                    className="absolute inset-y-0"
                    style={{
                      left: `calc((100% - 1px) * -${i})`,
                      width: `calc((100% - 1px) * ${FRONTS})`,
                    }}
                  >
                    <Frame onLoad={onFrontLoad} />
                  </div>
                </motion.div>
              ))}

            <motion.div
              className="absolute inset-0"
              variants={coverVariants}
              onAnimationComplete={(definition) => {
                if (definition === "visible") setSettled(true);
              }}
            >
              <Frame />
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* --- the melt into the credits --------------------------------------
          The top of the band stays clean daylight; only the lower half is
          graded down, so the bone letters hold and the frame cuts into the
          ink-950 footer without a border. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent"
        variants={reduce ? undefined : scrimVariants}
      />

      {/* --- the title ------------------------------------------------------ */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-5 pb-7 sm:pb-9">
        <div
          aria-hidden="true"
          className="flex font-semibold leading-none tracking-[-0.03em] text-bone-50"
          style={{ fontSize: WORDMARK_SIZE }}
        >
          {/* "O" repeats — index is the only stable key. */}
          {Array.from(SITE.shortName, (letter, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                className="block will-change-transform"
                variants={reduce ? fadeVariants : letterVariants}
                custom={i}
              >
                {letter}
              </motion.span>
            </span>
          ))}
        </div>

        <motion.p
          className="text-eyebrow text-center text-bone-50/80"
          variants={reduce ? fadeVariants : captionVariants}
        >
          {t("site.tagline")} · {t("hero.location")}
        </motion.p>
      </div>
    </motion.section>
  );
}
