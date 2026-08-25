"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Filmstrip-ul unui proiect — răspunsul nostru la caruselul cu 20 de puncte
 * din referința clientului.
 *
 * Aceleași ingrediente (defilare orizontală, săgeți), dar în gramatica
 * paginii:
 *   - cadrele stau la înălțime fixă, portret 2:3, ca pe o masă de lightbox;
 *   - în loc de puncte: un contor mono („03 / 12") și hairline-ul casei,
 *     care se umple pe măsură ce defilezi — 12 puncte sunt zgomot, o linie
 *     care se desenează e deja limbajul site-ului;
 *   - defilarea e nativă (scroll cu snap), deci fluidă pe touch și corect
 *     accesibilă; mouse-ul primește drag cu inerția browserului și săgeți;
 *   - tastatura: focus pe bandă + săgeți stânga/dreapta.
 *
 * Sub prefers-reduced-motion salturile devin instant (behavior: auto).
 */

export default function ProjectGallery({
  title,
  images,
  className,
}: {
  title: string;
  /** URL-urile cadrelor, în ordinea ședinței. Toate portret 2:3. */
  images: string[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  /* Drag cu mouse-ul: banda urmează cursorul 1:1. Snap-ul e suspendat cât
     ține gestul (altfel se bate cu scrollLeft imperativ) și browserul
     reașază banda pe cadru la eliberare. Touch-ul nu trece pe aici — are
     deja defilare nativă cu inerție. */
  const drag = useRef<{ startX: number; startLeft: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const slideAt = useCallback((track: HTMLUListElement, i: number) => {
    return track.children.item(i) as HTMLElement | null;
  }, []);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setProgress(max > 0 ? track.scrollLeft / max : 1);

    /* Cadrul curent = cel al cărui start e cel mai aproape de marginea de
       defilare. offsetLeft e relativ la bandă, deci nu mișcă layoutul. */
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < track.children.length; i += 1) {
      const slide = slideAt(track, i);
      if (!slide) continue;
      const d = Math.abs(slide.offsetLeft - track.scrollLeft - track.clientWidth * 0.06);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    setIndex(nearest);
  }, [slideAt]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const target = Math.min(images.length - 1, Math.max(0, index + dir));
      const slide = slideAt(track, target);
      if (!slide) return;
      track.scrollTo({
        left: slide.offsetLeft - track.clientWidth * 0.06,
        behavior: reduce ? "auto" : "smooth",
      });
    },
    [images.length, index, reduce, slideAt],
  );

  const counter = `${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;

  return (
    <figure className={className} role="group" aria-label={`Galerie foto — ${title}`}>
      {/* ------------------------------------------------------------ banda */}
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={`Fotografiile proiectului ${title}. Folosește săgețile pentru a naviga.`}
        onScroll={onScroll}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          const track = trackRef.current;
          if (!track) return;
          drag.current = { startX: e.clientX, startLeft: track.scrollLeft };
          setDragging(true);
          track.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const track = trackRef.current;
          if (!track) return;
          track.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        className={cn(
          "flex list-none gap-4 overflow-x-auto overscroll-x-contain sm:gap-5",
          /* Aerul lateral: primul cadru pornește aliniat cu grila paginii. */
          "px-5 sm:px-8 lg:px-12 scroll-px-5 sm:scroll-px-8 lg:scroll-px-12",
          dragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {images.map((src, i) => (
          <li
            key={src}
            className="relative aspect-[2/3] h-[56svh] max-h-[40rem] min-h-[20rem] shrink-0 snap-start overflow-hidden rounded-[3px] bg-bone-200"
          >
            <Image
              src={src}
              alt={`${title} — fotografia ${i + 1} din ${images.length}`}
              fill
              sizes="(min-width: 1024px) 30vw, 75vw"
              priority={i < 2}
              draggable={false}
              className="select-none object-cover"
            />
          </li>
        ))}
      </ul>

      {/* -------------------------------------------- contor + hairline + săgeți */}
      <div className="mx-auto mt-6 flex w-full max-w-[88rem] items-center gap-6 px-5 sm:px-8 lg:px-12">
        <p aria-live="polite" className="shrink-0 font-mono text-[0.6875rem] tracking-[0.12em] text-fg-invert-dim">
          {counter}
        </p>

        {/* Hairline-ul de progres — punctele caruselului, redesenate ca linia
            editorială a casei. scaleX, nimic care să dea layout. */}
        <div aria-hidden="true" className="relative h-px flex-1 bg-ink-850/15">
          <motion.span
            className="absolute inset-0 origin-left bg-ink-850/70 will-move"
            style={{ scaleX: Math.max(0.04, progress) }}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={index === 0}
            aria-label="Fotografia precedentă"
            className={cn(
              "glass glass-invert grid size-10 place-items-center rounded-full",
              "transition-[transform,opacity] duration-[160ms] ease-out-strong active:scale-[0.94]",
              "disabled:pointer-events-none disabled:opacity-35",
            )}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
              <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={index === images.length - 1}
            aria-label="Fotografia următoare"
            className={cn(
              "glass glass-invert grid size-10 place-items-center rounded-full",
              "transition-[transform,opacity] duration-[160ms] ease-out-strong active:scale-[0.94]",
              "disabled:pointer-events-none disabled:opacity-35",
            )}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
              <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </figure>
  );
}
