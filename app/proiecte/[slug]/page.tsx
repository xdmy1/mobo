import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import ProjectGallery from "@/components/ui/ProjectGallery";
import { PARTNERS, PROJECTS, SITE } from "@/lib/data";

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
  return {
    title: `Proiect ${project.title}`,
    description: `${project.blurb} Mobilier la comandă pentru toată locuința, realizat de MOBO Kitchens & Home în Chișinău — ${project.photoCount} fotografii din proiectul final.`,
    alternates: { canonical: `/proiecte/${project.slug}` },
    openGraph: { images: [{ url: project.cover }] },
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

  const facts = [
    { label: "Fotografii în proiect", value: `${project.photoCount} de cadre` },
    { label: "Măsurare", value: "La fața locului" },
    { label: "Fabricare", value: "Atelierul MOBO, Chișinău" },
    { label: "Garanție", value: "5 ani, cu deservire" },
  ];

  return (
    <>
      <Nav />
      <main id="main">
        {/* ------------------------------------------------------------ antet */}
        <section aria-labelledby="proiect-titlu" className="grain relative bg-ink-900">
          <div className="mx-auto w-full max-w-[88rem] px-5 pb-12 pt-36 sm:px-8 sm:pb-14 sm:pt-40 lg:px-12 lg:pt-44">
            <Reveal from="none">
              <p className="text-eyebrow text-fg-dim">Proiect realizat · Chișinău</p>
            </Reveal>
            <h1 id="proiect-titlu" className="text-display text-balance mt-5 max-w-[16ch]">
              <RevealText text={project.title} delay={0.08} />
            </h1>
            <Reveal index={2}>
              <p className="text-body text-pretty mt-6 max-w-[52ch] text-fg-dim">
                {project.blurb} Tot mobilierul locuinței a trecut prin cele nouă etape MOBO — de
                la măsurători și proiectul 3D aprobat, până la montaj și predarea împreună.
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
        <section aria-label={`Galeria proiectului ${project.title}`} className="relative bg-bone-50 py-12 text-fg-invert sm:py-14 lg:py-16">
          <Reveal from="none">
            <ProjectGallery title={project.title} images={project.gallery} />
          </Reveal>

          {/* ------------------------------------------------ materiale + CTA */}
          <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12">
            <div className="mt-14 grid gap-10 border-t border-ink-850/15 pt-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-6">
                <h2 className="text-h2 text-balance max-w-[22ch]">
                  Aceleași materiale și mecanisme, disponibile pentru casa ta.
                </h2>
                <p className="text-pretty mt-5 max-w-[52ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                  Lucrăm cu {PARTNERS.map((p) => p.name).join(", ")} — trei categorii de
                  materiale la alegere, feronerie cu soft-close și 5 ani garanție pentru tot ce
                  montăm.
                </p>
              </Reveal>
              <Reveal index={1} className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:col-start-8 lg:self-end lg:justify-self-end">
                <Button href="/#contact" size="lg" withArrow>
                  Vreau un proiect ca acesta
                </Button>
                <a
                  href={SITE.calculator}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.9375rem] font-medium underline decoration-ink-850/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  Calculator online
                </a>
              </Reveal>
            </div>

            {/* ---------------------------------------------------- răsfoire */}
            <Reveal className="mt-14 border-t border-ink-850/15 pt-7">
              <nav
                aria-label="Alte proiecte"
                className="flex flex-col justify-between gap-4 sm:flex-row sm:items-baseline"
              >
                <Link
                  href={prev.href}
                  className="group inline-flex items-baseline gap-2 text-[0.9375rem] font-medium transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out-strong hover-fine:group-hover:-translate-x-1"
                  >
                    ←
                  </span>
                  {prev.title}
                </Link>
                <Link
                  href={next.href}
                  className="group inline-flex items-baseline gap-2 text-right text-[0.9375rem] font-medium transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  {next.title}
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
