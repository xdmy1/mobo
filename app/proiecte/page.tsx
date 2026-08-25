import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Projects from "@/components/sections/Projects";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Proiecte realizate",
  description:
    "Proiecte MOBO împărțite pe case: fiecare adresă din Chișinău, cu tot mobilierul locuinței — măsurat la fața locului, desenat în 3D, fabricat în atelier propriu.",
  alternates: { canonical: "/proiecte" },
};

export default function ProiectePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Proiecte realizate"
          title="O adresă, toată casa."
          intro="Împărțim proiectele pe case, nu pe categorii: fiecare adresă de mai jos înseamnă tot mobilierul unei locuințe din Chișinău — măsurat la fața locului, desenat în 3D și fabricat în atelierul nostru. Fotografiile sunt din casele clienților, nu randări."
        />
        <Projects variant="page" />
      </main>
      <Footer />
    </>
  );
}
