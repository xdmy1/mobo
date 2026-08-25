import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LegalArticle from "@/components/sections/LegalArticle";
import Footer from "@/components/sections/Footer";
import { COMPANY, SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description:
    "Termenii și condițiile de utilizare a site-ului mobo.md și de comandă a mobilierului la comandă MOBO Kitchens & Home.",
  alternates: { canonical: "/termeni-si-conditii" },
  robots: { index: false },
};

export default function TermeniPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Legal"
          title="Termeni și condiții."
          intro="Regulile după care funcționează site-ul mobo.md și relația comercială dintre tine și MOBO Kitchens & Home — pe scurt și pe înțeles."
        />
        <LegalArticle updated="25 august 2026">
          <h2>1. Cine suntem</h2>
          <p>
            Site-ul mobo.md și brandul MOBO Kitchens &amp; Home sunt operate de{" "}
            <strong>{COMPANY.legalName}</strong>, IDNO {COMPANY.idno}, cu sediul în{" "}
            {SITE.address}, Republica Moldova. Ne poți contacta la{" "}
            <a href={SITE.phoneHref}>{SITE.phone}</a> sau{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>

          <h2>2. Obiectul site-ului</h2>
          <p>
            Site-ul prezintă serviciile și proiectele MOBO și îți permite să soliciți o
            consultație și un calcul estimativ, inclusiv prin calculatorul online. Conținutul
            site-ului are caracter informativ: configurațiile, decorurile și estimările afișate
            nu constituie o ofertă fermă.
          </p>

          <h2>3. Comanda și contractarea</h2>
          <p>
            Mobilierul MOBO se execută exclusiv la comandă. Prețul final, specificațiile tehnice,
            termenele de producție, livrare și montaj se stabilesc printr-un{" "}
            <strong>contract scris</strong>, semnat după consultație, măsurători și aprobarea
            proiectului 3D. Doar contractul semnat naște obligații între părți.
          </p>

          <h2>4. Prețuri și plată</h2>
          <ul>
            <li>Prețurile se exprimă în lei moldovenești (MDL).</li>
            <li>
              Plata se poate face integral sau eșalonat, în până la 10 rate, prin intermediul
              partenerului de finanțare Microinvest, conform condițiilor acestuia.
            </li>
            <li>Modalitatea și graficul de plată se fixează în contract.</li>
          </ul>

          <h2>5. Livrare și montaj</h2>
          <p>
            Livrarea și montajul se efectuează de echipa MOBO, la termenele stabilite în
            contract. Mobilierul se predă doar după verificarea funcționării și a aspectului
            împreună cu clientul.
          </p>

          <h2>6. Garanția</h2>
          <p>
            Toate produsele beneficiază de <strong>5 ani garanție</strong>, cu deservire și
            posibilitate de prelungire, în condițiile stabilite în contract. Garanția comercială
            nu afectează drepturile pe care le ai în calitate de consumator potrivit legislației
            Republicii Moldova privind protecția consumatorilor.
          </p>

          <h2>7. Proprietate intelectuală</h2>
          <p>
            Proiectele 3D, fotografiile, textele și elementele grafice ale site-ului aparțin{" "}
            {COMPANY.legalName} sau partenerilor săi și nu pot fi reproduse în scop comercial
            fără acord scris.
          </p>

          <h2>8. Răspundere</h2>
          <p>
            Estimările generate de calculatorul online și informațiile din site au caracter
            orientativ; ne străduim să le menținem corecte și actuale, dar valorile finale sunt
            întotdeauna cele din contract. Nu răspundem pentru decizii luate exclusiv pe baza
            estimărilor orientative.
          </p>

          <h2>9. Date personale</h2>
          <p>
            Prelucrarea datelor personale este descrisă în{" "}
            <a href="/politica-de-confidentialitate">Politica de confidențialitate</a> și în
            pagina <a href="/gdpr">GDPR — drepturile tale</a>.
          </p>

          <h2>10. Legea aplicabilă și litigii</h2>
          <p>
            Acești termeni sunt guvernați de legislația Republicii Moldova. Orice neînțelegere o
            rezolvăm mai întâi amiabil; dacă nu este posibil, competența aparține instanțelor din
            Republica Moldova. Informații privind protecția consumatorilor găsești pe pagina{" "}
            <a href="/info-clienti">Info clienți</a>.
          </p>

          <h2>11. Modificări</h2>
          <p>
            Putem actualiza acești termeni; versiunea curentă, cu data ultimei actualizări, este
            publicată permanent pe această pagină.
          </p>
        </LegalArticle>
      </main>
      <Footer />
    </>
  );
}
