"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useI18n } from "@/components/ui/LangProvider";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Lightbox-ul galeriei — cadrul mărit, pe tot ecranul.
 *
 * Filmstrip-ul arată cadrele la înălțime fixă, tăiate; aici cadrul se vede
 * ÎNTREG (object-contain), cât încape în ecran, și se poate apropia:
 *
 *   - click / tap pe fotografie: mărire ×2.2 în jurul punctului atins, care
 *     rămâne sub cursor; al doilea click aduce cadrul înapoi la „tot";
 *   - cu mouse-ul, cadrul mărit urmărește cursorul (pan continuu, pe arc), ca
 *     la o lupă — nu trebuie ținut apăsat; pe touch se trage cu degetul;
 *   - swipe orizontal (touch) sau săgeți (tastatură / butoane) — cadrul
 *     următor, în buclă; click pe fundal sau Escape — închidere.
 *
 * Fotografia curentă e singura vizibilă; vecinii ei sunt randați invizibil
 * ca următorul pas să nu aștepte descărcarea. Pagina de sub e blocată la
 * scroll (overflow + data-lenis-prevent, ca Lenis să nu deruleze sub dialog),
 * iar focusul stă în dialog și se întoarce la buton la închidere.
 *
 * Sub prefers-reduced-motion: fără crossfade, fără arc — sărituri directe.
 */

export type LightboxSlide = {
  src: string | StaticImageData;
  alt: string;
  /** Spațiul (sau casa) din care vine cadrul — apare în bara de sus. */
  label?: string;
};

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
/** Sub prag e tap/click; peste, pe orizontală, e swipe. */
const TAP_PX = 8;
const SWIPE_PX = 48;
const ZOOM = 2.2;

const PAN_SPRING = { stiffness: 260, damping: 34, mass: 0.8 };
const SCALE_SPRING = { stiffness: 220, damping: 30 };

type Gesture = {
  x: number;
  y: number;
  panX: number;
  panY: number;
  moved: boolean;
};

const Arrow = ({ dir }: { dir: "prev" | "next" }) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
    <path
      d={dir === "prev" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BUTTON = cn(
  "glass btn-3d-glass grid size-11 place-items-center rounded-full text-fg",
  "transition-[transform,opacity] duration-[160ms] ease-out-strong active:scale-[0.94]",
);

export default function Lightbox({
  title,
  slides,
  index,
  open,
  onClose,
  onIndexChange,
}: {
  title: string;
  slides: LightboxSlide[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => setPortal(document.body), []);

  const count = slides.length;
  const slide = slides[index];

  /* Pan-ul + scara cadrului mărit: valori brute + arcuri, ca urmărirea
     cursorului să aibă greutate, nu să sară. Sub reduced-motion se folosesc
     direct valorile brute. */
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const scaleRaw = useMotionValue(1);
  const springX = useSpring(panX, PAN_SPRING);
  const springY = useSpring(panY, PAN_SPRING);
  const springScale = useSpring(scaleRaw, SCALE_SPRING);
  const stageStyle = reduce
    ? { x: panX, y: panY, scale: scaleRaw }
    : { x: springX, y: springY, scale: springScale };

  const resetZoom = useCallback(() => {
    setZoomed(false);
    scaleRaw.set(1);
    panX.set(0);
    panY.set(0);
  }, [panX, panY, scaleRaw]);

  /* Pan-ul e limitat la cât iese cadrul mărit din scenă, pe fiecare axă. */
  const clampPan = useCallback((x: number, y: number): [number, number] => {
    const stage = stageRef.current;
    if (!stage) return [x, y];
    const maxX = ((ZOOM - 1) * stage.clientWidth) / 2;
    const maxY = ((ZOOM - 1) * stage.clientHeight) / 2;
    return [Math.max(-maxX, Math.min(maxX, x)), Math.max(-maxY, Math.min(maxY, y))];
  }, []);

  /* Pan-ul care ține punctul (clientX, clientY) pe loc după scalare: punctul
     la distanța d de centru ajunge la d·Z, deci se trage înapoi cu d·(Z−1).
     Aceeași formulă, aplicată continuu, e și pan-ul care urmărește cursorul. */
  const panToward = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      const [x, y] = clampPan(-dx * (ZOOM - 1), -dy * (ZOOM - 1));
      panX.set(x);
      panY.set(y);
    },
    [clampPan, panX, panY],
  );

  const zoomAt = useCallback(
    (clientX: number, clientY: number) => {
      panToward(clientX, clientY);
      scaleRaw.set(ZOOM);
      setZoomed(true);
    },
    [panToward, scaleRaw],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      if (count < 2) return;
      resetZoom();
      onIndexChange((index + dir + count) % count);
    },
    [count, index, onIndexChange, resetZoom],
  );

  /* Orice cadru nou pornește „tot"; la închidere la fel, ca redeschiderea să
     nu moștenească o mărire. */
  useEffect(() => {
    resetZoom();
  }, [index, open, resetZoom]);

  /* Cadrul randat (object-contain) e mai mic decât scena; un click în afara
     lui e pe fundal. getBoundingClientRect ține cont de scalare, deci testul
     e corect și când cadrul e mărit. */
  const hitsPhoto = useCallback(
    (clientX: number, clientY: number) => {
      const img = stageRef.current?.querySelector<HTMLImageElement>(
        `[data-slide="${index}"] img`,
      );
      if (!img || !img.naturalWidth || !img.naturalHeight) return true;
      const rect = img.getBoundingClientRect();
      const fit = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
      const w = img.naturalWidth * fit;
      const h = img.naturalHeight * fit;
      const left = rect.left + (rect.width - w) / 2;
      const top = rect.top + (rect.height - h) / 2;
      return clientX >= left && clientX <= left + w && clientY >= top && clientY <= top + h;
    },
    [index],
  );

  /* Un singur set de gesturi pe scenă: tap/click (mărire sau închidere),
     swipe (cadrul următor) și tragere (pan, când e mărit). Mouse-ul nu are
     nevoie de tragere — cadrul mărit îi urmărește cursorul. */
  const gesture = useRef<Gesture | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panX.get(),
      panY: panY.get(),
      moved: false,
    };
    if (e.pointerType !== "mouse") e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      if (zoomed) panToward(e.clientX, e.clientY);
      return;
    }
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.hypot(dx, dy) > TAP_PX) g.moved = true;
    if (zoomed) {
      const [x, y] = clampPan(g.panX + dx, g.panY + dy);
      panX.set(x);
      panY.set(y);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;

    if (!g.moved && Math.hypot(dx, dy) <= TAP_PX) {
      if (zoomed) resetZoom();
      else if (hitsPhoto(e.clientX, e.clientY)) zoomAt(e.clientX, e.clientY);
      else onClose();
      return;
    }
    if (e.pointerType !== "mouse" && !zoomed && Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      step(dx < 0 ? 1 : -1);
    }
  };

  /* Blocarea paginii de dedesubt + focus în dialog. Compensarea de scrollbar
     e aceeași ca în Nav, ca pagina să nu sară lateral când cade blocarea. */
  useEffect(() => {
    if (!open) return;
    const { body, documentElement: root } = document;
    const prevOverflow = body.style.overflow;
    const gap = window.innerWidth - root.clientWidth;
    if (gap > 0) root.style.setProperty("--scroll-lock-gap", `${gap}px`);
    body.style.overflow = "hidden";

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    return () => {
      body.style.overflow = prevOverflow;
      root.style.removeProperty("--scroll-lock-gap");
      previouslyFocused?.focus?.();
    };
  }, [open]);

  /* Tastatura: Escape închide, săgețile răsfoiesc, Tab rămâne în dialog. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
        return;
      }
      if (e.key !== "Tab") return;

      const root = rootRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, step]);

  if (!portal) return null;

  const counter = `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
  /* Set: la două cadre vecinul din stânga e și cel din dreapta. */
  const neighbours = [...new Set([(index - 1 + count) % count, (index + 1) % count])].filter(
    (i) => i !== index,
  );
  const fade = reduce
    ? { duration: 0 }
    : { duration: DUR.ui, ease: EASE_OUT };

  return createPortal(
    <AnimatePresence>
      {open && slide && (
        <motion.div
          ref={rootRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("chrome.gallery.lightbox", { title })}
          data-lenis-prevent=""
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: reduce ? { duration: 0 } : { duration: DUR.micro } }}
          transition={fade}
          className="fixed inset-0 z-[100] flex select-none flex-col bg-ink-950/[0.97] text-fg"
        >
          {/* ---------------------------------------------------- bara de sus */}
          <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
            <p className="min-w-0 truncate text-[0.8125rem] text-fg-dim">
              {title}
              {slide.label && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="text-fg">{slide.label}</span>
                </>
              )}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t("chrome.gallery.close")}
              className={cn(BUTTON, "shrink-0")}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
                <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ---------------------------------------------------------- scena */}
          <div
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              gesture.current = null;
            }}
            className={cn(
              "relative min-h-0 flex-1 touch-none overflow-hidden",
              zoomed ? "hover-fine:cursor-zoom-out" : "hover-fine:cursor-zoom-in",
            )}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={index}
                data-slide={index}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
                className="absolute inset-0"
              >
                <motion.div className="absolute inset-0 will-change-transform" style={stageStyle}>
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="100vw"
                    quality={90}
                    loading="eager"
                    fetchPriority="high"
                    draggable={false}
                    placeholder={typeof slide.src !== "string" ? "blur" : "empty"}
                    className="object-contain"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Vecinii, descărcați din timp — invizibili, dar în DOM. */}
            <div aria-hidden="true" className="invisible absolute inset-0">
              {neighbours.map((i) => (
                <Image
                  key={i}
                  src={slides[i].src}
                  alt=""
                  fill
                  sizes="100vw"
                  quality={90}
                  loading="eager"
                  className="object-contain"
                />
              ))}
            </div>
          </div>

          {/* --------------------------------------------- contor + săgeți */}
          <div className="flex items-center justify-between gap-4 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
            <p
              aria-live="polite"
              className="font-mono text-[0.6875rem] tracking-[0.12em] text-fg-dim"
            >
              {counter}
            </p>
            {count > 1 && (
              <div className="flex items-center gap-2 lg:hidden">
                <button type="button" onClick={() => step(-1)} aria-label={t("chrome.gallery.prev")} className={BUTTON}>
                  <Arrow dir="prev" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label={t("chrome.gallery.next")} className={BUTTON}>
                  <Arrow dir="next" />
                </button>
              </div>
            )}
          </div>

          {/* Pe ecrane late săgețile stau pe margini, la înălțimea cadrului. */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t("chrome.gallery.prev")}
                className={cn(BUTTON, "absolute left-6 top-1/2 hidden -translate-y-1/2 lg:grid")}
              >
                <Arrow dir="prev" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t("chrome.gallery.next")}
                className={cn(BUTTON, "absolute right-6 top-1/2 hidden -translate-y-1/2 lg:grid")}
              >
                <Arrow dir="next" />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    portal,
  );
}
