import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Projects from "@/components/sections/Projects";
import Footer from "@/components/sections/Footer";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t("meta.proiecte.title"),
    description: t("meta.proiecte.description"),
    alternates: alternatesFor("/proiecte", lang),
  };
}

export default async function ProiectePage() {
  const { t } = await getI18n();

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow={t("page.proiecte.eyebrow")}
          title={t("page.proiecte.title")}
          intro={t("page.proiecte.intro")}
        />
        <Projects variant="page" />
      </main>
      <Footer />
    </>
  );
}
