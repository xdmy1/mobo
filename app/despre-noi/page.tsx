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

export const metadata: Metadata = {
  title: "Despre noi",
  description:
    "MOBO Kitchens & Home: brand fondat în 2022, lansat în 2023, cu o echipă cu 39 de ani de experiență cumulativă în mobilier la comandă. Designeri, manageri de calitate și montatori calificați.",
  alternates: { canonical: "/despre-noi" },
};

export default function DespreNoiPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Despre noi"
          title={ABOUT_PAGE.headline}
          intro={ABOUT_PAGE.story}
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
                  <p className="text-eyebrow text-fg-invert-dim">Ce oferim</p>
                  <h2 id="oferim-titlu" className="text-h2 text-balance mt-5 max-w-[20ch]">
                    Bucătării premium — și tot restul casei.
                  </h2>
                </Reveal>
                <Reveal index={1}>
                  <ul className="mt-8 list-none border-t border-ink-850/15">
                    {ABOUT_PAGE.kitchens.map((item) => (
                      <li
                        key={item}
                        className="flex items-baseline gap-3 border-b border-ink-850/15 py-3.5 text-[0.9375rem] leading-[1.6]"
                      >
                        <span aria-hidden="true" className="text-lime-on-light">
                          —
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-pretty mt-6 max-w-[56ch] text-[0.9375rem] leading-[1.7] text-fg-invert-dim">
                    {ABOUT_PAGE.beyondKitchens}
                  </p>
                </Reveal>
              </div>

              <Reveal index={2} className="lg:col-span-5 lg:col-start-8">
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-bone-200">
                    <Image
                      src={ABOUT.image}
                      alt="Proiect 3D al unei bucătării la comandă, realizat de designerii MOBO"
                      fill
                      sizes="(min-width: 1024px) 40vw, 92vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-[0.8125rem] text-fg-invert-dim">
                    Proiect 3D — așa arată propunerea înainte de producție.
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
              <p className="text-eyebrow text-fg-dim">Echipa noastră</p>
              <h2 id="echipa-titlu" className="text-h2 text-balance mt-5 max-w-[22ch] text-fg">
                Trei meserii, un singur standard de predare.
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {ABOUT_PAGE.team.map((member, i) => (
                <Reveal
                  key={member.role}
                  index={i}
                  className="rounded-card border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="text-h3 text-fg">{member.role}</h3>
                  <p className="text-pretty mt-3 text-[0.9375rem] leading-[1.7] text-fg-dim">
                    {member.blurb}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* ---------------------------------------------------- misiunea */}
            <Reveal className="mt-14 border-t border-white/8 pt-8">
              <blockquote className="text-h2 text-balance max-w-[30ch] text-fg">
                <span className="serif-accent">Misiunea noastră:</span> să creăm mobilier de
                calitate premium care transformă casele în adevărate locuințe de vis.
              </blockquote>
            </Reveal>

            {/* ------------------------------------------------------- cifre */}
            <Reveal className="mt-12">
              <dl className="grid gap-8 border-t border-white/8 pt-8 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <dt className="order-last text-[0.8125rem] text-fg-dim">{stat.label}</dt>
                    <dd className="text-display text-fg">
                      {stat.value}
                      {stat.suffix}
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
                <p className="text-eyebrow text-fg-invert-dim">Ofertele MOBO</p>
                {/* Fostul „proiect 3D — cadou" a picat: clarificare de client,
                    proiectele 3D nu sunt gratuite (se primesc după contractare).
                    Gratuite rămân consultația și calculul estimativ. */}
                <h2 id="oferte-titlu" className="text-h2 text-balance mt-5 max-w-[18ch]">
                  Consultație și calcul estimativ — gratuite.
                </h2>
                <div className="mt-8">
                  <Button href="/#contact" size="lg" withArrow>
                    Solicit calcul
                  </Button>
                </div>
              </Reveal>
              <Reveal index={1} className="lg:col-span-6 lg:col-start-7">
                <ul className="list-none border-t border-ink-850/15">
                  {ADVANTAGES.map((advantage) => (
                    <li
                      key={advantage}
                      className="flex items-baseline gap-3 border-b border-ink-850/15 py-3.5 text-[0.9375rem] leading-[1.6]"
                    >
                      <span aria-hidden="true" className="text-lime-on-light">
                        —
                      </span>
                      {advantage}
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
