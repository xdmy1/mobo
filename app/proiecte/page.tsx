import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Projects from "@/components/sections/Projects";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Proiecte realizate",
  description:
    "Bucătării și livinguri la comandă, deja montate în case reale din Chișinău. Fiecare proiect: măsurat la fața locului, desenat în 3D, fabricat în atelierul MOBO.",
  alternates: { canonical: "/proiecte" },
};

export default function ProiectePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Proiecte realizate"
          title="Mobilier deja montat în case reale."
          intro="Fiecare proiect din această pagină a fost măsurat la fața locului, desenat în 3D și fabricat în atelierul nostru din Chișinău. Fotografiile sunt din casele clienților, nu randări."
        />
        <Projects variant="page" />
      </main>
      <Footer />
    </>
  );
}
