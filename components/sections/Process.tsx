import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { PROCESS } from "@/lib/data";

import fotoMontaj from "@/assets/proiecte/str-bucovina/bucatarie-01.jpg";

/**
 * Cele nouă etape — a patra formă, și de data asta prin scădere.
 *
 * A doua formă a picat ca „prea tech, prea dark"; a treia, editorială pe
 * ivoriu, tot „arăta a AI" — și pe drept: eticheta uppercase cu tracking,
 * accentul serif-italic din titlu, numeralele romane, folio-urile lime,
 * cele trei capitole perfect simetrice cu aforismele lor. Ornamentică de
 * șablon, oricât de îngrijită.
 *
 * Site-urile atelierelor adevărate conving prin reținere, nu prin decor:
 * un titlu simplu, o singură fotografie, o listă numerotată normală, aer.
 * Exact asta e forma de acum — fără eyebrow, fără serif în titlu, fără
 * capitole, fără hairline-uri pe fiecare rând, numere simple 1–9 în
 * aceeași culoare cu textul. Colțurile fotografiei sunt aproape drepte
 * (3px), ca la cardurile de proiecte.
 */
export default function Process() {
  return (
    <section
      id="servicii"
      aria-labelledby="servicii-title"
      className="relative bg-bone-100 py-16 text-fg-invert sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[76rem] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <h2 id="servicii-title" className="text-h2">
            Cum lucrăm
          </h2>
          <p className="text-pretty mt-4 max-w-[58ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
            Nouă etape, de la prima discuție până la montajul final. La fiecare proiect trecem
            prin același traseu, iar la capăt rămâne garanția de 5 ani.
          </p>
        </Reveal>

        <Reveal index={1}>
          <figure className="mt-10 sm:mt-12">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[3px] bg-bone-200 sm:aspect-[21/9]">
              <Image
                src={fotoMontaj}
                alt="Bucătărie albă cu insulă neagră, montată de MOBO într-o casă din Chișinău"
                fill
                sizes="(min-width: 1280px) 1152px, 92vw"
                placeholder="blur"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2.5 text-[0.8125rem] text-fg-invert-dim">
              Strada Bucovinei, la predare.
            </figcaption>
          </figure>
        </Reveal>

        <ol className="mt-12 grid list-none gap-x-10 gap-y-9 sm:grid-cols-2 sm:mt-14 lg:grid-cols-3">
          {PROCESS.map((step, i) => (
            <Reveal as="li" key={step.n} index={i % 3}>
              <h3 className="text-[1.0625rem] font-medium leading-snug">
                {i + 1}. {step.title}
              </h3>
              <p className="text-pretty mt-2 max-w-[44ch] text-[0.9375rem] leading-[1.65] text-fg-invert-dim">
                {step.description}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
