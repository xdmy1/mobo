import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LegalArticle from "@/components/sections/LegalArticle";
import Footer from "@/components/sections/Footer";
import { CONSUMER_INFO, SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "Info clienți",
  description:
    "Informații pentru clienții MOBO: garanție, plată în rate, protecția consumatorilor și datele autorității competente din Republica Moldova.",
  alternates: { canonical: "/info-clienti" },
};

export default function InfoClientiPage() {
  const { authority } = CONSUMER_INFO;

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Info clienți"
          title="Drepturile tale, negru pe alb."
          intro={CONSUMER_INFO.intro}
        />
        <LegalArticle updated="25 august 2026" reviewNote={false}>
          <h2>Util de știut înainte și după comandă</h2>
          <ul>
            <li>
              Toate produsele au <strong>5 ani garanție</strong>, cu deservire la un singur apel
              și posibilitate de prelungire.
            </li>
            <li>Plata poate fi eșalonată în 10 rate, prin intermediul Microinvest.</li>
            <li>Alegi dintre trei categorii de materiale: Standard, Optim &amp; Premium.</li>
            <li>Mobilierul se predă doar după verificarea lui împreună cu tine, la montaj.</li>
          </ul>

          <h2>Sesizări și reclamații</h2>
          <p>
            Pentru orice sesizare sau reclamație referitoare la produsele și serviciile noastre,
            contactează-ne mai întâi direct: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> sau{" "}
            <a href={SITE.phoneHref}>{SITE.phone}</a>. Răspundem în aceeași zi lucrătoare.
          </p>

          <h2>Autoritatea națională competentă</h2>
          <p>
            În conformitate cu legislația Republicii Moldova, consumatorii au dreptul de a fi
            informați și protejați. Autoritatea competentă este:
          </p>
          <ul>
            <li>
              <strong>{authority.name}</strong>
            </li>
            <li>{authority.address}</li>
            <li>Telefon: {authority.phones.join(" · ")}</li>
            <li>
              <a href={authority.website} target="_blank" rel="noopener noreferrer">
                {authority.websiteLabel}
              </a>
            </li>
          </ul>
        </LegalArticle>
      </main>
      <Footer />
    </>
  );
}
