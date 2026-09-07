import Image, { type StaticImageData } from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { PROCESS } from "@/lib/data";
import { cn } from "@/lib/utils";

/* Fotografiile care ancorează capitolele — cadre reale din proiecte, folosite
   ambiental (legenda spune din ce casă vine cadrul, nu pretinde că „așa arată
   etapa"). */
import fotoProiectare from "@/assets/proiecte/str-miorita/antreu-02.jpg";
import fotoAtelier from "@/assets/proiecte/str-valentin-rosca/dressing-01.jpg";
import fotoMontaj from "@/assets/proiecte/str-bucovina/bucatarie-01.jpg";

/**
 * Cele nouă etape — a treia formă a secțiunii.
 *
 * A doua formă (șină luminoasă scrubbed pe scroll, carduri de sticlă pe
 * grafit, numere mono în pastile) a picat la client: „prea tech pentru o
 * companie de mobilă, prea dark". Avea dreptate — era gramatica unui landing
 * de SaaS, nu a unui atelier.
 *
 * Forma de acum e editorială și caldă: banda ivorie pe care o promitea și
 * ritmul paginii (Projects bone-50 → Process bone-100 → Testimonials dark),
 * cele nouă etape grupate în trei capitole povestite — proiectare, atelier,
 * montaj — fiecare cu o fotografie reală dintr-o casă MOBO pe o parte și
 * etapele ca rânduri liniștite pe cealaltă. Numerotarea e serif italic, ca un
 * folio de revistă; fără iconițe, fără sticlă, fără scroll-scrubbing — doar
 * reveal-urile casei.
 */

type Chapter = {
  numeral: string;
  title: string;
  blurb: string;
  /** Interval [de la, până la) în PROCESS. */
  steps: [number, number];
  image: StaticImageData;
  alt: string;
  credit: string;
};

const CHAPTERS: Chapter[] = [
  {
    numeral: "I",
    title: "Proiectăm împreună",
    blurb: "Patru întâlniri în care planul prinde contur — nimic nu pleacă spre atelier până nu-l aprobi.",
    steps: [0, 4],
    image: fotoProiectare,
    alt: "Antreu cu pereți frezați, consolă suspendată și oglindă, dintr-un proiect MOBO",
    credit: "Strada Miorița",
  },
  {
    numeral: "II",
    title: "Construim în atelier",
    blurb: "Contractul fixează totul, apoi mobilierul se fabrică sub controlul nostru, nu al furnizorilor.",
    steps: [4, 6],
    image: fotoAtelier,
    alt: "Fronturi frezate vopsite alb și corp din lemn, detaliu dintr-un proiect MOBO",
    credit: "Strada Valentin Roșca",
  },
  {
    numeral: "III",
    title: "Montăm și garantăm",
    blurb: "Livrare, montaj cu reglaj fin și predare doar după verificarea împreună — apoi 5 ani de liniște.",
    steps: [6, 9],
    image: fotoMontaj,
    alt: "Bucătărie albă cu insulă neagră, montată într-o casă din Chișinău",
    credit: "Strada Bucovinei",
  },
];

export default function Process() {
  return (
    <section
      id="servicii"
      aria-labelledby="servicii-title"
      className="relative bg-bone-100 py-16 text-fg-invert sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal>
            <p className="text-eyebrow text-fg-invert-dim">Cum lucrăm</p>
            <h2 id="servicii-title" className="text-h2 text-balance mt-5 max-w-[22ch]">
              Nouă etape clare, <span className="serif-accent">de la prima discuție</span> până
              la montajul final.
            </h2>
          </Reveal>
          <Reveal index={1} className="lg:max-w-sm lg:pb-1">
            <p className="text-pretty text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
              Fiecare proiect trece prin același traseu, fără improvizații. Știi tot timpul la ce
              etapă ești — iar la capăt rămâne garanția de 5 ani.
            </p>
          </Reveal>
        </header>

        <div className="mt-12 flex flex-col gap-14 sm:mt-16 lg:gap-20">
          {CHAPTERS.map((chapter, chapterIndex) => {
            const mirrored = chapterIndex % 2 === 1;
            return (
              <article
                key={chapter.numeral}
                className="grid items-start gap-8 border-t border-ink-850/15 pt-10 lg:grid-cols-12 lg:gap-10 lg:pt-12"
              >
                {/* ------------------------------------------------ fotografia */}
                <Reveal
                  from={mirrored ? "right" : "left"}
                  className={cn(
                    "lg:col-span-5 lg:row-span-full",
                    mirrored && "lg:col-start-8 lg:order-last",
                  )}
                >
                  <figure>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-bone-200 lg:aspect-[4/5]">
                      <Image
                        src={chapter.image}
                        alt={chapter.alt}
                        fill
                        sizes="(min-width: 1024px) 38vw, 92vw"
                        placeholder="blur"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="mt-3 text-[0.8125rem] text-fg-invert-dim">
                      Din proiectul „{chapter.credit}".
                    </figcaption>
                  </figure>
                </Reveal>

                {/* --------------------------------------------------- etapele */}
                <div
                  className={cn(
                    "lg:col-span-6",
                    mirrored ? "lg:col-start-1" : "lg:col-start-7",
                  )}
                >
                  <Reveal>
                    <h3 className="text-h2 text-balance">
                      <span aria-hidden="true" className="serif-accent mr-3 text-lime-on-light">
                        {chapter.numeral}.
                      </span>
                      {chapter.title}
                    </h3>
                    <p className="text-pretty mt-3 max-w-[52ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                      {chapter.blurb}
                    </p>
                  </Reveal>

                  <ol className="mt-7 list-none">
                    {PROCESS.slice(...chapter.steps).map((step, i) => (
                      <Reveal
                        as="li"
                        key={step.n}
                        index={i + 1}
                        className="grid grid-cols-[3rem_1fr] gap-x-2 border-b border-ink-850/15 py-4 sm:gap-x-4 sm:py-5"
                      >
                        {/* Folio de revistă, nu contor de terminal. */}
                        <span
                          aria-hidden="true"
                          className="serif-accent pt-0.5 text-[1.375rem] leading-none text-lime-on-light"
                        >
                          {step.n}
                        </span>
                        <span>
                          <span className="block text-[1.0625rem] font-medium leading-snug">
                            {step.title}
                          </span>
                          <span className="text-pretty mt-1.5 block max-w-[54ch] text-[0.9375rem] leading-[1.65] text-fg-invert-dim">
                            {step.description}
                          </span>
                        </span>
                      </Reveal>
                    ))}
                  </ol>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
