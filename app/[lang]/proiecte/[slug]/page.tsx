import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import ProjectGallery from "@/components/ui/ProjectGallery";
import { coverUrl, PARTNERS, PROJECTS, SITE, type SpaceKey } from "@/lib/data";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { alternatesFor } from "@/lib/i18n/metadata";
import { pluralKey } from "@/lib/i18n/plural";
import { getI18n } from "@/lib/i18n/server";

/** Cheile de dicționar ale unui proiect, derivate din slug. */
const titleKey = (slug: string) => `project.${slug}.title` as TranslationKey;
const blurbKey = (slug: string) => `project.${slug}.blurb` as TranslationKey;
const spaceKey = (key: SpaceKey) => `space.${key}` as TranslationKey;

/**
 * Pagina unui proiect — o adresă, toată casa.
 *
 * Modelul e referința D3 Buro (titlu + specificații + carusel), tradus în
 * limbajul nostru: antet întunecat cu adresa și faptele reale ale procesului,
 * apoi filmstrip-ul cu selecția ședinței foto. Fără specificații inventate:
 * mobo.md nu publică materialele per proiect, așa că pagina spune doar ce e
 * adevărat — procesul, partenerii de materiale și numărul real de cadre.
 */

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  const { lang, t } = await getI18n();
  return {
    title: t("meta.proiect.title", { title: t(titleKey(slug)) }),
    description: t("meta.proiect.description", {
      blurb: t(blurbKey(slug)),
      count: project.photoCount,
    }),
    alternates: alternatesFor(`/proiecte/${project.slug}`, lang),
    openGraph: { images: [{ url: coverUrl(project.cover) }] },
  };
}

export default async function ProiectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = PROJECTS[index];
  /* Circular: ultimul proiect trimite la primul, ca răsfoirea să nu se înfunde. */
  const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  const { lang, t, href } = await getI18n();
  const title = t(titleKey(project.slug));

  const facts = [
    {
      label: t("proiect.fact.photos"),
      /* Numeralul se declină diferit în cele două limbi — Intl.PluralRules
         alege forma, nu un prag scris de mână. Vezi lib/i18n/plural.ts. */
      value: t(pluralKey("proiect.photos", project.photoCount, lang), {
        count: project.photoCount,
      }),
    },
    { label: t("proiect.fact.measuring"), value: t("proiect.fact.measuringValue") },
    { label: t("proiect.fact.making"), value: t("proiect.fact.makingValue") },
    { label: t("proiect.fact.warranty"), value: t("proiect.fact.warrantyValue") },
  ];

  return (
    <>
      <Nav />
      <main id="main">
        {/* ------------------------------------------------------------ antet */}
        <section aria-labelledby="proiect-titlu" className="grain relative bg-ink-900">
          <div className="mx-auto w-full max-w-[88rem] px-5 pb-12 pt-36 sm:px-8 sm:pb-14 sm:pt-40 lg:px-12 lg:pt-44">
            <Reveal from="none">
              <p className="text-eyebrow text-fg-dim">{t("proiect.eyebrow")}</p>
            </Reveal>
            <h1 id="proiect-titlu" className="text-display text-balance mt-5 max-w-[16ch]">
              <RevealText text={title} delay={0.08} />
            </h1>
            <Reveal index={2}>
              <p className="text-body text-pretty mt-6 max-w-[52ch] text-fg-dim">
                {t("proiect.intro", { blurb: t(blurbKey(project.slug)) })}
              </p>
            </Reveal>

            <Reveal index={3}>
              <dl className="mt-10 grid gap-x-10 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex flex-col gap-1">
                    <dt className="text-[0.8125rem] text-fg-faint">{fact.label}</dt>
                    <dd className="text-[0.9375rem] font-medium text-fg">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------------- galeria */}
        <section aria-label={t("proiect.galleryAria", { title })} className="relative bg-bone-50 py-12 text-fg-invert sm:py-14 lg:py-16">
          <Reveal from="none">
            <ProjectGallery
              title={title}
              spaces={project.spaces.map((space) => ({
                label: t(spaceKey(space.key)),
                photos: space.photos,
              }))}
            />
          </Reveal>

          {/* ------------------------------------------------ materiale + CTA */}
          <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12">
            <div className="mt-14 grid gap-10 border-t border-ink-850/15 pt-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-6">
                <h2 className="text-h2 text-balance max-w-[22ch]">
                  {t("proiect.materials.title")}
                </h2>
                <p className="text-pretty mt-5 max-w-[52ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                  {t("proiect.materials.body", {
                    partners: PARTNERS.map((p) => p.name).join(", "),
                  })}
                </p>
              </Reveal>
              <Reveal index={1} className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:col-start-8 lg:self-end lg:justify-self-end">
                <Button href={`${href("/")}#contact`} size="lg" withArrow>
                  {t("proiect.cta")}
                </Button>
                <a
                  href={href(SITE.calculator)}
                  className="text-[0.9375rem] font-medium underline decoration-ink-850/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  {t("proiect.calculator")}
                </a>
              </Reveal>
            </div>

            {/* ---------------------------------------------------- răsfoire */}
            <Reveal className="mt-14 border-t border-ink-850/15 pt-7">
              <nav
                aria-label={t("proiect.browseAria")}
                className="flex flex-col justify-between gap-4 sm:flex-row sm:items-baseline"
              >
                <Link
                  href={href(prev.href)}
                  className="group inline-flex items-baseline gap-2 text-[0.9375rem] font-medium transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out-strong hover-fine:group-hover:-translate-x-1"
                  >
                    ←
                  </span>
                  {t(titleKey(prev.slug))}
                </Link>
                <Link
                  href={href(next.href)}
                  className="group inline-flex items-baseline gap-2 text-right text-[0.9375rem] font-medium transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  {t(titleKey(next.slug))}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out-strong hover-fine:group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </nav>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
