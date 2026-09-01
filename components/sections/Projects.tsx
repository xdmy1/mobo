"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { PROJECTS, PROJECTS_INDEX_HREF } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Proiecte realizate — împărțite pe case, nu pe încăperi.
 *
 * Restructurat la cererea clientului, după referința D3 Buro: un card = o
 * adresă („Strada Bucovinei"), nu o categorie de mobilier. Ce rămâne al
 * nostru din acea referință e doar ideea; execuția vorbește limba paginii:
 *
 *   - fotografiile ședințelor sunt toate portret 2:3, așa că grila e o
 *     vitrină de cadre verticale — trei coloane pe desktop, toate pe aceeași
 *     linie (clientul a cerut cardurile la același nivel, fără decalaj);
 *   - legenda e o placă de catalog: adresa și numărul real de cadre pe o
 *     linie de bază comună, cu blurb-ul dedesubt;
 *   - hover = gramatica existentă: scale lent pe fotografie + hairline care
 *     se desenează sub adresă. Fără badge-uri, fără scrim-uri.
 *
 * Fără filtre: cinci case nu se filtrează, se răsfoiesc.
 */
export default function Projects({
  variant = "home",
}: {
  /**
   * "home" — banda de pe homepage, cu titlul ei și linkul spre /proiecte.
   * "page" — aceeași grilă pe /proiecte, unde PageHeader poartă titlul.
   */
  variant?: "home" | "page";
}) {
  return (
    <section
      id="proiecte"
      aria-labelledby={variant === "home" ? "proiecte-titlu" : undefined}
      aria-label={variant === "page" ? "Proiecte realizate" : undefined}
      className="relative bg-bone-50 text-fg-invert"
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12",
          variant === "home" ? "py-20 sm:py-24 lg:py-28" : "pb-20 pt-12 sm:pb-24 sm:pt-14 lg:pb-28",
        )}
      >
        {variant === "home" && (
          <header className="flex flex-col gap-6 border-b border-ink-850/15 pb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <Reveal>
              <h2 id="proiecte-titlu" className="text-h2 text-balance max-w-[20ch]">
                Proiecte realizate, casă cu casă.
              </h2>
            </Reveal>

            <Reveal index={1} className="lg:max-w-sm lg:pb-1">
              <p className="text-pretty text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                Fiecare proiect e o adresă reală din Chișinău: tot mobilierul unei locuințe,
                măsurat, fabricat și montat de aceeași echipă.
              </p>
            </Reveal>
          </header>
        )}

        {/* Grila. Toate cardurile pe aceeași linie de sus — decalajul coloanei
            din mijloc a fost scos la cererea clientului. */}
        <ul
          className={cn(
            "grid list-none grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-16",
            variant === "home" ? "mt-10 lg:mt-12" : "mt-2",
          )}
        >
          {PROJECTS.map((proiect, i) => (
            <Reveal key={proiect.slug} as="li" index={i % 3}>
              <Link href={proiect.href} className="group block">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[3px] bg-bone-200">
                  <Image
                    src={proiect.cover}
                    alt={`${proiect.title} — ${proiect.blurb}`}
                    fill
                    placeholder={typeof proiect.cover === "string" ? "empty" : "blur"}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                    className={cn(
                      "object-cover",
                      "transition-[scale] duration-[600ms] ease-out-strong",
                      "hover-fine-motion:group-hover:scale-[1.03]",
                    )}
                  />
                </div>

                {/* Placa de catalog: adresa și creditul foto pe o baseline. */}
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="text-h3 relative text-balance">
                    {proiect.title}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-fg-invert",
                        "transition-transform duration-[240ms] ease-out-strong",
                        "group-focus-visible:scale-x-100 hover-fine-motion:group-hover:scale-x-100",
                      )}
                    />
                  </h3>
                  <span className="text-eyebrow shrink-0 text-fg-invert-dim">
                    {proiect.photoCount} foto
                  </span>
                </div>

                <p className="mt-2 text-pretty text-sm leading-[1.65] text-fg-invert-dim">
                  {proiect.blurb}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>

        {variant === "home" && (
          <Reveal className="mt-14 border-t border-ink-850/15 pt-7">
            <Link
              href={PROJECTS_INDEX_HREF}
              className={cn(
                "group inline-flex items-baseline gap-2 text-[0.9375rem] font-medium",
                "transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light",
              )}
            >
              Vezi toate proiectele
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-out-strong hover-fine:group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
