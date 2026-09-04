import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import SmoothScroll from "@/components/ui/SmoothScroll";
import PageGrade from "@/components/ui/PageGrade";
import SocialIsland from "@/components/ui/SocialIsland";
import CookieConsent from "@/components/ui/CookieConsent";
import { SITE } from "@/lib/data";
import "./globals.css";

/* Geist is the face navarro.ro uses, and it holds the tight negative tracking
   the display sizes rely on. Instrument Serif appears exactly once per screen,
   as an italic accent inside a sans headline. */
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

export const metadata: Metadata = {
  metadataBase: new URL("https://mobo.md"),
  title: {
    default: "MOBO Kitchens & Home — Mobilier la comandă în Chișinău",
    template: "%s · MOBO",
  },
  description:
    "Mobilier la comandă pentru toată casa — bucătării, livinguri, dormitoare, dressinguri. Proiect 3D, 5 ani garanție, plată în 10 rate. De la consultație până la montaj.",
  keywords: [
    "bucatarii la comanda",
    "mobila la comanda Chisinau",
    "bucatarii Moldova",
    "mobilier living",
    "dressing la comanda",
    "MOBO",
  ],
  openGraph: {
    type: "website",
    locale: "ro_MD",
    url: "https://mobo.md",
    siteName: SITE.name,
    title: "MOBO Kitchens & Home — Mobilier la comandă în Chișinău",
    description:
      "Mobilier la comandă pentru toată casa. Proiect 3D, 5 ani garanție, plată în 10 rate.",
    images: [{ url: SITE.logo, width: SITE.logoWidth, height: SITE.logoHeight, alt: SITE.name }],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#20211b",
  colorScheme: "dark",
};

/* Structured data — a furniture maker with a physical showroom is exactly what
   LocalBusiness is for, and it drives the map/knowledge panel in search. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  name: SITE.name,
  image: SITE.logo,
  "@id": "https://mobo.md/#business",
  url: "https://mobo.md",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}>
      <body className="bg-ink-850 text-fg antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Keyboard users shouldn't have to tab the whole nav to reach content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-lime-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-lime-ink"
        >
          Sari la conținut
        </a>
        {/* Mounted BEFORE children: the first-paint veil must exist in the DOM
            ahead of page content so the resolve is flash-free. It is a sibling
            of the content, never an ancestor — that is what keeps it from
            forming a backdrop root and flattening every glass surface below. */}
        <PageGrade />
        <SmoothScroll />
        {children}
        {/* Quick-contact island — floats on every page, below the nav overlay. */}
        <SocialIsland />
        {/* Consimțământul de cookie-uri — peste tot chrome-ul (z-[95]), la
            prima vizită; alegerea trăiește în localStorage. */}
        <CookieConsent />
      </body>
    </html>
  );
}
