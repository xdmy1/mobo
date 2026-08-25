import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LegalArticle from "@/components/sections/LegalArticle";
import Footer from "@/components/sections/Footer";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "GDPR — drepturile tale",
  description:
    "Drepturile tale privind datele personale în relația cu MOBO Kitchens & Home: acces, rectificare, ștergere, restricționare, portabilitate, opoziție — și cum le exerciți.",
  alternates: { canonical: "/gdpr" },
  robots: { index: false },
};

export default function GdprPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Legal"
          title="GDPR — drepturile tale."
          intro="Datele sunt ale tale; noi doar le folosim ca să-ți răspundem. Iată exact ce poți cere oricând și cum."
        />
        <LegalArticle updated="25 august 2026">
          <h2>Cadrul legal</h2>
          <p>
            Prelucrăm datele personale în conformitate cu legislația Republicii Moldova privind
            protecția datelor cu caracter personal și, pentru vizitatorii din Uniunea Europeană,
            cu Regulamentul (UE) 2016/679 („GDPR"). Detaliile despre ce colectăm și de ce sunt în{" "}
            <a href="/politica-de-confidentialitate">Politica de confidențialitate</a>.
          </p>

          <h2>Drepturile tale</h2>
          <ul>
            <li>
              <strong>Acces</strong> — poți afla dacă și ce date despre tine prelucrăm și poți
              primi o copie a lor.
            </li>
            <li>
              <strong>Rectificare</strong> — poți cere corectarea datelor inexacte sau
              completarea celor incomplete.
            </li>
            <li>
              <strong>Ștergere („dreptul de a fi uitat")</strong> — poți cere ștergerea datelor
              atunci când nu mai sunt necesare scopului, ți-ai retras consimțământul sau
              prelucrarea este nelegală.
            </li>
            <li>
              <strong>Restricționare</strong> — poți cere ca datele doar să fie stocate, fără a
              mai fi folosite, cât timp verificăm o obiecție sau o inexactitate.
            </li>
            <li>
              <strong>Portabilitate</strong> — poți primi datele furnizate de tine într-un format
              structurat, utilizabil, și le poți transmite altui operator.
            </li>
            <li>
              <strong>Opoziție</strong> — te poți opune prelucrărilor bazate pe interes legitim
              și, oricând, oricărei prelucrări în scop de marketing direct.
            </li>
            <li>
              <strong>Retragerea consimțământului</strong> — oricând, fără a afecta legalitatea
              prelucrării de până atunci.
            </li>
          </ul>

          <h2>Cum le exerciți</h2>
          <p>
            Trimite-ne cererea la <a href={`mailto:${SITE.email}`}>{SITE.email}</a> sau sună la{" "}
            <a href={SITE.phoneHref}>{SITE.phone}</a>, menționând ce drept vrei să exerciți.
            Răspundem în cel mult <strong>30 de zile</strong>; dacă cererea e complexă, te
            anunțăm și putem prelungi termenul conform legii. Exercitarea drepturilor este
            gratuită.
          </p>

          <h2>Autoritatea de supraveghere</h2>
          <p>
            Dacă nu ești mulțumit de răspunsul nostru, te poți adresa Centrului Național pentru
            Protecția Datelor cu Caracter Personal al Republicii Moldova (
            <a href="https://www.datepersonale.md" target="_blank" rel="noopener noreferrer">
              datepersonale.md
            </a>
            ), iar pentru rezidenții UE — autorității de supraveghere din statul tău membru.
          </p>
        </LegalArticle>
      </main>
      <Footer />
    </>
  );
}
