"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { ABOUT, SITE } from "@/lib/data";
import { DUR, EASE_OUT, STAGGER, VIEWPORT } from "@/lib/motion";

/**
 * Entrance choreography — one composed event, not two mirrored slides.
 *
 * The image is the anchor and leads at t=0. The copy column answers it a
 * beat later (call-and-response reads as composition; equal-and-opposite
 * reads as a template). The mission quote is the finale: its surface,
 * its lime rule and its text arrive as three distinct beats.
 *
 *   t=0.00  image frame, from left
 *   t=0.10  eyebrow ─┐
 *   t=0.16  title    ├─ from right, house cascade
 *   t=0.22  body    ─┘
 *   t=0.30  quote surface rises
 *   t=0.48  lime rule draws top→down
 *   t=0.56  mission text settles
 */
const HANDOFF = 0.1;
const QUOTE_AT = HANDOFF + STAGGER * 3 + 0.02;

export default function About() {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  /* A slow push-in layered on the parallax. Crop safety: the y percentage is
     measured against the layer's own *untransformed* height, and scale only
     ever grows ≥ 1, so the overhang can only widen — the ±8.4%-inside-20%
     guarantee holds at every scroll position. */
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.055]);
  /* The stamp drifts a few px against the image's direction — a third plane
     (image behind the frame, frame, stamp in front) instead of a flat card. */
  const stampY = useTransform(scrollYProgress, [0, 1], [8, -8]);

  /* The blockquote carries backdrop-filter, so nothing above it may animate
     opacity — it animates itself (the pattern this file has always used) and
     orchestrates its children via variant propagation. */
  const quoteSurface: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? DUR.micro : 0.7,
        ease: EASE_OUT,
        delay: reduce ? 0 : QUOTE_AT,
      },
    },
  };
  /* The lime accent draws in like a rule on a technical drawing, top to
     bottom, only after the surface exists to hold it. */
  const quoteRule: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: DUR.micro } },
      }
    : {
        hidden: { scaleY: 0 },
        visible: {
          scaleY: 1,
          transition: { duration: 0.55, ease: EASE_OUT, delay: QUOTE_AT + 0.18 },
        },
      };
  const quoteText: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? DUR.micro : 0.55,
        ease: EASE_OUT,
        delay: reduce ? 0.05 : QUOTE_AT + 0.26,
      },
    },
  };

  return (
    <section
      id="despre"
      aria-labelledby="despre-title"
      className="grain relative overflow-hidden bg-bone-50 py-24 text-fg-invert sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-16 sm:gap-20 lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-24">
          {/* ------------------------------------------------------- render -- */}
          <Reveal from="left">
            <figure>
              <div className="relative">
                <div
                  ref={frameRef}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-card-lg bg-bone-200 shadow-[0_30px_70px_-32px_rgb(32_33_27/0.5)] ring-1 ring-ink-850/10 sm:aspect-[3/2] lg:aspect-[5/4]"
                >
                  {/* Oversized inner frame: the parallax travels ±8.4% of the
                      frame height inside a 20% overhang, so no edge can ever
                      slide into the rounded crop (scale ≥ 1 only widens it). */}
                  <motion.div
                    className="will-move absolute inset-x-0 -inset-y-[10%]"
                    style={reduce ? undefined : { y: imageY, scale: imageScale }}
                  >
                    <Image
                      src={ABOUT.image}
                      alt="Proiect 3D al unei bucătării la comandă deschise spre zona de dining, realizat de MOBO Kitchens & Home"
                      fill
                      sizes="(min-width: 1024px) 44vw, (min-width: 640px) 92vw, 100vw"
                      className="object-cover"
                    />
                  </motion.div>

                  {/* Static scrim the moving image slides behind — a fixed
                      light edge is what makes the parallax read as depth
                      through a window rather than a sliding sticker. It also
                      seats the stamp against the bright render. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-850/25 to-transparent"
                  />
                </div>

                {/* Maker's stamp. The logo PNG is a lime tile plus a *white*
                    wordmark, so it is invisible on the ivory band — it only
                    reads on a dark plate. Solid, not glass: a backdrop-filter
                    nested inside Reveal's opacity animation loses its backdrop
                    for the whole 800ms and then pops in. It counter-drifts a
                    few px against the image so the frame reads as three
                    stacked planes. */}
                <motion.div
                  className="will-move absolute -bottom-5 left-5 flex items-center rounded-2xl bg-ink-850 px-5 py-3.5 shadow-[0_18px_40px_-18px_rgb(32_33_27/0.55)] sm:-bottom-6 sm:left-8"
                  style={reduce ? undefined : { y: stampY }}
                >
                  <Image
                    src={SITE.logo}
                    alt={SITE.name}
                    width={SITE.logoWidth}
                    height={SITE.logoHeight}
                    className="h-7 w-auto sm:h-8"
                  />
                </motion.div>
              </div>

              {/* Honesty label: every other image on the page is a real
                  installation; this one is a visualisation and says so —
                  quietly, as a drawing annotation, not a badge. The left
                  padding keeps wrapped lines clear of the stamp plate. */}
              <figcaption className="mt-4 pl-40 text-right font-mono text-[0.6875rem] leading-relaxed tracking-[0.12em] uppercase text-fg-invert-dim sm:pl-56">
                Randare 3D — proiectul, înainte de execuție
              </figcaption>
            </figure>
          </Reveal>

          {/* --------------------------------------------------------- copy -- */}
          <div>
            <Reveal from="right" delay={HANDOFF}>
              <p className="text-eyebrow text-fg-invert-dim">
                {ABOUT.eyebrow}
              </p>
            </Reveal>

            <Reveal from="right" delay={HANDOFF} index={1}>
              <h2 id="despre-title" className="text-h2 text-balance mt-6 text-fg-invert">
                {ABOUT.title}
              </h2>
            </Reveal>

            <Reveal from="right" delay={HANDOFF} index={2}>
              <p className="text-body text-pretty mt-7 max-w-[52ch] text-fg-invert-dim">
                {ABOUT.body}
              </p>
            </Reveal>

            {/* Reveal has no `blockquote` tag and glass cannot be nested under
                an element whose opacity is animating, so the surface animates
                itself and propagates the "visible" trigger to the rule and the
                text. The lime border-left became a child span so it can draw
                in as its own beat. */}
            <motion.blockquote
              className="glass glass-invert relative mt-9 overflow-hidden rounded-card p-6 sm:mt-10 sm:p-7"
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              variants={quoteSurface}
            >
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-0.5 origin-top bg-lime-dim"
                variants={quoteRule}
              />
              <motion.p
                className="text-body text-pretty font-medium text-fg-invert"
                variants={quoteText}
              >
                {ABOUT.mission}
              </motion.p>
            </motion.blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
