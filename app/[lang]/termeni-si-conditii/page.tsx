import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LegalArticle from "@/components/sections/LegalArticle";
import Footer from "@/components/sections/Footer";
import TermsRo from "@/components/legal/terms.ro";
import TermsRu from "@/components/legal/terms.ru";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t("meta.termeni.title"),
    description: t("meta.termeni.description"),
    alternates: alternatesFor("/termeni-si-conditii", lang),
    robots: { index: false },
  };
}

/* Proza trăiește în components/legal/terms.{ro,ru}.tsx. Un text juridic lung,
   cu link-uri și accente în mijlocul frazei, e mult mai ușor de citit și de
   revizuit ca JSX decât spart în zeci de chei de dicționar. */
export default async function Page() {
  const { lang, t } = await getI18n();
  const Body = lang === "ru" ? TermsRu : TermsRo;

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow={t("page.legal.eyebrow")}
          title={t("page.termeni.title")}
          intro={t("page.termeni.intro")}
        />
        <LegalArticle updated={t("legal.updated.termeni")}>
          <Body />
        </LegalArticle>
      </main>
      <Footer />
    </>
  );
}
