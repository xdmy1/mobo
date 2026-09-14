import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Footer from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import ProjectGallery from "@/components/ui/ProjectGallery";
import { coverUrl, KITCHENS_GALLERY, PARTNERS, PROJECTS_INDEX_HREF, SITE } from "@/lib/data";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

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

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t("meta.bucatarii.title"),
    description: t("meta.bucatarii.description"),
    alternates: alternatesFor("/bucatarii", lang),
    openGraph: { images: [{ url: coverUrl(KITCHENS_GALLERY[0].photos[0].src) }] },
  };
}

export default async function BucatariiPage() {
  const { t, href } = await getI18n();

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow={t("page.bucatarii.eyebrow")}
          title={t("page.bucatarii.title")}
          intro={t("page.bucatarii.intro")}
        />

        <section
          aria-label={t("bucatarii.galleryAria")}
          className="relative bg-bone-50 py-12 text-fg-invert sm:py-14 lg:py-16"
        >
          <Reveal from="none">
            <ProjectGallery
              title={t("bucatarii.galleryTitle")}
              /* Eticheta fiecărei benzi e adresa casei din care vine bucătăria. */
              spaces={KITCHENS_GALLERY.map((kitchen) => ({
                label: t(`project.${kitchen.slug}.title` as TranslationKey),
                photos: kitchen.photos,
              }))}
            />
          </Reveal>

          {/* ------------------------------------------------ materiale + CTA */}
          <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12">
            <div className="mt-14 grid gap-10 border-t border-ink-850/15 pt-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-6">
                <h2 className="text-h2 text-balance max-w-[22ch]">
                  {t("bucatarii.materials.title")}
                </h2>
                <p className="text-pretty mt-5 max-w-[52ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                  {t("bucatarii.materials.body", {
                    partners: PARTNERS.map((p) => p.name).join(", "),
                  })}
                </p>
              </Reveal>
              <Reveal
                index={1}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:col-start-8 lg:self-end lg:justify-self-end"
              >
                <Button href={`${href("/")}#contact`} size="lg" withArrow>
                  {t("bucatarii.cta")}
                </Button>
                <a
                  href={href(SITE.calculator)}
                  className="text-[0.9375rem] font-medium underline decoration-ink-850/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  {t("proiect.calculator")}
                </a>
              </Reveal>
            </div>

            {/* Fiecare bucătărie face parte dintr-o casă întreagă — drumul
                înapoi spre proiecte rămâne la un pas. */}
            <Reveal className="mt-14 border-t border-ink-850/15 pt-7">
              <Link
                href={href(PROJECTS_INDEX_HREF)}
                className="group inline-flex items-baseline gap-2 text-[0.9375rem] font-medium transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
              >
                {t("bucatarii.backToProjects")}
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
