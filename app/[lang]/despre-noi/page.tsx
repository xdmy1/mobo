import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Timeline from "@/components/sections/Timeline";
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ABOUT, ABOUT_PAGE, ADVANTAGES, STATS } from "@/lib/data";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t("meta.despre.title"),
    description: t("meta.despre.description"),
    alternates: alternatesFor("/despre-noi", lang),
  };
}

export default async function DespreNoiPage() {
  const { t, href } = await getI18n();

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow={t("page.despre.eyebrow")}
          title={t("aboutPage.headline")}
          intro={t("aboutPage.story")}
        />

        {/* Istoria — cerință de client (referința parke.md): drumul din 2005
            până azi. Reperele placeholder se înlocuiesc când sosește istoria
            reală; vezi HISTORY în lib/data.ts. */}
        <Timeline />

        {/* ------------------------------------------------------- ce oferim */}
        <section aria-labelledby="oferim-titlu" className="relative bg-bone-50 text-fg-invert">
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-6">
                <Reveal>
                  <p className="text-eyebrow text-fg-invert-dim">{t("despre.oferim.eyebrow")}</p>
                  <h2 id="oferim-titlu" className="text-h2 text-balance mt-5 max-w-[20ch]">
                    {t("despre.oferim.title")}
                  </h2>
                </Reveal>
                <Reveal index={1}>
                  <ul className="mt-8 list-none border-t border-ink-850/15">
                    {ABOUT_PAGE.kitchens.map((_, i) => (
                      <li
                        key={i}
                        className="flex items-baseline gap-3 border-b border-ink-850/15 py-3.5 text-[0.9375rem] leading-[1.6]"
                      >
                        <span aria-hidden="true" className="text-lime-on-light">
                          —
                        </span>
                        {t(`aboutPage.kitchen.${i}` as TranslationKey)}
                      </li>
                    ))}
                  </ul>
                  <p className="text-pretty mt-6 max-w-[56ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                    {t("aboutPage.beyondKitchens")}
                  </p>
                </Reveal>
              </div>

              <Reveal index={2} className="lg:col-span-5 lg:col-start-8">
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-bone-200">
                    <Image
                      src={ABOUT.image}
                      alt={t("despre.image.alt")}
                      fill
                      sizes="(min-width: 1024px) 40vw, 92vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-[0.8125rem] text-fg-invert-dim">
                    {t("despre.image.caption")}
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- echipa */}
        <section aria-labelledby="echipa-titlu" className="grain relative bg-ink-900">
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <Reveal>
              <p className="text-eyebrow text-fg-dim">{t("despre.echipa.eyebrow")}</p>
              <h2 id="echipa-titlu" className="text-h2 text-balance mt-5 max-w-[22ch] text-fg">
                {t("despre.echipa.title")}
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {ABOUT_PAGE.team.map((member, i) => (
                <Reveal
                  key={member.role}
                  index={i}
                  className="rounded-card border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="text-h3 text-fg">{t(`aboutPage.team.${i}.role` as TranslationKey)}</h3>
                  <p className="text-pretty mt-3 text-[0.9375rem] leading-[1.7] text-fg-dim">
                    {t(`aboutPage.team.${i}.blurb` as TranslationKey)}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* ---------------------------------------------------- misiunea */}
            <Reveal className="mt-14 border-t border-white/8 pt-8">
              <blockquote className="text-h2 text-balance max-w-[30ch] text-fg">
                {t("despre.mission")}
              </blockquote>
            </Reveal>

            {/* ------------------------------------------------------- cifre */}
            <Reveal className="mt-12">
              <dl className="grid gap-8 border-t border-white/8 pt-8 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <dt className="order-last text-[0.8125rem] text-fg-dim">
                      {t(`stat.${i}.label` as TranslationKey)}
                    </dt>
                    <dd className="text-display text-fg">
                      {stat.value}
                      {t(`stat.${i}.suffix` as TranslationKey)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* --------------------------------------------------------- avantaje */}
        {/* id-ul e ținta linkului „Oferte" din footer. */}
        <section id="oferte" aria-labelledby="oferte-titlu" className="relative bg-bone-100 text-fg-invert">
          <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <p className="text-eyebrow text-fg-invert-dim">{t("despre.oferte.eyebrow")}</p>
                {/* Fostul „proiect 3D — cadou" a picat: clarificare de client,
                    proiectele 3D nu sunt gratuite (se primesc după contractare).
                    Gratuite rămân consultația și calculul estimativ. */}
                <h2 id="oferte-titlu" className="text-h2 text-balance mt-5 max-w-[18ch]">
                  {t("despre.oferte.title")}
                </h2>
                <div className="mt-8">
                  <Button href={`${href("/")}#contact`} size="lg" withArrow>
                    {t("despre.oferte.cta")}
                  </Button>
                </div>
              </Reveal>
              <Reveal index={1} className="lg:col-span-6 lg:col-start-7">
                <ul className="list-none border-t border-ink-850/15">
                  {ADVANTAGES.map((_, i) => (
                    <li
                      key={i}
                      className="flex items-baseline gap-3 border-b border-ink-850/15 py-3.5 text-[0.9375rem] leading-[1.6]"
                    >
                      <span aria-hidden="true" className="text-lime-on-light">
                        —
                      </span>
                      {t(`advantage.${i}` as TranslationKey)}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Recenziile reale — aceeași bandă ca pe homepage; pe pagina „Despre
            noi" ele sunt argumentul final, exact ca pe mobo.md. */}
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
