import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Process from "@/components/sections/Process";
import Footer from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { MATERIAL_TIERS, PARTNERS, SITE } from "@/lib/data";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t("meta.servicii.title"),
    description: t("meta.servicii.description"),
    alternates: alternatesFor("/servicii", lang),
  };
}

/** Cheia de dicționar a unui partener, derivată din numele de brand. */
const partnerKey = (name: string, field: "origin" | "role") =>
  `partner.${name.toLowerCase().replace(/'/g, "").replace(/ /g, "-")}.${field}` as TranslationKey;

/**
 * Pagina de servicii — versiunea desfășurată a benzii „Cum lucrăm" de pe
 * homepage: aceeași formă (fotografii reale, trei capitole, etapele ca rânduri
 * liniștite), dar cu paragraful întreg al fiecărei etape (`service.NN.detail`),
 * plus cele trei trepte de materiale și partenerii.
 *
 * Grila de dinainte — două coloane de titluri cu iconițele PNG din WordPress —
 * a picat la client („nu prea îmi place cum e aici"); a arătat spre banda de
 * pe homepage: „gen ceva de gen".
 */
export default async function ServiciiPage() {
  const { t, href } = await getI18n();

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow={t("page.servicii.eyebrow")}
          title={t("page.servicii.title")}
          intro={t("page.servicii.intro")}
        />

        {/* ---------------------------------------------------- cele 9 etape */}
        {/* Banda de pe homepage, cu textul lung al fiecărei etape; bone-50 ca
            să țină ritmul paginii (antet întunecat → ivoriu → materiale pe
            grafit → CTA bone-100). */}
        <Process detailed className="bg-bone-50" />

        {/* -------------------------------------------- materiale și parteneri */}
        <section aria-labelledby="materiale-titlu" className="grain relative bg-ink-900">
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <Reveal>
              <p className="text-eyebrow text-fg-dim">{t("servicii.materials.eyebrow")}</p>
              <h2 id="materiale-titlu" className="text-h2 text-balance mt-5 max-w-[22ch] text-fg">
                {t("servicii.materials.title")}
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {MATERIAL_TIERS.map((tier, i) => (
                <Reveal
                  key={tier.name}
                  index={i}
                  className="rounded-card border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="text-h3 text-fg">
                    {t(`tier.${tier.name.toLowerCase()}.name` as TranslationKey)}
                  </h3>
                  <p className="text-pretty mt-3 text-[0.9375rem] leading-[1.7] text-fg-dim">
                    {t(`tier.${tier.name.toLowerCase()}.blurb` as TranslationKey)}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Partenerii — o linie de credite, nu un carusel de logo-uri. */}
            <Reveal className="mt-12 border-t border-white/8 pt-7">
              <p className="text-[0.8125rem] text-fg-faint">{t("servicii.partners.label")}</p>
              <ul className="mt-3 flex list-none flex-wrap gap-x-8 gap-y-3">
                {PARTNERS.map((partner) => (
                  <li key={partner.name} className="flex items-baseline gap-2">
                    <span className="text-[0.9375rem] font-medium text-fg">{partner.name}</span>
                    <span className="text-[0.8125rem] text-fg-faint">
                      {t(partnerKey(partner.name, "origin"))} ·{" "}
                      {t(partnerKey(partner.name, "role"))}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* --------------------------------------------------------------- CTA */}
        <section aria-label={t("servicii.cta.aria")} className="relative bg-bone-100 text-fg-invert">
          <div className="mx-auto flex w-full max-w-[88rem] flex-col items-start gap-7 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-12">
            <Reveal>
              {/* Fără „proiect 3D cadou" — clarificare de client: 3D-ul se
                  primește după contractare. Gratuită e consultația. */}
              <h2 className="text-h2 text-balance max-w-[20ch]">
                {t("servicii.cta.title")}
              </h2>
            </Reveal>
            <Reveal index={1}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={`${href("/")}#contact`} size="lg" withArrow>
                  {t("servicii.cta.button")}
                </Button>
                <a
                  href={href(SITE.calculator)}
                  className="text-[0.9375rem] font-medium underline decoration-ink-850/30 underline-offset-4 transition-colors duration-200 ease-out-strong hover-fine:hover:text-lime-on-light"
                >
                  {t("proiect.calculator")}
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
