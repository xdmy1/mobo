import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ProjectGallery } from "@/components/ui/ProjectGallery";
import { PROJECTS, SITE } from "@/lib/data";

/**
 * Pagina unui proiect — restructurată PE PROIECT (feedback partener), după
 * modelul fișelor ciotca.md: fotografia de deschidere, FIȘA TEHNICĂ a
 * proiectului (fronturi, plăci, feronerie — perechile etichetă/valoare din
 * lib/data) și GALERIA proiectului, cu cadrele etichetate pe încăperi.
 * Limbajul vizual rămâne al MOBO: benzile bone/ink, tipografia, hairline-urile.
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
    title: project.title,
    description: `${project.description} ${project.kind} mobilat de MOBO Kitchens & Home în ${project.location}: ${project.rooms.join(", ").toLowerCase()}.`,
    alternates: { canonical: `/proiecte/${project.slug}` },
    openGraph: { images: [{ url: project.image }] },
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

  /* Fișa completă: încăperile mobilate deschid lista, apoi materialele. */
  const specs = [
    { label: "Încăperi", value: project.rooms.join(", ") },
    { label: "Locație", value: project.location },
    ...project.specs,
  ];

  return (
    <>
      <Nav />
      <main id="main">
        {/* ------------------------------------------------------ fotografia */}
        <section aria-labelledby="proiect-titlu" className="grain relative flex min-h-[62svh] items-end overflow-hidden bg-ink-900">
          <Image
            src={project.image}
            alt={`${project.title} — proiect realizat de MOBO Kitchens & Home`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Scrim direcțional, doar pe latura ancorată — gramatica hero-ului. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent"
          />
          <div className="relative z-10 mx-auto w-full max-w-[88rem] px-5 pb-10 pt-40 sm:px-8 sm:pb-12 lg:px-12">
            <Reveal from="none">
              <p className="text-eyebrow text-fg-dim">
                {project.kind} · {project.location}
              </p>
            </Reveal>
            <Reveal index={1}>
              <h1 id="proiect-titlu" className="text-display text-balance mt-4 max-w-[18ch]">
                {project.title}
              </h1>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------- descriere + fișa tehnică */}
        <section aria-label="Despre proiect" className="relative bg-bone-50 text-fg-invert">
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <Reveal className="lg:col-span-6">
                <h2 className="text-h2 text-balance max-w-[22ch]">{project.description}</h2>
                <p className="text-pretty mt-6 max-w-[52ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                  Ca orice proiect MOBO, a trecut prin toate cele nouă etape — de la consultație
                  și măsurători, prin proiectul 3D aprobat de client, până la montaj și
                  verificarea finală împreună.
                </p>
              </Reveal>

              {/* Fișa tehnică a PROIECTULUI — nu fapte generice: fronturile,
                  plăcile și feroneria acestui proiect, ca într-o fișă de
                  catalog. Datele vin din lib/data per proiect. */}
              <Reveal index={1} className="lg:col-span-5 lg:col-start-8">
                <dl className="border-t border-ink-850/15">
                  {specs.map((fact) => (
                    <div
                      key={fact.label}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink-850/15 py-3.5"
                    >
                      <dt className="text-[0.8125rem] text-fg-invert-dim">{fact.label}</dt>
                      <dd className="text-[0.9375rem] font-medium">{fact.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
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
                </div>
              </Reveal>
            </div>

            {/* ----------------------------------------------------- galeria */}
            <Reveal className="mt-16 border-t border-ink-850/15 pt-10">
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-h3">Din proiect</h2>
                <p className="text-eyebrow text-fg-invert-dim">
                  {project.gallery.length === 1
                    ? "1 cadru"
                    : `${project.gallery.length} cadre`}
                </p>
              </div>
              <ProjectGallery slides={project.gallery} title={project.title} />
            </Reveal>

            {/* ---------------------------------------------------- răsfoire */}
            <Reveal className="mt-16 border-t border-ink-850/15 pt-7">
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
