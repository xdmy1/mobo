"use client";

import { Fragment } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { GOOGLE_RATING, REVIEWS, type Review } from "@/lib/data";
import { DUR, EASE_OUT, STAGGER, VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Customer reviews.
 *
 * Two counter-rotating marquee rows. The durations are deliberately coprime-ish
 * (55s / 68s) so the two tracks never fall into phase with each other — equal or
 * harmonically related durations make the wall visibly "click" into a grid every
 * few seconds and the illusion of an endless feed collapses.
 *
 * The wall is a surface with two planes, not two strips:
 *   - top row = near plane: wider cards on the faster track;
 *   - bottom row = far plane: narrower cards on the slower track. Smaller AND
 *     slower is the cue parallax gives you, so the size difference reads as
 *     depth rather than inconsistency;
 *   - a soft dark band behind both rows recedes the section background — the
 *     cards' backdrop blur picks it up, so they glide across a niche rather
 *     than float on a flat wall.
 *
 * Hovering a row pauses the track (CSS in Marquee). The hovered card lifts and
 * its edge light comes up while its neighbours settle back a fraction, so the
 * pause reads as "this card is being read", not as the animation stalling.
 * All hover behaviour is CSS, gated by hover-fine/-motion; pointer-proximity
 * JS was weighed and rejected — it would need per-frame position reads of
 * duplicated, constantly-transformed cards for a cue the pause already gives.
 *
 * Nothing wraps the wall in an opacity-animating ancestor: an ancestor fading
 * opacity forms a backdrop root and empties every backdrop-filter beneath it
 * for the whole animation. The header animates; the card wall does not — it is
 * already in motion — and the hover sheen fades its OWN opacity inside the
 * glass, which is the safe direction.
 */

const STAR_PATH =
  "M8 1.75l1.79 3.63 4.01.58-2.9 2.83.68 3.99L8 10.9l-3.58 1.88.68-3.99-2.9-2.83 4.01-.58L8 1.75Z";

function StarRow({ starClassName }: { starClassName?: string }) {
  return (
    <p className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={cn("shrink-0 fill-lime-brand", starClassName ?? "size-2.5 sm:size-3.5")}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
      <span className="sr-only">Evaluare 5 din 5 stele</span>
    </p>
  );
}

function ReviewCard({
  review,
  plane = "near",
}: {
  review: Review;
  /** Depth plane. The far row's cards are narrower; its track is also slower. */
  plane?: "near" | "far";
}) {
  const initial = review.name.trim().charAt(0).toUpperCase();
  const far = plane === "far";

  return (
    /* The <li> owns width + gutter; the <figure> owns the material, so it can
       stretch to the tallest card in the row without fighting the flex gutter. */
    <li
      className={cn(
        "mr-2.5 flex shrink-0 sm:mr-5",
        far
          ? "w-[12.5rem] sm:w-[clamp(18.25rem,23vw,22rem)]"
          : "w-[14rem] sm:w-[clamp(20rem,26vw,24rem)]",
      )}
    >
      <figure
        className={cn(
          "group/card glass relative flex flex-1 flex-col rounded-card",
          far ? "p-3.5 sm:p-6" : "p-3.5 sm:p-7",
          /* translate + scale are separate CSS properties in v4, so the lift
             and the neighbours' settle compose instead of overwriting. */
          "transition-transform duration-[250ms] ease-out-strong",
          /* The track pauses on row hover (Marquee CSS); the hovered card
             lifts so the pause reads as deliberate — this one is being read. */
          "hover-fine-motion:hover:-translate-y-1",
          /* ...while every other card in the row settles back a fraction.
             Keyed on a card being hovered (`:has`), not on the row, so
             pointing at the gutter between cards recedes nothing. */
          "hover-fine-motion:group-has-[figure:hover]/row:not-hover:scale-[0.99]",
        )}
      >
        {/* Edge light. Hover clarity fades THIS overlay's own opacity —
            transitioning the border/sheen directly would animate paint
            properties, and fading an ancestor above the glass would flatten
            its backdrop blur. -z-[1]: above the material and its sheen
            (.glass::before, also negative but earlier in tree order),
            beneath the card's content. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-[1] rounded-[inherit]",
            "bg-linear-to-b from-white/5 to-transparent to-55%",
            "ring-1 ring-white/25 ring-inset",
            "opacity-0 transition-opacity duration-200 ease-out-strong",
            "hover-fine:group-hover/card:opacity-100",
          )}
        />

        <StarRow />

        <blockquote className="mt-3.5 sm:mt-5">
          <p className="text-pretty line-clamp-4 text-[0.75rem] leading-[1.55] text-fg-dim sm:line-clamp-6 sm:text-[0.9375rem]">
            {review.text}
          </p>
        </blockquote>

        <figcaption className="mt-auto flex items-center gap-2 border-t border-white/8 pt-3 sm:gap-3 sm:pt-6">
          {/* Fotografia reală de pe profilul Google al recenzentului, unde
              există; altfel cercul cu inițială, exact ca pe Google. */}
          {review.photo ? (
            <span className="relative size-7 shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-white/15 sm:size-10">
              <Image
                src={review.photo}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-full bg-lime-brand/12 text-[0.6875rem] font-medium text-lime-brand ring-1 ring-inset ring-lime-brand/25 sm:size-10 sm:text-sm"
            >
              {initial}
            </span>
          )}
          <span className="min-w-0 truncate text-[0.75rem] font-medium text-fg sm:text-sm">{review.name}</span>
        </figcaption>
      </figure>
    </li>
  );
}

const HEADLINE = "Cel mai bun argument sunt clienții noștri.";

/**
 * Header arrival: the eyebrow rises first, then the headline's words rise out
 * of their own line boxes, staggered left to right. Opacity stays at 1 on the
 * words — the overflow clip does the revealing, so the headline reads as
 * rising into place rather than fading in.
 *
 * Spaces live BETWEEN the clip spans as plain text nodes, never inside them —
 * a trailing space inside an inline-block sits at the end of its own line box
 * and is removed by white-space processing, which would run the words together.
 */
function WallHeader() {
  const reduce = useReducedMotion();

  /* Eyebrow — and the whole headline under reduced motion, where the travel
     goes but the cross-fade stays (gentler feedback, not the absence of it). */
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? DUR.micro : DUR.reveal, ease: EASE_OUT },
    },
  };

  const wordRise: Variants = {
    hidden: { y: "110%" },
    visible: (i: number) => ({
      y: 0,
      transition: { duration: 0.7, ease: EASE_OUT, delay: 2 * STAGGER + i * 0.045 },
    }),
  };

  return (
    <motion.header
      className="max-w-2xl"
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <motion.p variants={rise} className="text-eyebrow text-fg-faint">
        Ce spun clienții
      </motion.p>

      <h2 id="recenzii-title" className="text-h2 text-balance mt-5 text-fg">
        {reduce ? (
          <motion.span variants={rise} className="block">
            {HEADLINE}
          </motion.span>
        ) : (
          <>
            <span className="sr-only">{HEADLINE}</span>
            <span aria-hidden="true">
              {HEADLINE.split(" ").map((word, i) => (
                <Fragment key={`${word}-${i}`}>
                  {i > 0 ? " " : null}
                  {/* 0.15em bottom padding keeps descenders (ș, ț) and the
                      final period from clipping against the mask. */}
                  <span className="inline-block overflow-hidden pb-[0.15em] align-bottom">
                    <motion.span custom={i} variants={wordRise} className="inline-block">
                      {word}
                    </motion.span>
                  </span>
                </Fragment>
              ))}
            </span>
          </>
        )}
      </h2>
    </motion.header>
  );
}

/* Alternating rather than slicing in half: the long reviews sit at the start of
   the array, so a straight split would give one very tall row and one squat one. */
const ROW_TOP = REVIEWS.filter((_, i) => i % 2 === 0);
const ROW_BOTTOM = REVIEWS.filter((_, i) => i % 2 === 1);

export default function Testimonials() {
  return (
    <section
      id="recenzii"
      aria-labelledby="recenzii-title"
      className="grain relative bg-ink-850 py-24 sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12">
        <WallHeader />
      </div>

      {/* Full-bleed: the rows have to run past the container edges for the
          marquee's fade mask to read as "continues off-screen". */}
      <div className="relative mt-10 sm:mt-14">
        {/* The niche. A static darker band behind both rows — the glass blur
            samples it, so the wall reads as a recessed surface the cards
            travel across. Painted before the rows' wrapper (which is
            `relative`), so it always sits underneath them. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -inset-y-10 bg-linear-to-b from-transparent via-ink-950/45 to-transparent sm:-inset-y-14"
        />

        <div className="relative flex flex-col">
          {/* Frozen tracks under reduced motion would strand the rest of the
              wall off-screen, so the row becomes scrollable instead.
              `group/row` scopes the hover-recede to one row at a time; the
              ul's vertical padding is headroom inside the marquee's
              overflow-hidden root so the hover lift never clips — it also
              doubles as the visual gap between the rows. */}
          <Marquee duration={55} className="group/row motion-reduce:overflow-x-auto">
            <ul className="flex list-none py-2 sm:py-2.5">
              {ROW_TOP.map((review) => (
                <ReviewCard key={review.name} review={review} />
              ))}
            </ul>
          </Marquee>

          <Marquee duration={68} reverse className="group/row motion-reduce:overflow-x-auto">
            <ul className="flex list-none py-2 sm:py-2.5">
              {ROW_BOTTOM.map((review) => (
                <ReviewCard key={review.name} review={review} plane="far" />
              ))}
            </ul>
          </Marquee>
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[84rem] justify-center px-5 sm:mt-12 sm:px-8">
        <Reveal
          as="span"
          /* Glass sits on the animating element itself, never under it. */
          className="glass glass-thin inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-pill px-5 py-3 text-center sm:px-6"
        >
          <span className="flex items-center gap-2">
            <StarRow starClassName="size-3" />
            <span className="text-sm font-medium tabular-nums text-fg">{GOOGLE_RATING.value}</span>
          </span>
          <span aria-hidden="true" className="hidden h-4 w-px bg-white/15 sm:block" />
          <span className="text-sm text-fg-dim">
            <strong className="font-medium tabular-nums text-fg">{GOOGLE_RATING.count}</strong>{" "}
            recenzii reale pe Google
          </span>
        </Reveal>
      </div>
    </section>
  );
}
