import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Footer from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import ProjectGallery from "@/components/ui/ProjectGallery";
import { coverUrl, KITCHENS_GALLERY, PARTNERS, PROJECTS_INDEX_HREF, SITE } from "@/lib/data";

/**
 * Pagina Bucătării — cerință de client: „Bucătării" în meniu, iar click-ul
 * duce direct într-o galerie, „organizată frumos".
 *
 * Organizarea frumoasă e cea pe care o știe deja site-ul: aceeași galerie pe
 * spații de pe paginile proiectelor, doar că aici fiecare „spațiu" e o CASĂ —
 * bara de deasupra listează adresele, iar banda trece dintr-o bucătărie în
 * alta. Nicio fotografie nouă și niciun catalog inventat: e o tăietură
 * transversală prin ședințele foto reale ale proiectelor.
 */

export const metadata: Metadata = {
  title: "Bucătării la comandă",
  description:
    "Bucătării la comandă realizate de MOBO în Chișinău — fotografii din casele clienților, nu randări. Proiect 3D detaliat, materiale Egger, AGT și Fundermax, feronerie Blum și Hettich, 5 ani garanție.",
  alternates: { canonical: "/bucatarii" },
  openGraph: { images: [{ url: coverUrl(KITCHENS_GALLERY[0].photos[0].src) }] },
};

export default function BucatariiPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Bucătării la comandă"
          title="Piesa centrală a fiecărei case."
          intro="Bucătăriile din proiectele noastre recente, fotografiate în casele clienților — nu randări. Galeria trece dintr-o casă în alta: fiecare etichetă e o adresă din Chișinău, fiecare bucătărie e proiectată în jurul modului în care gătești."
        />

        <section
          aria-label="Galeria bucătăriilor MOBO"
          className="relative bg-bone-50 py-12 text-fg-invert sm:py-14 lg:py-16"
        >
          <Reveal from="none">
            <ProjectGallery title="Bucătării la comandă" spaces={KITCHENS_GALLERY} />
          </Reveal>

          {/* ------------------------------------------------ materiale + CTA */}
          <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12">
            <div className="mt-14 grid gap-10 border-t border-ink-850/15 pt-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-6">
                <h2 className="text-h2 text-balance max-w-[22ch]">
                  Aceleași materiale și mecanisme, disponibile pentru bucătăria ta.
                </h2>
                <p className="text-pretty mt-5 max-w-[52ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                  Lucrăm cu {PARTNERS.map((p) => p.name).join(", ")} — trei categorii de
                  materiale la alegere, feronerie cu soft-close și 5 ani garanție pentru tot ce
                  montăm. Fiecare bucătărie de mai sus a început cu un proiect 3D aprobat de
                  client.
                </p>
              </Reveal>
              <Reveal
                index={1}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:col-start-8 lg:self-end lg:justify-self-end"
              >
                <Button href="/#contact" size="lg" withArrow>
                  Vreau o bucătărie ca acestea
                </Button>
                <a
                  href={SITE.calculator}
                  className="text-[0.9375rem] font-medium underline decoration-ink-850/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  Calculator online
                </a>
              </Reveal>
            </div>

            {/* Fiecare bucătărie face parte dintr-o casă întreagă — drumul
                înapoi spre proiecte rămâne la un pas. */}
            <Reveal className="mt-14 border-t border-ink-850/15 pt-7">
              <Link
                href={PROJECTS_INDEX_HREF}
                className="group inline-flex items-baseline gap-2 text-[0.9375rem] font-medium transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
              >
                Vezi casele întregi, proiect cu proiect
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 ease-out-strong hover-fine:group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
