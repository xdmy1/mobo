import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import LegalArticle from "@/components/sections/LegalArticle";
import Footer from "@/components/sections/Footer";
import InfoRo from "@/components/legal/info.ro";
import InfoRu from "@/components/legal/info.ru";
import { alternatesFor } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t("meta.info.title"),
    description: t("meta.info.description"),
    alternates: alternatesFor("/info-clienti", lang),
  };
}

/* Proza trăiește în components/legal/info.{ro,ru}.tsx — vezi paginile legale
   pentru motiv. `reviewNote={false}`: pagina nu e un document juridic care
   așteaptă validarea unui consilier, ci informații practice. */
export default async function InfoClientiPage() {
  const { lang, t } = await getI18n();
  const Body = lang === "ru" ? InfoRu : InfoRo;

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow={t("page.info.eyebrow")}
          title={t("page.info.title")}
          intro={t("consumer.intro")}
        />
        <LegalArticle updated={t("legal.updated.info")} reviewNote={false}>
          <Body />
        </LegalArticle>
      </main>
      <Footer />
    </>
  );
}
