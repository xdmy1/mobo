import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LegalArticle from "@/components/sections/LegalArticle";
import Footer from "@/components/sections/Footer";
import GdprRo from "@/components/legal/gdpr.ro";
import GdprRu from "@/components/legal/gdpr.ru";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t("meta.gdpr.title"),
    description: t("meta.gdpr.description"),
    alternates: alternatesFor("/gdpr", lang),
    robots: { index: false },
  };
}

/* Proza trăiește în components/legal/gdpr.{ro,ru}.tsx. Un text juridic lung,
   cu link-uri și accente în mijlocul frazei, e mult mai ușor de citit și de
   revizuit ca JSX decât spart în zeci de chei de dicționar. */
export default async function Page() {
  const { lang, t } = await getI18n();
  const Body = lang === "ru" ? GdprRu : GdprRo;

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow={t("page.legal.eyebrow")}
          title={t("page.gdpr.title")}
          intro={t("page.gdpr.intro")}
        />
        <LegalArticle updated={t("legal.updated.gdpr")}>
          <Body />
        </LegalArticle>
      </main>
      <Footer />
    </>
  );
}
