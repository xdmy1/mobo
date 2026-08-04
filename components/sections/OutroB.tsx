"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { HERO, SITE } from "@/lib/data";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";

/**
 * OutroB — "studio ident" brand outro.
 *
 * A film-studio title card: the kitchen photograph starts soft and dim, and
 * pulls into focus while the four letters M-O-B-O tip up out of their own
 * masks like physical panels and lock into one wordmark. One unifying beat —
 * a lime hairline drawing out beneath the word — closes the sequence.
 *
 * Timeline (s):        0 ─── .12 ────────────── ~1.3 ──── 1.75
 *   photograph         focus pull (blur → sharp, dim → lit) ┘ at 1.5
 *   letters                  M  O  B  O  (90ms stagger, land ~1.3)
 *   hairline + byline                            draw ──────┘
 */

const LETTERS = ["M", "O", "B", "O"] as const;

const LETTER_AT = 0.12;
const LETTER_STEP = 0.09; // tight enough that four arrivals read as ONE event
const LETTER_DUR = 0.9;
const RULE_AT = 1.05; // starts as the last letter settles, not after a gap

/* Wordmark sizing — the previous version (text-[36vw]) clipped the final O.
 * "MOBO" in Geist Bold advances ≈3.25em; no sans fallback exceeds ~3.4em for
 * these four caps. Budgeting 3.6em of horizontal space per 1em of font-size
 * therefore guarantees the word fits inside (100vw − px-6 padding) at every
 * width from 320 to 2560px, with ~10% slack absorbing scrollbars, fallback
 * fonts and the mid-animation perspective magnification. The 40svh cap bounds
 * it vertically on short, wide windows. M/O/B/O carry no descenders, so
 * leading-none plus a 0.02em mask inset covers the O's round overshoot.
 */
const WORDMARK_SIZE = "text-[min(calc((100vw-3rem)/3.6),40svh)]";

export default function OutroB() {
  const reduce = useReducedMotion();

  const photoVariants: Variants = {
    /* blur() is animated here and ONLY here: the photograph resolving from
       soft to sharp is the cinematic focus-pull itself, not decoration. */
    hidden: reduce ? { opacity: 0 } : { opacity: 0.3, scale: 1.07, filter: "blur(16px)" },
    visible: reduce
      ? { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } }
      : {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 1.5, ease: EASE_OUT },
        },
  };

  /* The shared 3D space: the whole wordmark plane settles from a slight tilt
     under the stage's perspective while each letter tips up inside it. */
  const rowVariants: Variants = {
    hidden: reduce ? {} : { rotateX: 10 },
    visible: reduce ? {} : { rotateX: 0, transition: { duration: 1.3, ease: EASE_OUT } },
  };

  const letterVariants: Variants = {
    /* No opacity in the full-motion path: the mask alone reveals the letter,
       which keeps the emerging edge crisp — the studio-ident look. */
    hidden: reduce ? { opacity: 0 } : { y: "112%", rotateX: 55 },
    visible: reduce
      ? { opacity: 1, transition: { duration: 0.35, ease: EASE_OUT } }
      : (i: number) => ({
          y: "0%",
          rotateX: 0,
          transition: {
            duration: LETTER_DUR,
            ease: EASE_OUT,
            delay: LETTER_AT + i * LETTER_STEP,
          },
        }),
  };

  const ruleVariants: Variants = {
    hidden: reduce ? { opacity: 0 } : { scaleX: 0 },
    visible: reduce
      ? { opacity: 1, transition: { duration: 0.35, ease: EASE_OUT, delay: 0.15 } }
      : { scaleX: 1, transition: { duration: 0.7, ease: EASE_IN_OUT, delay: RULE_AT } },
  };

  const captionVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, ease: EASE_OUT, delay: reduce ? 0.2 : RULE_AT + 0.1 },
    },
  };

  return (
    <motion.section
      className="grain relative flex min-h-[78svh] items-center justify-center overflow-hidden bg-ink-950 py-20"
      initial="hidden"
      whileInView="visible"
      /* amount, not a margin offset: on a section this tall the ident should
         play once it substantially occupies the viewport, not on first peek. */
      viewport={{ once: true, amount: 0.4 }}
    >
      {/* Photograph — HERO.image is PHOTO.kitchenWide (MOBO31, wood + graphite).
          alt="" because the same frame is already described in the Hero; here
          it is scenery behind the wordmark. */}
      <motion.div className="absolute inset-0 will-move" variants={photoVariants}>
        <Image src={HERO.image} alt="" fill sizes="100vw" className="object-cover" />
      </motion.div>

      {/* Constant veil + grounding gradients keep the bone letters legible at
          full photo brightness; the "resolve" happens under them. */}
      <div aria-hidden="true" className="absolute inset-0 bg-ink-950/50" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950/70 to-transparent"
      />

      <div className="relative z-10 flex w-full flex-col items-center px-6">
        {/* Announced once as the brand name — never as four letters. */}
        <h2 className="sr-only">{SITE.name}</h2>

        <div
          aria-hidden="true"
          className={`leading-none font-bold text-bone-50 [perspective:8em] ${WORDMARK_SIZE}`}
        >
          {/* w-fit column: the hairline below inherits exactly the row's width,
              so rule and wordmark stay flush at every viewport size. */}
          <motion.div
            className="flex w-fit flex-col [transform-style:preserve-3d] will-move"
            variants={rowVariants}
          >
            <div className="flex">
              {LETTERS.map((letter, i) => (
                <div
                  /* "O" repeats — index is the only stable key. */
                  key={i}
                  /* overflow-hidden flattens 3D, so the shared stage
                     perspective cannot reach inside the mask — each cell
                     carries its own em-scaled perspective instead, keeping
                     the foreshortening identical at every viewport width. */
                  className="overflow-hidden py-[0.02em] [perspective:3em]"
                >
                  <motion.span
                    className="block will-move"
                    /* Bottom-edge hinge: the panel tips up into place. */
                    style={{ transformOrigin: "50% 100%" }}
                    variants={letterVariants}
                    custom={i}
                  >
                    {letter}
                  </motion.span>
                </div>
              ))}
            </div>

            {/* The one unifying beat: brand-lime hairline drawing out. */}
            <motion.div
              className="mt-[0.1em] h-[2px] origin-center bg-lime-brand will-move"
              variants={ruleVariants}
            />
          </motion.div>
        </div>

        <motion.p
          aria-hidden="true"
          className="text-eyebrow mt-7 font-mono text-fg-dim"
          variants={captionVariants}
        >
          Kitchens &amp; Home · {HERO.location}
        </motion.p>
      </div>
    </motion.section>
  );
}
