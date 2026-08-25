"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Slide = { src: string; alt: string; room?: string };

/**
 * Galeria unui proiect — răsfoire orizontală pe scroll-snap NATIV: gestul,
 * momentum-ul și reduced-motion sunt ale browserului, nu re-implementate în JS.
 * Punctele de sub galerie arată poziția și sar la cadru (gramatica de răsfoire
 * din referința ciotca), iar eticheta încăperii stă sub cadru, ca o legendă de
 * catalog — nu peste fotografie.
 */
export function ProjectGallery({ slides, title }: { slides: Slide[]; title: string }) {
  const track = useRef<HTMLUListElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll("li"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(items.indexOf(e.target as HTMLLIElement));
        }
      },
      { root: el, threshold: 0.6 },
    );
    items.forEach((item) => io.observe(item));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const item = el.querySelectorAll("li")[i] as HTMLLIElement | undefined;
    if (!item) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: item.offsetLeft - el.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  };

  if (slides.length === 0) return null;

  return (
    <div>
      {/* Marginile negative + padding readuc pista la marginea containerului,
          ca primul cadru să stea aliniat cu textul iar restul să „iasă" din
          pagină — semnalul vizual că se poate răsfoi. */}
      <ul
        ref={track}
        aria-label={`Galeria proiectului ${title}`}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <li key={`${s.src}-${i}`} className="w-[86%] shrink-0 snap-start sm:w-[64%] lg:w-[46%]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-bone-200">
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(min-width: 1024px) 46vw, (min-width: 640px) 64vw, 86vw"
                className="object-cover"
              />
            </div>
            {s.room && <p className="text-eyebrow mt-3 text-fg-invert-dim">{s.room}</p>}
          </li>
        ))}
      </ul>

      {slides.length > 1 && (
        <div className="mt-5 flex items-center gap-2" aria-label="Cadrele galeriei">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Cadrul ${i + 1}${s.room ? ` — ${s.room}` : ""}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200 ease-out-strong",
                i === active
                  ? "w-6 bg-fg-invert"
                  : "w-1.5 bg-ink-850/25 hover-fine:hover:bg-ink-850/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
