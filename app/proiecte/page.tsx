import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Projects from "@/components/sections/Projects";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Proiecte realizate",
  description:
    "Case și apartamente mobilate la comandă, pe proiect — deja montate în Chișinău. Fiecare proiect: măsurat la fața locului, desenat în 3D, fabricat în atelierul MOBO.",
  alternates: { canonical: "/proiecte" },
};

export default function ProiectePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Proiecte realizate"
          title="Case întregi, mobilate pe proiect."
          intro="Fiecare proiect din această pagină e o locuință reală: măsurată la fața locului, desenată în 3D și mobilată cap-coadă din atelierul nostru din Chișinău. Fotografiile sunt din casele clienților, nu randări."
        />
        <Projects variant="page" />
      </main>
      <Footer />
    </>
  );
}
