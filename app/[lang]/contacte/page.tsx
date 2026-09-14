import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LeadForm from "@/components/sections/LeadForm";
import Footer from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { COMPANY, SITE, SOCIALS } from "@/lib/data";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t("meta.contacte.title"),
    description: t("meta.contacte.description", {
      address: t("site.address"),
      phone: SITE.phone,
      email: SITE.email,
    }),
    alternates: alternatesFor("/contacte", lang),
  };
}

/**
 * Pagina de contact. Formularul e aceeași secțiune LeadForm de pe homepage —
 * un singur formular, un singur traseu spre CRM — iar deasupra lui stau doar
 * lucrurile pe care homepage-ul nu le spune: cum ajungi la showroom și cine e
 * entitatea juridică din spatele brandului.
 */
export default async function ContactePage() {
  const { t } = await getI18n();

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow={t("page.contacte.eyebrow")}
          title={t("page.contacte.title")}
          intro={t("page.contacte.intro")}
        />

        {/* -------------------------------------------------- cum ne găsești */}
        <section aria-labelledby="gasesti-titlu" className="relative bg-bone-50 text-fg-invert">
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <p className="text-eyebrow text-fg-invert-dim">{t("contacte.findUs")}</p>
                <h2 id="gasesti-titlu" className="text-h2 text-balance mt-5 max-w-[16ch]">
                  {t("site.address")}
                </h2>
                <a
                  href={COMPANY.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-6 inline-flex items-baseline gap-2 text-[0.9375rem] font-medium transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  {t("contacte.openMaps")}
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
                    <dt className="text-[0.8125rem] text-fg-invert-dim">{t("contacte.phone")}</dt>
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
                    <dt className="text-[0.8125rem] text-fg-invert-dim">{t("contacte.email")}</dt>
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
                    <dt className="text-[0.8125rem] text-fg-invert-dim">{t("contacte.social")}</dt>
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
