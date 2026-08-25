import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LeadForm from "@/components/sections/LeadForm";
import Footer from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { COMPANY, SITE, SOCIALS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contacte",
  description: `Showroom MOBO Kitchens & Home: ${SITE.address}. Telefon ${SITE.phone}, ${SITE.email}. Consultație gratuită pentru mobilier la comandă.`,
  alternates: { canonical: "/contacte" },
};

/**
 * Pagina de contact. Formularul e aceeași secțiune LeadForm de pe homepage —
 * un singur formular, un singur traseu spre CRM — iar deasupra lui stau doar
 * lucrurile pe care homepage-ul nu le spune: cum ajungi la showroom și cine e
 * entitatea juridică din spatele brandului.
 */
export default function ContactePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Contacte"
          title="Showroom MOBO Kitchens & Home."
          intro="Vino să vezi materialele, decorurile și mecanismele pe viu — sau scrie-ne și programăm noi totul. Consultația este gratuită."
        />

        {/* -------------------------------------------------- cum ne găsești */}
        <section aria-labelledby="gasesti-titlu" className="relative bg-bone-50 text-fg-invert">
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <p className="text-eyebrow text-fg-invert-dim">Ne găsești aici</p>
                <h2 id="gasesti-titlu" className="text-h2 text-balance mt-5 max-w-[16ch]">
                  {SITE.address}
                </h2>
                <a
                  href={COMPANY.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-6 inline-flex items-baseline gap-2 text-[0.9375rem] font-medium transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  Deschide în Google Maps
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out-strong hover-fine:group-hover:translate-x-1"
                  >
                    →
                  </span>
                </a>
              </Reveal>

              <Reveal index={1} className="lg:col-span-6 lg:col-start-7">
                <dl className="border-t border-ink-850/15">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink-850/15 py-3.5">
                    <dt className="text-[0.8125rem] text-fg-invert-dim">Telefon</dt>
                    <dd>
                      <a
                        href={SITE.phoneHref}
                        className="text-[1.0625rem] font-medium transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                      >
                        {SITE.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink-850/15 py-3.5">
                    <dt className="text-[0.8125rem] text-fg-invert-dim">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${SITE.email}`}
                        className="text-[0.9375rem] transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                      >
                        {SITE.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink-850/15 py-3.5">
                    <dt className="text-[0.8125rem] text-fg-invert-dim">Social</dt>
                    <dd className="flex flex-wrap gap-x-4 gap-y-1">
                      {SOCIALS.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[0.9375rem] text-fg-invert-dim transition-colors duration-200 ease-out-strong hover-fine:hover:text-fg-invert"
                        >
                          {social.label}
                        </a>
                      ))}
                    </dd>
                  </div>
                </dl>
                <p className="mt-5 text-[0.8125rem] leading-relaxed text-fg-invert-dim">
                  {COMPANY.legalName} · IDNO {COMPANY.idno}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Formularul — aceeași secțiune ca pe homepage, același traseu CRM. */}
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
