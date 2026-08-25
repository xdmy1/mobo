import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LegalArticle from "@/components/sections/LegalArticle";
import Footer from "@/components/sections/Footer";
import { COMPANY, SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description:
    "Cum colectează, folosește și protejează MOBO Kitchens & Home datele tale personale: ce date cerem, de ce, cât le păstrăm și ce drepturi ai.",
  alternates: { canonical: "/politica-de-confidentialitate" },
  robots: { index: false },
};

export default function ConfidentialitatePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Legal"
          title="Politica de confidențialitate."
          intro="Îți cerem doar datele de care avem nevoie ca să te contactăm despre proiectul tău — și îți spunem aici, fără limbaj de lemn, ce facem cu ele."
        />
        <LegalArticle updated="25 august 2026">
          <h2>1. Operatorul de date</h2>
          <p>
            Datele tale sunt prelucrate de <strong>{COMPANY.legalName}</strong>, IDNO{" "}
            {COMPANY.idno}, {SITE.address}, Republica Moldova („MOBO", „noi"). Pentru orice
            întrebare legată de date: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> sau{" "}
            <a href={SITE.phoneHref}>{SITE.phone}</a>.
          </p>

          <h2>2. Ce date colectăm</h2>
          <ul>
            <li>
              <strong>Prin formularul de contact:</strong> nume, telefon, opțional email,
              încăperea pe care vrei să o mobilezi, bugetul estimativ și detaliile pe care alegi
              să ni le scrii.
            </li>
            <li>
              <strong>Când ne suni sau ne scrii pe rețelele sociale:</strong> datele pe care ni
              le comunici în conversație.
            </li>
            <li>
              <strong>Date tehnice minime</strong> necesare funcționării și securității
              site-ului (de exemplu jurnalele serverului).
            </li>
          </ul>

          <h2>3. De ce le folosim</h2>
          <ul>
            <li>
              ca să răspundem solicitării tale și să programăm consultația și măsurătorile —
              pe baza consimțământului tău și a demersurilor precontractuale;
            </li>
            <li>ca să executăm contractul, dacă alegi să lucrăm împreună;</li>
            <li>ca să ne îndeplinim obligațiile legale (contabile, fiscale, de garanție).</li>
          </ul>
          <p>
            Nu folosim datele tale pentru marketing fără acordul tău separat și nu le vindem
            nimănui.
          </p>

          <h2>4. Cui le transmitem</h2>
          <p>
            Datele din formular ajung în sistemul nostru de gestionare a solicitărilor și la
            furnizorii tehnici care găzduiesc site-ul — doar în măsura necesară funcționării.
            Partenerului de finanțare (Microinvest) îi transmiți datele direct, dacă alegi plata
            în rate.
          </p>

          <h2>5. Cât le păstrăm</h2>
          <p>
            Solicitările care nu devin contract le păstrăm cel mult atât cât e necesar ca să
            revenim la discuție dacă ne-o ceri. Datele din contracte le păstrăm pe durata
            contractului, a garanției de 5 ani și a termenelor legale de arhivare.
          </p>

          <h2>6. Drepturile tale</h2>
          <p>
            Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate, opoziție
            și dreptul de a-ți retrage oricând consimțământul. Le explicăm pe toate, împreună cu
            modul de exercitare, în pagina <a href="/gdpr">GDPR — drepturile tale</a>.
          </p>

          <h2>7. Securitatea</h2>
          <p>
            Folosim măsuri tehnice și organizatorice rezonabile pentru a proteja datele împotriva
            accesului neautorizat, pierderii sau modificării. Accesul la datele clienților este
            limitat la persoanele care au nevoie de el ca să-ți răspundă.
          </p>

          <h2>8. Cookie-uri</h2>
          <p>
            Site-ul folosește doar cookie-uri și tehnologii strict necesare funcționării. Dacă
            vom introduce instrumente de analiză sau marketing, această politică va fi
            actualizată înainte, iar acolo unde legea o cere îți vom cere acordul.
          </p>

          <h2>9. Plângeri</h2>
          <p>
            Dacă ceva nu ți se pare în regulă, scrie-ne întâi nouă. Ai și dreptul să depui o
            plângere la Centrul Național pentru Protecția Datelor cu Caracter Personal al
            Republicii Moldova (
            <a href="https://www.datepersonale.md" target="_blank" rel="noopener noreferrer">
              datepersonale.md
            </a>
            ).
          </p>
        </LegalArticle>
      </main>
      <Footer />
    </>
  );
}
