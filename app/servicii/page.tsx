import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Footer from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { MATERIAL_TIERS, PARTNERS, PROCESS, SERVICE_DETAILS, SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "Servicii",
  description:
    "Cele 9 etape MOBO, de la consultație la garanție: măsurare la fața locului, proiect 3D, producție în atelier propriu, montaj și 5 ani garanție. Trei categorii de materiale.",
  alternates: { canonical: "/servicii" },
};

/**
 * Pagina de servicii — versiunea desfășurată a benzii „Servicii" de pe
 * homepage: aceleași 9 etape reale, dar cu paragraful întreg al fiecăreia
 * (SERVICE_DETAILS), plus cele trei trepte de materiale și partenerii.
 */
export default function ServiciiPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Servicii"
          title="Serviciile și etapele pentru mobilierul pe placul tău."
          intro="De la prima discuție până la ultima reglare de balama, totul se întâmplă într-un singur loc: consultanții, designerii, atelierul și montatorii MOBO. Nouă etape, un singur responsabil."
        />

        {/* ------------------------------------------------------ cele 9 etape */}
        <section aria-label="Etapele unui proiect" className="relative bg-bone-50 text-fg-invert">
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <ol className="grid list-none gap-x-10 gap-y-12 sm:grid-cols-2 lg:gap-y-14">
              {PROCESS.map((step, i) => (
                <Reveal key={step.n} as="li" index={i % 2} className="border-t border-ink-850/15 pt-5">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="font-mono text-xs tracking-[0.12em] text-lime-on-light">
                        {step.n}
                      </p>
                      <h2 className="text-h3 mt-2">{step.title}</h2>
                    </div>
                    <Image
                      src={step.icon}
                      alt=""
                      aria-hidden="true"
                      width={40}
                      height={40}
                      className="size-9 shrink-0 opacity-80"
                    />
                  </div>
                  <p className="text-pretty mt-3 max-w-[56ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                    {SERVICE_DETAILS[i] ?? step.description}
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* -------------------------------------------- materiale și parteneri */}
        <section aria-labelledby="materiale-titlu" className="grain relative bg-ink-900">
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <Reveal>
              <p className="text-eyebrow text-fg-dim">Materiale</p>
              <h2 id="materiale-titlu" className="text-h2 text-balance mt-5 max-w-[22ch] text-fg">
                Trei categorii de materiale, la alegere: Standard, Optim &amp; Premium.
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {MATERIAL_TIERS.map((tier, i) => (
                <Reveal
                  key={tier.name}
                  index={i}
                  className="rounded-card border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="text-h3 text-fg">{tier.name}</h3>
                  <p className="text-pretty mt-3 text-[0.9375rem] leading-[1.7] text-fg-dim">
                    {tier.blurb}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Partenerii — o linie de credite, nu un carusel de logo-uri. */}
            <Reveal className="mt-12 border-t border-white/8 pt-7">
              <p className="text-[0.8125rem] text-fg-faint">Lucrăm cu</p>
              <ul className="mt-3 flex list-none flex-wrap gap-x-8 gap-y-3">
                {PARTNERS.map((partner) => (
                  <li key={partner.name} className="flex items-baseline gap-2">
                    <span className="text-[0.9375rem] font-medium text-fg">{partner.name}</span>
                    <span className="text-[0.8125rem] text-fg-faint">
                      {partner.origin} · {partner.role}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* --------------------------------------------------------------- CTA */}
        <section aria-label="Solicită un calcul" className="relative bg-bone-100 text-fg-invert">
          <div className="mx-auto flex w-full max-w-[88rem] flex-col items-start gap-7 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-12">
            <Reveal>
              {/* Fără „proiect 3D cadou" — clarificare de client: 3D-ul se
                  primește după contractare. Gratuită e consultația. */}
              <h2 className="text-h2 text-balance max-w-[20ch]">
                Începe cu o consultație gratuită și un calcul estimativ.
              </h2>
            </Reveal>
            <Reveal index={1}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href="/#contact" size="lg" withArrow>
                  Solicit calcul
                </Button>
                <a
                  href={SITE.calculator}
                  className="text-[0.9375rem] font-medium underline decoration-ink-850/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  Calculator online
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
