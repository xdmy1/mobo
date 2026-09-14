import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LegalArticle from "@/components/sections/LegalArticle";
import Footer from "@/components/sections/Footer";
import PrivacyRo from "@/components/legal/privacy.ro";
import PrivacyRu from "@/components/legal/privacy.ru";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t("meta.confidentialitate.title"),
    description: t("meta.confidentialitate.description"),
    alternates: alternatesFor("/politica-de-confidentialitate", lang),
    robots: { index: false },
  };
}

/* Proza trăiește în components/legal/privacy.{ro,ru}.tsx. Un text juridic lung,
   cu link-uri și accente în mijlocul frazei, e mult mai ușor de citit și de
   revizuit ca JSX decât spart în zeci de chei de dicționar. */
export default async function Page() {
  const { lang, t } = await getI18n();
  const Body = lang === "ru" ? PrivacyRu : PrivacyRo;

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow={t("page.legal.eyebrow")}
          title={t("page.confidentialitate.title")}
          intro={t("page.confidentialitate.intro")}
        />
        <LegalArticle updated={t("legal.updated.confidentialitate")}>
          <Body />
        </LegalArticle>
      </main>
      <Footer />
    </>
  );
}
