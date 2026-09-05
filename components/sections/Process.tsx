import Image, { type StaticImageData } from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { PROCESS } from "@/lib/data";
import { cn } from "@/lib/utils";

import fotoProiectare from "@/assets/proiecte/str-miorita/antreu-02.jpg";
import fotoAtelier from "@/assets/proiecte/str-valentin-rosca/dressing-01.jpg";
import fotoMontaj from "@/assets/proiecte/str-bucovina/bucatarie-01.jpg";

/**
 * Cele nouă etape — forma a cincea.
 *
 * Drumul până aici: șina tech pe negru (picată: „prea SaaS"), capitolele cu
 * ornamente (numerale romane, serif italic, folio-uri lime — picate: „arată a
 * AI"), apoi lista ultra-simplă (picată: „prea soulless"). Ce a rămas valid
 * din fiecare rundă: fotografiile dau viață, ornamentele o omoară.
 *
 * Deci: capitolele cu câte o fotografie reală pe o parte — asta e căldura —
 * dar scrise simplu. Titluri normale de propoziție, numere „1." în aceeași
 * culoare cu textul, fără eyebrow, fără numerale decorative, fără aforisme.
 */

type Chapter = {
  title: string;
  steps: [number, number];
  image: StaticImageData;
  alt: string;
  credit: string;
};

const CHAPTERS: Chapter[] = [
  {
    title: "Proiectăm împreună",
    steps: [0, 4],
    image: fotoProiectare,
    alt: "Antreu cu pereți frezați, consolă suspendată și oglindă, dintr-un proiect MOBO",
    credit: "Strada Miorița",
  },
  {
    title: "Construim în atelier",
    steps: [4, 6],
    image: fotoAtelier,
    alt: "Fronturi frezate vopsite alb și corp din lemn, detaliu dintr-un proiect MOBO",
    credit: "Strada Valentin Roșca",
  },
  {
    title: "Montăm și garantăm",
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
        <Reveal>
          <h2 id="servicii-title" className="text-h2">
            Cum lucrăm
          </h2>
          <p className="text-pretty mt-4 max-w-[58ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
            Nouă etape, de la prima discuție până la montajul final. La fiecare proiect trecem
            prin același traseu, iar la capăt rămâne garanția de 5 ani.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-col gap-14 sm:mt-14 lg:gap-16">
          {CHAPTERS.map((chapter, chapterIndex) => {
            const mirrored = chapterIndex % 2 === 1;
            return (
              <article
                key={chapter.title}
                className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10"
              >
                <Reveal
                  from={mirrored ? "right" : "left"}
                  className={cn(
                    "lg:col-span-5",
                    mirrored && "lg:col-start-8 lg:order-last",
                  )}
                >
                  <figure>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-bone-200 lg:aspect-[4/5]">
                      <Image
                        src={chapter.image}
                        alt={chapter.alt}
                        fill
                        sizes="(min-width: 1024px) 38vw, 92vw"
                        placeholder="blur"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="mt-2.5 text-[0.8125rem] text-fg-invert-dim">
                      {chapter.credit}
                    </figcaption>
                  </figure>
                </Reveal>

                <div
                  className={cn(
                    "lg:col-span-6",
                    mirrored ? "lg:col-start-1" : "lg:col-start-7",
                  )}
                >
                  <Reveal>
                    <h3 className="text-h2">{chapter.title}</h3>
                  </Reveal>

                  <ol className="mt-6 list-none">
                    {PROCESS.slice(...chapter.steps).map((step, i) => (
                      <Reveal
                        as="li"
                        key={step.n}
                        index={i + 1}
                        className="border-b border-ink-850/10 py-4 last:border-b-0 sm:py-5"
                      >
                        <h4 className="text-[1.0625rem] font-medium leading-snug">
                          {chapter.steps[0] + i + 1}. {step.title}
                        </h4>
                        <p className="text-pretty mt-1.5 max-w-[54ch] text-[0.9375rem] leading-[1.65] text-fg-invert-dim">
                          {step.description}
                        </p>
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
