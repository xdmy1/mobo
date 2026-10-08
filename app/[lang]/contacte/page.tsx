import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LeadForm from "@/components/sections/LeadForm";
import Footer from "@/components/sections/Footer";
import { SocialGlyph } from "@/components/ui/BrandIcon";
import { Reveal } from "@/components/ui/Reveal";
import { COMPANY, SITE, SOCIALS } from "@/lib/data";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

/* Cadru real dintr-o casă MOBO, folosit ambiental — masa pusă, scaunele trase,
   florile: pagina care te invită la showroom se deschide pe o imagine de
   ospitalitate, nu pe un tabel. Legenda spune din ce proiect vine. */
import fotoContact from "@/assets/proiecte/str-constantin-stere/bucatarie-02.jpg";

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

/* Aceeași gramatică de rând ca în restul site-ului: etichetă-caption sus,
   valoarea mare sub ea, fără hairline pe fiecare rând. */
const LABEL_CLASS = "text-eyebrow text-fg-invert-dim";
const LINK_CLASS =
  "transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light";

/**
 * Pagina de contact. Formularul e aceeași secțiune LeadForm de pe homepage —
 * un singur formular, un singur traseu spre CRM — iar deasupra lui stau doar
 * lucrurile pe care homepage-ul nu le spune: cum ajungi la showroom și cine e
 * entitatea juridică din spatele brandului.
 *
 * A doua formă a benzii „Ne găsești aici" (2026-10-08, cerere de client: „la
 * contacte să schimbăm vizual, iar la rețele să punem iconițele lor"). Prima
 * era un tabel cu trei rânduri lângă adresă — corect, dar gol. Acum: o
 * fotografie reală pe o parte, iar pe cealaltă adresa, telefonul ca titlu,
 * emailul și rețelele ca discuri cu marca fiecăreia (aceleași glifuri Simple
 * Icons ca în footer).
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
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
              {/* ------------------------------------------------ fotografia */}
              {/* Pe telefon datele vin primele — cineva care deschide pagina
                  de contact de pe stradă caută numărul, nu poza. */}
              <Reveal from="left" className="order-last lg:order-none lg:col-span-5">
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-bone-200 lg:aspect-[4/5]">
                    <Image
                      src={fotoContact}
                      alt={t("contacte.photoAlt")}
                      fill
                      sizes="(min-width: 1024px) 38vw, 92vw"
                      placeholder="blur"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-[0.8125rem] text-fg-invert-dim">
                    {t("sections.process.credit", {
                      project: t("project.str-constantin-stere.title"),
                    })}
                  </figcaption>
                </figure>
              </Reveal>

              {/* ----------------------------------------------------- datele */}
              <div className="lg:col-span-6 lg:col-start-7">
                <Reveal>
                  <p className={LABEL_CLASS}>{t("contacte.findUs")}</p>
                  <h2 id="gasesti-titlu" className="text-h2 text-balance mt-4 max-w-[16ch]">
                    {t("site.address")}
                  </h2>
                  <a
                    href={COMPANY.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group mt-5 inline-flex items-baseline gap-2 text-[0.9375rem] font-medium ${LINK_CLASS}`}
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

                {/* Telefonul e lucrul pe care îl caută oricine ajunge aici —
                    primește mărimea unui titlu, nu a unui rând de tabel. */}
                <Reveal index={1} className="mt-10 border-t border-ink-850/15 pt-8 sm:mt-12">
                  <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
                    <div>
                      <p className={LABEL_CLASS}>{t("contacte.phone")}</p>
                      <a
                        href={SITE.phoneHref}
                        className={`text-h2 mt-3 inline-block tabular-nums ${LINK_CLASS}`}
                      >
                        {SITE.phone}
                      </a>
                    </div>
                    <div>
                      <p className={LABEL_CLASS}>{t("contacte.email")}</p>
                      <a
                        href={`mailto:${SITE.email}`}
                        className={`text-h2 mt-3 inline-block ${LINK_CLASS}`}
                      >
                        {SITE.email}
                      </a>
                    </div>
                  </div>
                </Reveal>

                {/* Rețelele — marca fiecăreia într-un disc, numele doar pentru
                    cititorul de ecran și la hover (title). */}
                <Reveal index={2} className="mt-10 border-t border-ink-850/15 pt-8">
                  <p className={LABEL_CLASS}>{t("contacte.social")}</p>
                  <ul className="mt-4 flex list-none flex-wrap gap-2.5">
                    {SOCIALS.map((social) => (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={social.label}
                          className="flex size-12 items-center justify-center rounded-full border border-ink-850/15 text-fg-invert transition-[background-color,border-color,color,transform] duration-200 ease-out-strong active:scale-[0.96] hover-fine:hover:border-ink-850 hover-fine:hover:bg-ink-850 hover-fine:hover:text-fg"
                        >
                          <SocialGlyph label={social.label} className="size-[18px]" />
                          <span className="sr-only">{social.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal index={3}>
                  <p className="mt-10 text-[0.8125rem] leading-relaxed text-fg-invert-dim">
                    {COMPANY.legalName} · IDNO {COMPANY.idno}
                  </p>
                </Reveal>
              </div>
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
