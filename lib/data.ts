/**
 * All content on this page is the real content of mobo.md — copy, project
 * names, reviews, contact details and media are lifted from the live site so
 * the redesign can be judged on design rather than on placeholder text.
 *
 * PREVIEW NOTE: image URLs point at the live WordPress media library. On
 * approval these become local files and only this file changes. Toate cele cinci ședințe foto sunt acum locale
 * (static imports din /assets) — nu mai rămâne nimic pe media library.
 */

import type { StaticImageData } from "next/image";

import dressing01 from "@/assets/proiecte/str-universitatii/dressing-01.jpg";
import dressing02 from "@/assets/proiecte/str-universitatii/dressing-02.jpg";
import dressing03 from "@/assets/proiecte/str-universitatii/dressing-03.jpg";
import bucatarie01 from "@/assets/proiecte/str-universitatii/bucatarie-01.jpg";
import bucatarie02 from "@/assets/proiecte/str-universitatii/bucatarie-02.jpg";
import bucatarie03 from "@/assets/proiecte/str-universitatii/bucatarie-03.jpg";
import bucatarie04 from "@/assets/proiecte/str-universitatii/bucatarie-04.jpg";
import bucatarie05 from "@/assets/proiecte/str-universitatii/bucatarie-05.jpg";
import bucatarie06 from "@/assets/proiecte/str-universitatii/bucatarie-06.jpg";
import bucatarie07 from "@/assets/proiecte/str-universitatii/bucatarie-07.jpg";
import living01 from "@/assets/proiecte/str-universitatii/living-01.jpg";
import living02 from "@/assets/proiecte/str-universitatii/living-02.jpg";
import living03 from "@/assets/proiecte/str-universitatii/living-03.jpg";
import living04 from "@/assets/proiecte/str-universitatii/living-04.jpg";
import dormitor01 from "@/assets/proiecte/str-universitatii/dormitor-01.jpg";
import dormitor02 from "@/assets/proiecte/str-universitatii/dormitor-02.jpg";
import dormitor03 from "@/assets/proiecte/str-universitatii/dormitor-03.jpg";
import dormitor04 from "@/assets/proiecte/str-universitatii/dormitor-04.jpg";
import dormitor05 from "@/assets/proiecte/str-universitatii/dormitor-05.jpg";
import dormitor06 from "@/assets/proiecte/str-universitatii/dormitor-06.jpg";
import dormitor07 from "@/assets/proiecte/str-universitatii/dormitor-07.jpg";
import dormitor08 from "@/assets/proiecte/str-universitatii/dormitor-08.jpg";
import dormitorDoi01 from "@/assets/proiecte/str-universitatii/dormitor-doi-01.jpg";
import dormitorDoi02 from "@/assets/proiecte/str-universitatii/dormitor-doi-02.jpg";
import baie01 from "@/assets/proiecte/str-universitatii/baie-01.jpg";
import antreu01 from "@/assets/proiecte/str-universitatii/antreu-01.jpg";
import antreu02 from "@/assets/proiecte/str-universitatii/antreu-02.jpg";
import antreu03 from "@/assets/proiecte/str-universitatii/antreu-03.jpg";
import antreu04 from "@/assets/proiecte/str-universitatii/antreu-04.jpg";
import antreu05 from "@/assets/proiecte/str-universitatii/antreu-05.jpg";

/* Ședința Strada Miorița — locală. */
import mioAntreu01 from "@/assets/proiecte/str-miorita/antreu-01.jpg";
import mioAntreu02 from "@/assets/proiecte/str-miorita/antreu-02.jpg";
import mioAntreu03 from "@/assets/proiecte/str-miorita/antreu-03.jpg";
import mioLiving01 from "@/assets/proiecte/str-miorita/living-01.jpg";
import mioLiving02 from "@/assets/proiecte/str-miorita/living-02.jpg";
import mioLiving03 from "@/assets/proiecte/str-miorita/living-03.jpg";
import mioLiving04 from "@/assets/proiecte/str-miorita/living-04.jpg";
import mioLiving05 from "@/assets/proiecte/str-miorita/living-05.jpg";
import mioLiving06 from "@/assets/proiecte/str-miorita/living-06.jpg";
import mioBucatarie01 from "@/assets/proiecte/str-miorita/bucatarie-01.jpg";
import mioBucatarie02 from "@/assets/proiecte/str-miorita/bucatarie-02.jpg";
import mioBucatarie03 from "@/assets/proiecte/str-miorita/bucatarie-03.jpg";
import mioBucatarie04 from "@/assets/proiecte/str-miorita/bucatarie-04.jpg";
import mioDormitor01 from "@/assets/proiecte/str-miorita/dormitor-01.jpg";
import mioDormitor02 from "@/assets/proiecte/str-miorita/dormitor-02.jpg";
import mioDormitor03 from "@/assets/proiecte/str-miorita/dormitor-03.jpg";
import mioDormitor04 from "@/assets/proiecte/str-miorita/dormitor-04.jpg";
import mioDressing01 from "@/assets/proiecte/str-miorita/dressing-01.jpg";
import mioBaie01 from "@/assets/proiecte/str-miorita/baie-01.jpg";
import mioBaie02 from "@/assets/proiecte/str-miorita/baie-02.jpg";
import mioBaie03 from "@/assets/proiecte/str-miorita/baie-03.jpg";

/* Ședința Strada Valentin Roșca — locală. */
import vrBirou01 from "@/assets/proiecte/str-valentin-rosca/birou-01.jpg";
import vrDressing01 from "@/assets/proiecte/str-valentin-rosca/dressing-01.jpg";
import vrDressing02 from "@/assets/proiecte/str-valentin-rosca/dressing-02.jpg";
import vrDormitor01 from "@/assets/proiecte/str-valentin-rosca/dormitor-01.jpg";
import vrDormitor02 from "@/assets/proiecte/str-valentin-rosca/dormitor-02.jpg";
import vrDormitor03 from "@/assets/proiecte/str-valentin-rosca/dormitor-03.jpg";
import vrDormitor04 from "@/assets/proiecte/str-valentin-rosca/dormitor-04.jpg";
import vrDormitor05 from "@/assets/proiecte/str-valentin-rosca/dormitor-05.jpg";
import vrDormitor06 from "@/assets/proiecte/str-valentin-rosca/dormitor-06.jpg";
import vrDormitor07 from "@/assets/proiecte/str-valentin-rosca/dormitor-07.jpg";
import vrDormitorDoi01 from "@/assets/proiecte/str-valentin-rosca/dormitor-doi-01.jpg";
import vrBucatarie01 from "@/assets/proiecte/str-valentin-rosca/bucatarie-01.jpg";
import vrBucatarie02 from "@/assets/proiecte/str-valentin-rosca/bucatarie-02.jpg";
import vrBucatarie03 from "@/assets/proiecte/str-valentin-rosca/bucatarie-03.jpg";
import vrBucatarie04 from "@/assets/proiecte/str-valentin-rosca/bucatarie-04.jpg";
import vrBucatarie05 from "@/assets/proiecte/str-valentin-rosca/bucatarie-05.jpg";
import vrBaie01 from "@/assets/proiecte/str-valentin-rosca/baie-01.jpg";
import vrBaie02 from "@/assets/proiecte/str-valentin-rosca/baie-02.jpg";
import vrBaie03 from "@/assets/proiecte/str-valentin-rosca/baie-03.jpg";
import vrBaie04 from "@/assets/proiecte/str-valentin-rosca/baie-04.jpg";
import vrBaie05 from "@/assets/proiecte/str-valentin-rosca/baie-05.jpg";
import vrBaie06 from "@/assets/proiecte/str-valentin-rosca/baie-06.jpg";
import vrBaie07 from "@/assets/proiecte/str-valentin-rosca/baie-07.jpg";

/* Ședința Strada Bucovinei — locală. */
import bucAntreu01 from "@/assets/proiecte/str-bucovina/antreu-01.jpg";
import bucAntreu02 from "@/assets/proiecte/str-bucovina/antreu-02.jpg";
import bucAntreu03 from "@/assets/proiecte/str-bucovina/antreu-03.jpg";
import bucAntreu04 from "@/assets/proiecte/str-bucovina/antreu-04.jpg";
import bucScara01 from "@/assets/proiecte/str-bucovina/scara-01.jpg";
import bucScara02 from "@/assets/proiecte/str-bucovina/scara-02.jpg";
import bucScara03 from "@/assets/proiecte/str-bucovina/scara-03.jpg";
import bucScara04 from "@/assets/proiecte/str-bucovina/scara-04.jpg";
import bucScara05 from "@/assets/proiecte/str-bucovina/scara-05.jpg";
import bucBucatarie01 from "@/assets/proiecte/str-bucovina/bucatarie-01.jpg";
import bucBucatarie02 from "@/assets/proiecte/str-bucovina/bucatarie-02.jpg";
import bucBucatarie03 from "@/assets/proiecte/str-bucovina/bucatarie-03.jpg";
import bucBucatarie04 from "@/assets/proiecte/str-bucovina/bucatarie-04.jpg";
import bucBucatarie05 from "@/assets/proiecte/str-bucovina/bucatarie-05.jpg";
import bucBucatarie06 from "@/assets/proiecte/str-bucovina/bucatarie-06.jpg";
import bucBaie01 from "@/assets/proiecte/str-bucovina/baie-01.jpg";
import bucBaie02 from "@/assets/proiecte/str-bucovina/baie-02.jpg";
import bucDressing01 from "@/assets/proiecte/str-bucovina/dressing-01.jpg";
import bucDressing02 from "@/assets/proiecte/str-bucovina/dressing-02.jpg";
import bucDressing03 from "@/assets/proiecte/str-bucovina/dressing-03.jpg";

/* Ședința Strada Ialoveni — locală. */
import ialBucatarie01 from "@/assets/proiecte/str-ialoveni/bucatarie-01.jpg";
import ialBucatarie02 from "@/assets/proiecte/str-ialoveni/bucatarie-02.jpg";
import ialBucatarie03 from "@/assets/proiecte/str-ialoveni/bucatarie-03.jpg";
import ialBucatarie04 from "@/assets/proiecte/str-ialoveni/bucatarie-04.jpg";
import ialBucatarie05 from "@/assets/proiecte/str-ialoveni/bucatarie-05.jpg";
import ialBucatarie06 from "@/assets/proiecte/str-ialoveni/bucatarie-06.jpg";
import ialBucatarie07 from "@/assets/proiecte/str-ialoveni/bucatarie-07.jpg";
import ialLiving01 from "@/assets/proiecte/str-ialoveni/living-01.jpg";
import ialSala01 from "@/assets/proiecte/str-ialoveni/sala-01.jpg";
import ialSala02 from "@/assets/proiecte/str-ialoveni/sala-02.jpg";
import ialSala03 from "@/assets/proiecte/str-ialoveni/sala-03.jpg";
import ialDetaliu01 from "@/assets/proiecte/str-ialoveni/detaliu-01.jpg";

/* Ședința Strada Constantin Stere — locală. */
import csAntreu01 from "@/assets/proiecte/str-constantin-stere/antreu-01.jpg";
import csAntreu02 from "@/assets/proiecte/str-constantin-stere/antreu-02.jpg";
import csAntreu03 from "@/assets/proiecte/str-constantin-stere/antreu-03.jpg";
import csAntreu04 from "@/assets/proiecte/str-constantin-stere/antreu-04.jpg";
import csBucatarie01 from "@/assets/proiecte/str-constantin-stere/bucatarie-01.jpg";
import csBucatarie02 from "@/assets/proiecte/str-constantin-stere/bucatarie-02.jpg";
import csBucatarie03 from "@/assets/proiecte/str-constantin-stere/bucatarie-03.jpg";
import csBucatarie04 from "@/assets/proiecte/str-constantin-stere/bucatarie-04.jpg";
import csBucatarie05 from "@/assets/proiecte/str-constantin-stere/bucatarie-05.jpg";
import csBucatarie06 from "@/assets/proiecte/str-constantin-stere/bucatarie-06.jpg";
import csBucatarie07 from "@/assets/proiecte/str-constantin-stere/bucatarie-07.jpg";
import csLiving01 from "@/assets/proiecte/str-constantin-stere/living-01.jpg";
import csLiving02 from "@/assets/proiecte/str-constantin-stere/living-02.jpg";
import csLiving03 from "@/assets/proiecte/str-constantin-stere/living-03.jpg";
import csLiving04 from "@/assets/proiecte/str-constantin-stere/living-04.jpg";
import csBirou01 from "@/assets/proiecte/str-constantin-stere/birou-01.jpg";
import csBirou02 from "@/assets/proiecte/str-constantin-stere/birou-02.jpg";
import csCopii01 from "@/assets/proiecte/str-constantin-stere/copii-01.jpg";
import csCopii02 from "@/assets/proiecte/str-constantin-stere/copii-02.jpg";
import csCopii03 from "@/assets/proiecte/str-constantin-stere/copii-03.jpg";
import csCopii04 from "@/assets/proiecte/str-constantin-stere/copii-04.jpg";

export const SITE = {
  name: "MOBO Kitchens & Home",
  shortName: "MOBO",
  tagline: "Mobilier la comandă pentru toată casa",
  logo: "https://mobo.md/wp-content/uploads/2024/09/logomobo.png",
  logoWidth: 500,
  logoHeight: 172,
  phone: "+373 60 331 331",
  phoneHref: "tel:+37360331331",
  email: "info@mobo.md",
  address: "stradela Studenților 15A, Chișinău",
  /* Din 2026-09-04 calculatorul e pagină internă (/calculator), cu aceleași
     prețuri din CRM ca vechiul calculator.mobo.md — subdomeniul poate fi
     redirecționat aici când decide clientul. */
  calculator: "/calculator",
} as const;

/* Entitatea juridică din spatele brandului — apare pe /contacte și în footer,
   și este operatorul numit în paginile legale. */
export const COMPANY = {
  legalName: "Unlimited Art Unity SRL",
  idno: "1022600057924",
  mapsHref: "https://maps.google.com/?q=stradela+Studen%C8%9Bilor+15A,+Chi%C8%99in%C4%83u",
} as const;

/**
 * The shots the closing title sequence cuts between, in order.
 *
 * Only audited frames appear here — no sideways phone photos, no gift-bow promo
 * graphics. Each carries its own suggested camera move so the sequence reads as
 * cut coverage rather than the same push repeated five times.
 */
export type FilmShot = {
  src: string;
  alt: string;
  /** Camera move for this shot. The editor decides the actual values. */
  move: "push-in" | "pull-back" | "pan-left" | "pan-right" | "hold";
  /** Title card laid over this shot, if any. */
  card?: string;
};

export const FILM_SHOTS: FilmShot[] = [
  {
    src: "https://mobo.md/wp-content/uploads/2024/11/Bucatarie-la-comanda-MOBO26.jpg",
    alt: "Bucătărie albă pe colț, cu lumină naturală de la fereastră",
    move: "push-in",
    card: "Bucătării la comandă",
  },
  {
    src: "https://mobo.md/wp-content/uploads/2024/11/Bucatarie-la-comanda-MOBO-1-2.jpeg",
    alt: "Bucătărie cu insulă în verde pastel și corpuri din nuc",
    move: "pan-right",
    card: "Proiectate în Chișinău",
  },
  {
    src: "https://mobo.md/wp-content/uploads/2024/12/IMG_0073.jpg",
    alt: "Living deschis spre bucătărie, cu canapea albă și perete de marmură",
    move: "pull-back",
    card: "Măsurate la fața locului",
  },
  {
    src: "https://mobo.md/wp-content/uploads/2024/11/Bucatarie-la-comanda-MOBO24-scaled.jpg",
    alt: "Bucătărie albă cu vitrină iluminată și pardoseală de marmură",
    move: "pan-left",
    card: "Garanție 5 ani",
  },
  {
    /* The hero frame closes the sequence — the strongest image in the library. */
    src: "https://mobo.md/wp-content/uploads/2024/11/Bucatarie-la-comanda-MOBO31.jpg",
    alt: "Bucătărie la comandă în nuanțe de lemn și grafit",
    move: "hold",
  },
];

/* „Bucătării" primul — cerință de client (produsul-far al brandului), cu
   click direct într-o galerie transversală a bucătăriilor din toate casele. */
export const NAV_LINKS = [
  { label: "Bucătării", href: "/bucatarii" },
  { label: "Proiecte", href: "/proiecte" },
  { label: "Servicii", href: "/servicii" },
  { label: "Despre Noi", href: "/despre-noi" },
  { label: "Contacte", href: "/contacte" },
] as const;

/* Cerință de client: termenii, confidențialitatea și GDPR trebuie să fie
   accesibile din bara de sus. Trăiesc într-o bandă utilitară discretă deasupra
   pilulei (se restrânge la scroll), în meniul mobil și în footer — nu printre
   linkurile principale, unde ar dilua navigarea. */
export const LEGAL_LINKS = [
  { label: "Termeni și condiții", href: "/termeni-si-conditii" },
  { label: "Politica de confidențialitate", href: "/politica-de-confidentialitate" },
  { label: "GDPR", href: "/gdpr" },
] as const;

export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/mobokitchenshome/" },
  { label: "Facebook", href: "https://www.facebook.com/Mobo.md" },
  { label: "TikTok", href: "https://www.tiktok.com/@mobo.kitchens.home" },
  { label: "YouTube", href: "https://www.youtube.com/@MoboKitchenHome" },
  { label: "Telegram", href: "https://t.me/mobokitchens" },
] as const;

/* ------------------------------------------------------------------ Hero -- */

/**
 * USABLE PHOTOGRAPHY — audited, not assumed.
 *
 * mobo.md's media library was inspected image by image. Of 14 candidates only
 * these 6 are usable on a premium page:
 *
 *   REJECTED — 0.webp / 7.webp / 9.webp
 *       Not rooms at all. Promotional graphics of an oven and a dishwasher
 *       wrapped in gift bows on a lime square. They were never interior photos.
 *   REJECTED — MOBO7-2 / MOBO15-2 / mobila-living-la-comanda-1
 *       Phone photos whose content is stored sideways with no EXIF orientation
 *       tag, so nothing can auto-correct them. They render rotated 90°.
 *   REJECTED — MOBO19-1
 *       Awkward crop, subject cut off.
 *
 * The shoot MOBO needs before launch: bedroom, dressing, bathroom and kids'
 * room have NO usable photography whatsoever.
 */
const PHOTO = {
  /* Wide, evenly lit, wood + graphite. The strongest frame in the library. */
  kitchenWide: "https://mobo.md/wp-content/uploads/2024/11/Bucatarie-la-comanda-MOBO31.jpg",
  /* White L-shaped kitchen, daylight from the window. */
  kitchenLight: "https://mobo.md/wp-content/uploads/2024/11/Bucatarie-la-comanda-MOBO26.jpg",
  /* Portrait. White + marble with a lit glass cabinet. */
  kitchenTall: "https://mobo.md/wp-content/uploads/2024/11/Bucatarie-la-comanda-MOBO24-scaled.jpg",
  /* Portrait. Sage green and walnut. */
  kitchenGreen: "https://mobo.md/wp-content/uploads/2024/11/Bucatarie-la-comanda-MOBO-1-2.jpeg",
  /* 16:9 living room, open plan onto the kitchen. */
  living: "https://mobo.md/wp-content/uploads/2024/12/IMG_0073.jpg",
  /* Portrait living corner. */
  livingTall: "https://mobo.md/wp-content/uploads/2024/12/photo1716799131-5.jpeg",
  /* 3D render — labelled as such wherever it appears. */
  render: "https://mobo.md/wp-content/uploads/2024/11/proiect-3d-mobila-bucatarie-la-comanda-1.png",
} as const;

export const HERO = {
  /* No eyebrow. The headline is the entry point; a label above it was
     decoration standing between the reader and the sentence. */
  title: "Garanție 5 ani la toate bucătăriile și mobilierul pentru casă.",
  subtitle:
    "Realizăm mobilier de orice tip, creat pentru casa ta — de la prima schiță 3D până la montajul final.",
  primaryCta: { label: "Calculator online", href: SITE.calculator },
  secondaryCta: { label: "Solicit calcul", href: "#contact" },
  /* Fotografia de hero e locală (client-supplied), nu din media library-ul
     WordPress: un living, nu o bucătărie — imaginea poartă aceeași idee ca
     sublinia „mobilier de orice tip". */
  image: "/hero.jpg",
  imageAlt:
    "Living modern mobilat la comandă — canapea modulară crem, pardoseală din lemn deschis și glisante cu profil negru",
  location: "Chișinău",
} as const;

/* ------------------------------------------------------------ Categories -- */

export type Category = {
  slug: string;
  label: string;
  icon: string;
  image: string;
  blurb: string;
  /**
   * TRUE = this category has no photograph of its own and is currently borrowing
   * one. Four of the six do. The images previously here were the gift-bow promo
   * graphics, which is why Dressing showed a wrapped dishwasher.
   *
   * Everything marked `needsPhoto` must be reshot before launch. Nothing here is
   * a fake room render — they are all genuine MOBO work, just of the wrong room.
   */
  needsPhoto?: true;
};

export const CATEGORIES: Category[] = [
  {
    slug: "bucatarii",
    label: "Bucătării",
    icon: "https://mobo.md/wp-content/uploads/2024/09/kitchen.png",
    image: PHOTO.kitchenLight,
    blurb: "Proiectate în jurul modului în care gătești.",
  },
  {
    slug: "living",
    label: "Mobilier Living",
    icon: "https://mobo.md/wp-content/uploads/2024/09/sofa.png",
    image: PHOTO.living,
    blurb: "Depozitare generoasă, fără să încarce camera.",
  },
  {
    slug: "dormitor",
    label: "Dormitor",
    icon: "https://mobo.md/wp-content/uploads/2024/09/double-bed.png",
    image: PHOTO.livingTall,
    blurb: "Finisaje calde, mecanisme silențioase.",
    needsPhoto: true,
  },
  {
    slug: "dressing",
    label: "Dressing",
    icon: "https://mobo.md/wp-content/uploads/2024/09/closet.png",
    image: PHOTO.kitchenTall,
    blurb: "Organizat la centimetru, până în tavan.",
    needsPhoto: true,
  },
  {
    slug: "baie",
    label: "Mobilier baie",
    icon: "https://mobo.md/wp-content/uploads/2024/09/bath.png",
    image: PHOTO.kitchenGreen,
    blurb: "Rezistent la umiditate, croit pe loc.",
    needsPhoto: true,
  },
  {
    slug: "copii",
    label: "Cameră copii",
    icon: "https://mobo.md/wp-content/uploads/2024/09/crib.png",
    image: PHOTO.render,
    blurb: "Crește odată cu copilul.",
    needsPhoto: true,
  },
];

/* -------------------------------------------------------------- Projects -- */

/**
 * Proiectele sunt împărțite PE CASE, nu pe încăperi — decizia clientului
 * (după referința D3 Buro): un proiect = o adresă, cu tot mobilierul făcut
 * acolo, nu „bucătării / livinguri" ca niște categorii de catalog.
 *
 * În interiorul unei case, galeria e împărțită PE SPAȚII — tot cerință de
 * client: parcurgi ședința foto cameră cu cameră, cu eticheta spațiului pe
 * primul cadru și în contor, nu ca un șir nediferențiat de fotografii.
 *
 * Strada Universității are ședința completă LOCAL: selecția de 30 de cadre a
 * clientului (arhiva de pe Drive), redimensionată pentru web și redenumită pe
 * spații — numele fișierelor de pe mobo.md expun numerotarea camerei
 * (DSC_xxxx), ceea ce clientul nu mai vrea. Celelalte patru proiecte rămân pe
 * media library-ul WordPress (un singur „spațiu" fără etichetă) până primim
 * și selecțiile lor.
 *
 * Cadrele locale sunt IMPORTURI STATICE din /assets, nu căi din /public:
 * Next le servește pe URL-uri cu hash + Cache-Control immutable, le știe
 * dimensiunile (deci `wide` se deduce, nu se declară) și generează singur
 * blur placeholder-ul pentru încărcare. Fișierele-sursă sunt JPEG q90 la
 * 2400px — vizual fără pierderi; singura compresie pe care o vede vizitatorul
 * e AVIF/WebP-ul produs de Next la servire.
 */
export type ProjectPhoto = {
  src: string | StaticImageData;
  /** Cadru landscape 3:2 — filmstrip-ul îi dă lățime în loc să-l taie pe portret. */
  wide?: boolean;
};

export type ProjectSpace = {
  /** Eticheta spațiului („Bucătărie", „Antreu"). Lipsește la galeriile negrupate. */
  label?: string;
  photos: ProjectPhoto[];
};

export type Project = {
  slug: string;
  title: string;
  /** O propoziție despre ce arată coperta — legenda cardului. */
  blurb: string;
  /** Numărul de cadre din galerie — selecția reală, nu inventat. */
  photoCount: number;
  href: string;
  cover: string | StaticImageData;
  /** Galeria, în ordinea în care parcurgi casa: spațiu după spațiu. */
  spaces: ProjectSpace[];
};

/** URL-ul unei coperți pentru contexte care cer string (og:image). */
export function coverUrl(cover: Project["cover"]): string {
  return typeof cover === "string" ? cover : cover.src;
}

/** Un spațiu din ședința locală — orientarea vine din dimensiunile reale. */
function spatiu(label: string, ...images: StaticImageData[]): ProjectSpace {
  return {
    label,
    photos: images.map((img) => ({ src: img, ...(img.width > img.height ? { wide: true } : {}) })),
  };
}

export const PROJECTS: Project[] = [
  /* Ședința foto completă, local. Ordinea spațiilor e parcursul fotografului
     prin casă; în fiecare spațiu, cadrul de ansamblu întâi, detaliile după. */
  {
    slug: "str-universitatii",
    title: "Strada Universității",
    blurb: "Dressing cu fronturi din furnir de nuc și uși glisante din sticlă riflată.",
    photoCount: 30,
    href: "/proiecte/str-universitatii",
    cover: dressing01,
    spaces: [
      spatiu("Dressing", dressing01, dressing02, dressing03),
      spatiu("Bucătărie", bucatarie01, bucatarie02, bucatarie03, bucatarie04, bucatarie05, bucatarie06, bucatarie07),
      spatiu("Living", living01, living02, living03, living04),
      spatiu("Dormitor matrimonial", dormitor01, dormitor02, dormitor03, dormitor04, dormitor05, dormitor06, dormitor07, dormitor08),
      spatiu("Al doilea dormitor", dormitorDoi01, dormitorDoi02),
      spatiu("Baie", baie01),
      spatiu("Antreu", antreu01, antreu02, antreu03, antreu04, antreu05),
    ],
  },
  {
    slug: "str-bucovina",
    title: "Strada Bucovinei",
    blurb: "Baie cu lavoar din piatră cu aspect de marmură și corp suspendat negru mat.",
    photoCount: 20,
    href: "/proiecte/str-bucovina",
    cover: bucBaie01,
    spaces: [
      spatiu("Antreu", bucAntreu01, bucAntreu02, bucAntreu03, bucAntreu04),
      spatiu("Scară", bucScara01, bucScara02, bucScara03, bucScara04, bucScara05),
      spatiu("Bucătărie", bucBucatarie01, bucBucatarie02, bucBucatarie03, bucBucatarie04, bucBucatarie05, bucBucatarie06),
      spatiu("Baie", bucBaie01, bucBaie02),
      spatiu("Dressing", bucDressing01, bucDressing02, bucDressing03),
    ],
  },
  {
    slug: "str-miorita",
    title: "Strada Miorița",
    blurb: "Antreu alb cu dulap până în tavan și mânere profil din lemn.",
    photoCount: 21,
    href: "/proiecte/str-miorita",
    cover: mioAntreu01,
    spaces: [
      spatiu("Antreu", mioAntreu01, mioAntreu02, mioAntreu03),
      spatiu("Living", mioLiving01, mioLiving02, mioLiving03, mioLiving04, mioLiving05, mioLiving06),
      spatiu("Bucătărie", mioBucatarie01, mioBucatarie02, mioBucatarie03, mioBucatarie04),
      spatiu("Dormitor", mioDormitor01, mioDormitor02, mioDormitor03, mioDormitor04),
      spatiu("Dressing", mioDressing01),
      spatiu("Baie", mioBaie01, mioBaie02, mioBaie03),
    ],
  },
  {
    slug: "str-ialoveni",
    title: "Strada Ialoveni",
    blurb: "Bar din stejar afumat cu blat alb, sub tavan din lamele negre — lounge și sală de mese.",
    photoCount: 12,
    /* Coperta e un cadru VERTICAL — cerință de client: cardul taie la 3:4, iar
       cadrul landscape de lounge ieșea mărit și moale. bucatarie-03 e portret
       nativ și poartă semnătura proiectului: barul sub tavanul din lamele. */
    href: "/proiecte/str-ialoveni",
    cover: ialBucatarie03,
    spaces: [
      spatiu("Lounge", ialLiving01),
      spatiu("Bar și bucătărie", ialBucatarie01, ialBucatarie02, ialBucatarie03, ialBucatarie04, ialBucatarie05, ialBucatarie06, ialBucatarie07),
      spatiu("Sală de mese", ialSala01, ialSala02, ialSala03, ialDetaliu01),
    ],
  },
  {
    slug: "str-valentin-rosca",
    title: "Strada Valentin Roșca",
    blurb: "Birou acasă — dulap alb cu fronturi riflate și masă de lucru din nuc.",
    photoCount: 23,
    href: "/proiecte/str-valentin-rosca",
    cover: vrBirou01,
    spaces: [
      spatiu("Birou", vrBirou01),
      spatiu("Dressing", vrDressing01, vrDressing02),
      spatiu("Dormitor matrimonial", vrDormitor01, vrDormitor02, vrDormitor03, vrDormitor04, vrDormitor05, vrDormitor06, vrDormitor07),
      spatiu("Al doilea dormitor", vrDormitorDoi01),
      spatiu("Bucătărie", vrBucatarie01, vrBucatarie02, vrBucatarie03, vrBucatarie04, vrBucatarie05),
      spatiu("Baie", vrBaie01, vrBaie02, vrBaie03, vrBaie04, vrBaie05, vrBaie06, vrBaie07),
    ],
  },
  {
    slug: "str-constantin-stere",
    title: "Strada Constantin Stere",
    blurb: "Bucătărie bej cu vitrină din sticlă fumurie, deschisă spre zona de luat masa.",
    photoCount: 21,
    href: "/proiecte/str-constantin-stere",
    /* Copertă VERTICALĂ (regula stabilită la Ialoveni: cardul taie la 3:4,
       cadrele landscape ies moi) — 02 e portret nativ și chiar scena din blurb. */
    cover: csBucatarie02,
    spaces: [
      spatiu("Antreu", csAntreu01, csAntreu02, csAntreu03, csAntreu04),
      spatiu("Bucătărie și dining", csBucatarie01, csBucatarie02, csBucatarie03, csBucatarie04, csBucatarie05, csBucatarie06, csBucatarie07),
      spatiu("Living", csLiving01, csLiving02, csLiving03, csLiving04),
      spatiu("Birou", csBirou01, csBirou02),
      spatiu("Camera copilului", csCopii01, csCopii02, csCopii03, csCopii04),
    ],
  },
];

export const PROJECTS_INDEX_HREF = "/proiecte";

/* ---------------------------------------------------- Galeria de bucătării -- */

/**
 * Cerință de client: „Bucătării" în meniu, cu click direct într-o galerie,
 * „organizată frumos". Nu e o colecție nouă de poze — e o tăietură
 * transversală prin aceleași ședințe: spațiul de bucătărie al fiecărui
 * proiect, etichetat cu adresa lui, în aceeași galerie pe spații de pe
 * paginile proiectelor. Un proiect nou cu bucătărie intră aici de la sine.
 */
export const KITCHENS_GALLERY: ProjectSpace[] = PROJECTS.flatMap((project) => {
  const kitchen = project.spaces.find((space) => space.label?.includes("ucătărie"));
  return kitchen ? [{ label: project.title, photos: kitchen.photos }] : [];
});

export const KITCHENS_HREF = "/bucatarii";

/* --------------------------------------------------------------- Process -- */

export type Step = { n: string; title: string; description: string; icon: string };

export const PROCESS: Step[] = [
  {
    n: "01",
    title: "Consultație",
    description:
      "Începutul fiecărui proiect este o discuție personalizată. Scopul este să înțelegem nevoile și dorințele clientului pentru a crea un plan optim.",
    icon: "https://mobo.md/wp-content/uploads/2024/09/discussion.png",
  },
  {
    n: "02",
    title: "Măsurare",
    description:
      "Luăm măsurători exacte pentru a ne asigura că mobilierul se va încadra perfect. Acest pas garantează o utilizare optimă a spațiului.",
    icon: "https://mobo.md/wp-content/uploads/2024/09/ruler.png",
  },
  {
    n: "03",
    title: "Proiect 3D",
    description:
      "Realizăm un design personalizat care reflectă stilul și nevoile clientului. Fiecare proiect combină estetică, funcționalitate și calitate.",
    icon: "https://mobo.md/wp-content/uploads/2024/09/graphic-design.png",
  },
  {
    n: "04",
    title: "Prezentare",
    description:
      "Prezentăm clientului proiectul final pentru feedback și ajustări. Este etapa în care toate detaliile sunt stabilite.",
    icon: "https://mobo.md/wp-content/uploads/2024/09/presentation.png",
  },
  {
    n: "05",
    title: "Contractare",
    description:
      "Stabilim toate detaliile proiectului într-un contract clar și transparent. Clientul primește garanția calității.",
    icon: "https://mobo.md/wp-content/uploads/2024/09/contract.png",
  },
  {
    n: "06",
    title: "Producere",
    description:
      "Mobilierul este realizat cu precizie și atenție la detalii în atelierul nostru. Materialele premium garantează durabilitatea.",
    icon: "https://mobo.md/wp-content/uploads/2024/09/production-line.png",
  },
  {
    n: "07",
    title: "Livrare",
    description:
      "Mobilierul este livrat în siguranță, respectând termenii stabiliți. Livrarea include verificarea produselor înainte de instalare.",
    icon: "https://mobo.md/wp-content/uploads/2024/09/fast-delivery-3-1.png",
  },
  {
    n: "08",
    title: "Instalare",
    description:
      "Echipa noastră calificată instalează mobilierul cu profesionalism. Ne asigurăm că totul funcționează perfect.",
    icon: "https://mobo.md/wp-content/uploads/2024/09/support.png",
  },
  {
    n: "09",
    title: "Garanție",
    description:
      "Bucură-te de 5 ani garanție pentru toate produsele. Ne asigurăm că mobilierul tău va rezista testului timpului.",
    icon: "https://mobo.md/wp-content/uploads/2024/09/shield.png",
  },
];

/* ------------------------------------------------------------- Why / USP -- */

/* „Proiect 3D înainte de orice decizie" a dispărut de peste tot — clarificare
   de client: proiectul 3D se primește după contractare, nu e un cadou gratuit.
   Formularea corectă e „înainte de producție". */
export const ADVANTAGES = [
  "Proiect 3D detaliat al viitorului mobilier, înainte de producție.",
  "5 ani garanție și deservire la un singur apel, cu posibilitate de prelungire.",
  "Plată în 10 rate prin intermediul Microinvest.",
  "Abordare personalizată și încadrare rațională în buget.",
  "Trei categorii de materiale la alegere: Standard, Optim & Premium.",
  "Monitorizarea calității chiar în momentul montării.",
  "Predăm mobilierul doar după verificarea împreună cu clientul.",
] as const;

export const STATS = [
  { value: 5, suffix: " ani", label: "Garanție la tot mobilierul" },
  { value: 10, suffix: " rate", label: "Plată eșalonată prin Microinvest" },
  { value: 3, suffix: "", label: "Categorii de materiale la alegere" },
  { value: 9, suffix: " etape", label: "De la consultație la montaj" },
] as const;

export const MATERIALS = ["Standard", "Optim", "Premium"] as const;

/* ----------------------------------------------------------------- About -- */

export const ABOUT = {
  eyebrow: "Despre noi",
  title: "Transformăm fiecare locuință într-un spațiu confortabil, funcțional și plin de stil.",
  body: "MOBO Kitchens & Home este un brand creat pentru a transforma fiecare locuință într-un spațiu confortabil, funcțional și plin de stil. Suntem specializați în proiectarea și fabricarea de mobilă la comandă, cu un accent deosebit pe bucătăriile premium, oferind soluții personalizate pentru orice tip de spațiu și preferință.",
  mission:
    "Misiunea noastră: să creăm bucătării și mobilier de calitate premium care transformă casele în adevărate locuințe de vis — funcționale, estetice și adaptate nevoilor tale.",
  image: "https://mobo.md/wp-content/uploads/2024/11/proiect-3d-mobila-bucatarie-la-comanda-1.png",
} as const;

/* ----------------------------------------------------------- Testimonials -- */

export type Review = { name: string; text: string };

export const REVIEWS: Review[] = [
  {
    name: "Arcan Svetlana",
    text: "Echipa Mobo s-a remarcat prin profesionalism, atenție la detalii și o gamă variată de produse de înaltă calitate, adaptate perfect cerințelor și stilului dorit. Recomand cu căldură pentru orice proiect de mobilare sau amenajare interioară.",
  },
  {
    name: "Iuliana Cerici",
    text: "Am comandat tot mobilierul din casă de la Mobo și suntem foarte mulțumiți. Utilizăm de câteva luni și toate mecanismele lucrează perfect. Foarte receptivi, creativi și niște specialiști de nota 10 în domeniul lor.",
  },
  {
    name: "Aliona Berdila",
    text: "Am fost plăcut surprinsă de calitatea materialelor folosite, atenția la detalii și măiestria execuției fiecărei piese de mobilier. Pe lângă toate acestea, prețul a fost unul foarte accesibil, raportat la nivelul de calitate oferit.",
  },
  {
    name: "Alexandra",
    text: "Am fost impresionată de calitatea produselor, de promptitudinea echipei și de modul în care fiecare piesă de mobilier a fost montată cu precizie. Datorită vouă, locuința mea arată minunat.",
  },
  {
    name: "Natalia Zarea",
    text: "Sînt foarte mulțumită de calitatea lucrărilor, punctualitate și profesionalismul întregii echipe Mobo Kitchens & Home! Am avut o conlucrare excelentă, fiind pus accent pe fiecare detaliu.",
  },
  {
    name: "Acustmed Chișinău",
    text: "Sincere mulțumiri echipei MOBO. Am avut parte de o colaborare frumoasă. Sunteți foarte bravo, receptivi și punctuali. Recomandăm cu încredere.",
  },
  {
    name: "Evghenia Efimovna",
    text: "Au depășit așteptările mele în totalitate. Produsele lor sunt de o calitate excepțională, iar serviciul clienți este remarcabil. Recomand cu încredere!",
  },
  {
    name: "Artem Vladimirovici",
    text: "Calitativ și rapid! Comunicare la cel mai înalt nivel!",
  },
  {
    name: "Carina Morari",
    text: "Profesioniști cu atitudine lăudabilă față de clienți!",
  },
  {
    name: "Puiu Raisa",
    text: "Am făcut mobila la voi — calitate bună, recomand!",
  },
];

/* ------------------------------------------------------------ Lead form -- */

export const ROOM_OPTIONS = [
  "Bucătărie",
  "Living",
  "Dormitor",
  "Dressing",
  "Baie",
  "Cameră copii",
  "Toată casa",
] as const;

export const BUDGET_OPTIONS = [
  "Sub 30 000 MDL",
  "30 000 – 60 000 MDL",
  "60 000 – 120 000 MDL",
  "Peste 120 000 MDL",
  "Încă nu știu",
] as const;

/* ------------------------------------------------------- Pagina Servicii -- */

/**
 * Descrierile extinse ale celor 9 etape, pentru pagina /servicii. Aliniate prin
 * index cu PROCESS — conținutul e preluat de pe mobo.md/servicii, unde fiecare
 * etapă are un paragraf întreg, nu doar rezumatul de pe homepage.
 */
export const SERVICE_DETAILS: string[] = [
  "Fiecare proiect începe cu o discuție personalizată, la showroom sau la telefon. Analizăm împreună spațiul, stilul dorit și bugetul disponibil, ca să identificăm din start materialele și soluțiile potrivite pentru tine.",
  "Echipa noastră vine la fața locului și ia măsurători exacte cu echipament modern. Fiecare centimetru contează: corpurile, blaturile și spațiile de depozitare trebuie să se integreze perfect în încăpere.",
  "Designerii noștri transformă măsurătorile într-un proiect 3D detaliat, cu randări realiste. Vezi mobilierul în spațiul tău înainte de producție — configurație, culori, sisteme de depozitare inteligente.",
  "Îți prezentăm proiectul final și discutăm fiecare detaliu: scheme de culori, calitatea materialelor, feronerie. Feedback-ul tău este implementat înainte ca proiectul să plece în producție.",
  "Toate detaliile convenite intră într-un contract clar și transparent: termene de livrare, specificații tehnice, condiții de garanție. Știi exact ce primești și când.",
  "Mobilierul este fabricat în atelierul nostru, cu tehnologie avansată și materiale certificate — plăci stratificate, MDF de înaltă calitate, accesorii premium — sub un control riguros al calității.",
  "Livrăm mobilierul în siguranță, în ambalaje de protecție, respectând termenii stabiliți în contract. Fiecare componentă este verificată înainte de instalare.",
  "Montatorii noștri cu experiență asamblează mobilierul rapid și precis, inclusiv sistemele soft-close și sertarele cu mecanisme inteligente Blum. Totul este reglat și verificat împreună cu tine.",
  "Beneficiezi de 5 ani garanție pentru toate produsele — reflectă încrederea noastră în materialele folosite și în execuție. Deservire la un singur apel, cu posibilitate de prelungire.",
];

/**
 * Cele trei categorii de materiale dintre care alege clientul. Denumirile sunt
 * cele reale (MATERIALS); descrierile rezumă poziționarea fiecărei trepte fără
 * a promite branduri sau prețuri concrete pe treaptă.
 */
export const MATERIAL_TIERS = [
  {
    name: "Standard",
    blurb: "Soluția echilibrată: materiale verificate, finisaje curate și aceeași execuție atentă, la cel mai accesibil buget.",
  },
  {
    name: "Optim",
    blurb: "Cel mai des ales: plăci și feronerie de clasă superioară, mai multe decoruri și mecanisme silențioase incluse.",
  },
  {
    name: "Premium",
    blurb: "Materiale de top de la partenerii noștri europeni, fronturi speciale și accesorii din gamele înalte Blum și Hettich.",
  },
] as const;

/** Partenerii de materiale și feronerie, așa cum îi listează mobo.md. */
export const PARTNERS = [
  { name: "Egger", origin: "Austria", role: "plăci și decoruri" },
  { name: "AGT", origin: "Turcia", role: "fronturi MDF" },
  { name: "Fundermax", origin: "Austria", role: "suprafețe compacte" },
  { name: "SM'art", origin: "Italia", role: "suprafețe decorative" },
  { name: "Blum", origin: "Austria", role: "feronerie și soft-close" },
  { name: "Hettich", origin: "Germania", role: "sisteme de glisare" },
] as const;

/* ----------------------------------------------------- Pagina Despre noi -- */

export const ABOUT_PAGE = {
  headline: "Echipă cu 39 de ani de experiență cumulativă.",
  /** Repere reale, de pe mobo.md/despre-noi. */
  story:
    "MOBO Kitchens & Home a fost fondat în 2022 și lansat oficial la începutul lui 2023, ca un brand creat pentru a transforma fiecare locuință într-un spațiu confortabil, funcțional și plin de stil. În spatele lui stă o echipă cu 39 de ani de experiență cumulativă în proiectarea și fabricarea mobilierului la comandă.",
  kitchens: [
    "Mobilier ergonomic, personalizat pe spațiul tău",
    "Soluții moderne cu sisteme de depozitare inteligente",
    "Materiale premium: Fundermax, AGT, SM'art, Egger",
    "Accesorii premium de la Hettich și Blum",
    "5 ani garanție pentru toate bucătăriile",
  ],
  beyondKitchens:
    "Mai mult decât bucătării: mobilăm toată casa — antreuri, dulapuri și dressinguri, ansambluri TV pentru living, mobilier de baie și de birou, plus mobilier tapițat pentru dormitoare.",
  team: [
    {
      role: "Designeri",
      blurb: "Cu studii de design interior, transformă fiecare măsurătoare într-un proiect 3D care arată exact ca rezultatul final.",
    },
    {
      role: "Manageri de calitate",
      blurb: "Urmăresc fiecare comandă din atelier până la montaj și verifică estetica și funcționarea fiecărui detaliu.",
    },
    {
      role: "Montatori calificați",
      blurb: "Cu ani de experiență în spate, instalează mobilierul precis și curat — și îl predau doar după verificarea împreună cu tine.",
    },
  ],
} as const;

/* ------------------------------------------------- Istoria (Despre noi) -- */

/**
 * Cronologia „Drumul nostru" de pe /despre-noi — cerință de client, după
 * referința parke.md (Parchetnii Dvor): un drum parcurs din 2005 până azi.
 *
 * ATENȚIE: clientul trimite istoria reală mai târziu. Reperele marcate
 * `placeholder: true` sunt text de umplutură scris ca designul să poată fi
 * judecat pe conținut plauzibil — se înlocuiesc cu faptele clientului imediat
 * ce sosesc. 2022 și 2023 sunt reale (de pe mobo.md/despre-noi); „Azi" e
 * sinteza conținutului deja publicat.
 */
export type Milestone = {
  year: string;
  title: string;
  text: string;
  /** TRUE = text de umplutură; se înlocuiește cu istoria trimisă de client. */
  placeholder?: true;
};

export const HISTORY: Milestone[] = [
  {
    year: "2005",
    title: "Primele bucătării",
    text: "Povestea începe cu mult înaintea brandului: primii ani în producția de mobilier la comandă, primele bucătării predate și standardul de execuție care avea să definească tot ce urmează.",
    placeholder: true,
  },
  {
    year: "2015",
    title: "Experiența se adună",
    text: "Zeci de case mobilate cap-coadă și o echipă care crește proiect cu proiect — designeri, tehnologi și montatori care învață să lucreze ca un singur atelier.",
    placeholder: true,
  },
  {
    year: "2022",
    title: "Se naște MOBO",
    text: "Cei 39 de ani de experiență cumulativă primesc un nume: fondăm MOBO Kitchens & Home, un brand dedicat bucătăriilor premium și mobilierului pentru toată casa.",
  },
  {
    year: "2023",
    title: "Lansarea oficială",
    text: "MOBO se lansează la începutul anului: atelier propriu, primele proiecte sub noul nume și promisiunea care ne definește de atunci — 5 ani garanție la tot ce iese pe ușa atelierului.",
  },
  {
    year: "Azi",
    title: "Toată casa, un singur standard",
    text: "Mobilăm locuințe întregi — bucătării, dressinguri, livinguri, băi — cu proiect 3D, materiale de la parteneri europeni și predare doar după verificarea împreună cu clientul.",
  },
];

/* ---------------------------------------------------- Pagina Info clienți -- */

/**
 * Informațiile obligatorii privind protecția consumatorilor, preluate de pe
 * mobo.md/info-clienti. Autoritatea și datele ei de contact sunt publice.
 */
export const CONSUMER_INFO = {
  intro:
    "În conformitate cu legislația Republicii Moldova, consumatorii au dreptul de a fi informați și protejați. Pentru sesizări sau reclamații referitoare la produsele și serviciile noastre, contactează-ne mai întâi direct — răspundem în aceeași zi lucrătoare.",
  authority: {
    name: "Inspectoratul de Stat pentru Supravegherea Produselor Nealimentare și Protecția Consumatorilor",
    address: "str. Vasile Alecsandri 78, MD-2012, mun. Chișinău, Republica Moldova",
    phones: ["022 51 51 51", "022 50 19 81"],
    website: "https://consumator.gov.md",
    websiteLabel: "consumator.gov.md",
  },
} as const;
