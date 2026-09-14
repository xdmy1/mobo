import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import SmoothScroll from "@/components/ui/SmoothScroll";
import PageGrade from "@/components/ui/PageGrade";
import CookieConsent from "@/components/ui/CookieConsent";
import LangProvider from "@/components/ui/LangProvider";
import { SITE } from "@/lib/data";
import { CONSENT_BOOT_SCRIPT, GTM_ID, GTM_SCRIPT } from "@/lib/gtm";
import { HTML_LANG, LANGS, OG_LOCALE, type Lang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { alternatesFor, canonicalUrl } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import "../globals.css";

/* Geist is the face navarro.ro uses, and it holds the tight negative tracking
   the display sizes rely on. Instrument Serif: tăiat la cererea utilizatorului
   pe 2026-09-05, readus la cererea lui pe 2026-09-07 — varianta „cu șrift
   italic" a secțiunii de pași e cea aleasă. */
const geist = Geist({
  subsets: ["latin", "latin-ext"], // latin-ext carries ă â î ș ț
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
});

/** Ambele limbi se prerenderează; proxy-ul servește „ro" de pe căile goale. */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();

  return {
    metadataBase: new URL("https://mobo.md"),
    title: {
      default: t("meta.home.title"),
      template: "%s · MOBO",
    },
    description: t("meta.home.description"),
    keywords: t("meta.home.keywords").split("|"),
    openGraph: {
      type: "website",
      locale: OG_LOCALE[lang],
      url: canonicalUrl("/", lang),
      siteName: SITE.name,
      title: t("meta.home.title"),
      description: t("meta.home.ogDescription"),
      images: [{ url: SITE.logo, width: SITE.logoWidth, height: SITE.logoHeight, alt: SITE.name }],
    },
    robots: { index: true, follow: true },
    /* hreflang: fiecare pagină își declară perechea, ca Google să nu trateze
       versiunea rusă drept conținut duplicat al celei românești. */
    alternates: alternatesFor("/", lang),
  };
}

export const viewport: Viewport = {
  themeColor: "#20211b",
  colorScheme: "dark",
};

/* Structured data — a furniture maker with a physical showroom is exactly what
   LocalBusiness is for, and it drives the map/knowledge panel in search. */
const jsonLdFor = (lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  name: SITE.name,
  image: SITE.logo,
  /* Un singur @id pentru ambele limbi: e aceeași afacere, nu două. */
  "@id": "https://mobo.md/#business",
  url: canonicalUrl("/", lang),
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "stradela Studenților 15A",
    addressLocality: "Chișinău",
    addressCountry: "MD",
  },
  sameAs: [
    "https://www.instagram.com/mobokitchenshome/",
    "https://www.facebook.com/Mobo.md",
    "https://www.youtube.com/@MoboKitchenHome",
    "https://www.tiktok.com/@mobo.kitchens.home",
  ],
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getI18n();
  /* Doar dicționarul limbii curente traversează firul — importarea ambelor
     într-o componentă client ar trimite rusa fiecărui vizitator român. */
  const dict = getDictionary(lang);

  return (
    <html
      lang={HTML_LANG[lang]}
      className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}
    >
      <body className="bg-ink-850 text-fg antialiased">
        {/* GTM's <noscript> fallback, first thing in the body as its install
            instructions require. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Consent defaults first, container second — the order is the whole
            point, so both are beforeInteractive and the defaults are declared
            ahead of the loader. See lib/gtm.ts. */}
        <Script
          id="consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: CONSENT_BOOT_SCRIPT }}
        />
        <Script
          id="gtm"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: GTM_SCRIPT }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFor(lang)) }}
        />
        {/* Keyboard users shouldn't have to tab the whole nav to reach content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-lime-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-lime-ink"
        >
          {t("ui.skipToContent")}
        </a>
        {/* Mounted BEFORE children: the first-paint veil must exist in the DOM
            ahead of page content so the resolve is flash-free. It is a sibling
            of the content, never an ancestor — that is what keeps it from
            forming a backdrop root and flattening every glass surface below. */}
        <PageGrade />
        <SmoothScroll />
        <LangProvider lang={lang} dict={dict}>
          {children}
          {/* Consimțământul de cookie-uri — peste tot chrome-ul (z-[95]), la
              prima vizită; alegerea trăiește în localStorage. */}
          <CookieConsent />
        </LangProvider>
      </body>
    </html>
  );
}
