"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ProjectSpace } from "@/lib/data";

/**
 * Filmstrip-ul unui proiect — răspunsul nostru la caruselul cu 20 de puncte
 * din referința clientului.
 *
 * Aceleași ingrediente (defilare orizontală, săgeți), dar în gramatica
 * paginii:
 *   - cadrele stau la înălțime fixă, ca pe o masă de lightbox — portret 2:3,
 *     iar cadrele `wide` primesc 3:2 la aceeași înălțime, netăiate;
 *   - în loc de puncte: un contor mono („03 / 30") și hairline-ul casei,
 *     care se umple pe măsură ce defilezi — 12 puncte sunt zgomot, o linie
 *     care se desenează e deja limbajul site-ului;
 *   - defilarea e nativă (scroll cu snap), deci fluidă pe touch și corect
 *     accesibilă; mouse-ul primește drag cu inerția browserului și săgeți;
 *   - tastatura: focus pe bandă + săgeți stânga/dreapta.
 *
 * Galeria e împărțită PE SPAȚII (cerință de client — „să fie clar că merge
 * spațiu după spațiu"): o bară cu numele spațiilor deasupra benzii (sare la
 * primul cadru al spațiului), o etichetă pe cadrul care deschide fiecare
 * spațiu și numele spațiului curent lângă contor. Galeriile încă negrupate
 * (un singur spațiu, fără etichetă) cad înapoi pe filmstrip-ul simplu.
 *
 * Sub prefers-reduced-motion salturile devin instant (behavior: auto).
 */

type Slide = {
  src: ProjectSpace["photos"][number]["src"];
  wide?: boolean;
  spaceIndex: number;
  /** Primul cadru al spațiului său — poartă eticheta în bandă. */
  opensSpace: boolean;
};

export default function ProjectGallery({
  title,
  spaces,
  className,
}: {
  title: string;
  /** Galeria pe spații, în ordinea în care parcurgi casa. */
  spaces: ProjectSpace[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const slides = useMemo<Slide[]>(
    () =>
      spaces.flatMap((space, spaceIndex) =>
        space.photos.map((photo, i) => ({ ...photo, spaceIndex, opensSpace: i === 0 })),
      ),
    [spaces],
  );
  /* Etichetele apar doar când galeria e cu adevărat grupată. */
  const labeled = spaces.length > 1 && spaces.every((s) => s.label);
  const activeSpace = slides[index]?.spaceIndex ?? 0;

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

  /* Tween manual pe rAF, nu scrollTo({behavior:"smooth"}): Lenis (SmoothScroll)
     anulează orice smooth scroll nativ programatic, deci banda rămânea pe loc.
     Snap-ul e suspendat pe durata tween-ului (ca la drag) și NU e repus la
     final: Chrome, la reactivarea snap-ului, „re-snap-ează" pe cadrul memorat
     dinaintea saltului și anulează tot drumul. Rămâne suspendat până la primul
     gest al utilizatorului (wheel / touch / drag / săgeți), care trece prin
     stopGlide — iar pentru că aterizăm exact pe poziția de snap a cadrului
     țintă (offsetLeft − scroll-padding), reactivarea nu mișcă nimic. */
  const glide = useRef<number | null>(null);
  const stopGlide = useCallback(() => {
    if (glide.current !== null) {
      cancelAnimationFrame(glide.current);
      glide.current = null;
    }
    if (trackRef.current) trackRef.current.style.scrollSnapType = "";
  }, []);
  useEffect(() => stopGlide, [stopGlide]);

  const scrollToSlide = useCallback(
    (target: number) => {
      const track = trackRef.current;
      if (!track) return;
      const slide = slideAt(track, target);
      if (!slide) return;
      const padding = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
      const to = Math.max(
        0,
        Math.min(slide.offsetLeft - padding, track.scrollWidth - track.clientWidth),
      );
      if (glide.current !== null) {
        cancelAnimationFrame(glide.current);
        glide.current = null;
      }
      if (reduce) {
        track.scrollLeft = to;
        return;
      }
      const from = track.scrollLeft;
      const duration = Math.min(900, 350 + Math.abs(to - from) * 0.08);
      const start = performance.now();
      track.style.scrollSnapType = "none";
      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        track.scrollLeft = from + (to - from) * (1 - Math.pow(1 - t, 3));
        glide.current = t < 1 ? requestAnimationFrame(frame) : null;
      };
      glide.current = requestAnimationFrame(frame);
    },
    [reduce, slideAt],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      scrollToSlide(Math.min(slides.length - 1, Math.max(0, index + dir)));
    },
    [index, scrollToSlide, slides.length],
  );

  /* Saltul din bara de spații: primul cadru al spațiului ales. */
  const jumpToSpace = useCallback(
    (spaceIndex: number) => {
      scrollToSlide(slides.findIndex((s) => s.spaceIndex === spaceIndex));
    },
    [scrollToSlide, slides],
  );

  const counter = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;

  return (
    <figure className={className} role="group" aria-label={`Galerie foto — ${title}`}>
      {/* -------------------------------------------------- bara de spații */}
      {labeled && (
        <nav
          aria-label="Spațiile casei, în ordinea galeriei"
          className="mx-auto mb-6 flex w-full max-w-[88rem] flex-wrap gap-x-6 gap-y-2 px-5 sm:px-8 lg:px-12"
        >
          {spaces.map((space, i) => (
            <button
              key={space.label}
              type="button"
              onClick={() => jumpToSpace(i)}
              aria-current={i === activeSpace ? "true" : undefined}
              className={cn(
                "text-[0.8125rem] font-medium tracking-[0.02em] transition-colors duration-200 ease-out-strong",
                i === activeSpace
                  ? "text-fg-invert underline decoration-lime-on-light decoration-2 underline-offset-[6px]"
                  : "text-fg-invert-dim hover-fine:hover:text-lime-on-light",
              )}
            >
              {space.label}
            </button>
          ))}
        </nav>
      )}

      {/* ------------------------------------------------------------ banda */}
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={`Fotografiile proiectului ${title}, spațiu după spațiu. Folosește săgețile pentru a naviga.`}
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
        onWheel={stopGlide}
        onTouchStart={stopGlide}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          stopGlide();
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
        {slides.map((slide, i) => {
          const spaceLabel = spaces[slide.spaceIndex].label;
          const local = typeof slide.src !== "string";
          return (
            <li
              key={typeof slide.src === "string" ? slide.src : slide.src.src}
              className={cn(
                "relative h-[56svh] max-h-[40rem] min-h-[20rem] shrink-0 snap-start overflow-hidden rounded-[3px] bg-bone-200",
                slide.wide ? "aspect-[3/2]" : "aspect-[2/3]",
              )}
            >
              <Image
                src={slide.src}
                alt={
                  labeled
                    ? `${title} — ${spaceLabel}, fotografia ${i + 1} din ${slides.length}`
                    : `${title} — fotografia ${i + 1} din ${slides.length}`
                }
                fill
                sizes={
                  slide.wide
                    ? "(min-width: 1024px) 48vw, 95vw"
                    : "(min-width: 1024px) 30vw, 75vw"
                }
                /* Cadrele locale (import static) au blurDataURL generat de
                   Next — blur-up în locul plăcii bone-200 goale. */
                placeholder={local ? "blur" : "empty"}
                preload={i < 2}
                draggable={false}
                className="select-none object-cover"
              />
              {/* Eticheta care deschide spațiul — semnalul „am trecut în altă
                  cameră" chiar în bandă. Decorativă aici (numele e deja în
                  bara de spații și în contor), deci ascunsă de la AT. */}
              {labeled && slide.opensSpace && (
                <span
                  aria-hidden="true"
                  className="glass glass-invert pointer-events-none absolute bottom-3 left-3 rounded-full px-3.5 py-1.5 text-[0.6875rem] font-medium tracking-[0.08em]"
                >
                  {spaceLabel}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* -------------------------------------------- contor + hairline + săgeți */}
      <div className="mx-auto mt-6 flex w-full max-w-[88rem] items-center gap-6 px-5 sm:px-8 lg:px-12">
        <p
          aria-live="polite"
          className="shrink-0 font-mono text-[0.6875rem] tracking-[0.12em] text-fg-invert-dim"
        >
          {counter}
          {labeled && (
            <span className="ml-3 text-fg-invert">{spaces[activeSpace].label}</span>
          )}
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
              "glass glass-invert btn-3d-glass grid size-10 place-items-center rounded-full",
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
            disabled={index === slides.length - 1}
            aria-label="Fotografia următoare"
            className={cn(
              "glass glass-invert btn-3d-glass grid size-10 place-items-center rounded-full",
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
