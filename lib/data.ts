/**
 * All content on this page is the real content of mobo.md — copy, project
 * names, reviews, contact details and media are lifted from the live site so
 * the redesign can be judged on design rather than on placeholder text.
 *
 * PREVIEW NOTE: image URLs point at the live WordPress media library. On
 * approval these become local files under /public and only this file changes.
 */

export const SITE = {
  name: "MOBO Kitchens & Home",
  shortName: "MOBO",
  tagline: "Bucătării la comandă, mobilă, dormitoare, dulapuri",
  logo: "https://mobo.md/wp-content/uploads/2024/09/logomobo.png",
  logoWidth: 500,
  logoHeight: 172,
  phone: "+373 60 331 331",
  phoneHref: "tel:+37360331331",
  email: "info@mobo.md",
  address: "stradela Studenților 15A, Chișinău",
  calculator: "https://calculator.mobo.md",
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

export const NAV_LINKS = [
  { label: "Proiecte", href: "#proiecte" },
  { label: "Servicii", href: "#servicii" },
  { label: "Despre Noi", href: "#despre" },
  { label: "Contacte", href: "#contact" },
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
    "Proiectăm și fabricăm bucătării premium și mobilier la comandă, adaptate exact spațiului tău — de la prima schiță 3D până la montajul final.",
  primaryCta: { label: "Calculator online", href: SITE.calculator },
  secondaryCta: { label: "Solicit calcul", href: "#contact" },
  image: PHOTO.kitchenWide,
  imageAlt:
    "Bucătărie la comandă MOBO în nuanțe de lemn și grafit, cu insulă și corpuri suspendate",
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

export type Project = {
  slug: string;
  title: string;
  kind: "Bucătărie" | "Living";
  description: string;
  href: string;
  image: string;
};

/**
 * Six projects, not nine. The three dropped ones ("Bucătărie modernă",
 * "…cu insulă", "Living Eleganță Naturală") had only rejected photography
 * behind them, and a project card with a sideways phone photo does more damage
 * to a premium brand than a shorter grid does.
 *
 * Each photo below is matched to the copy that actually describes it — the
 * green-island kitchen sits under the entry whose text mentions the pastel
 * green island, not under a generic heading.
 */
export const PROJECTS: Project[] = [
  {
    slug: "bucatarie-moderna-liniara-cu-insula",
    title: "Bucătăria modernă liniară cu insulă",
    kind: "Bucătărie",
    description:
      "Nuanța caldă de lemn adaugă o notă naturală, iar insula în verde pastel devine elementul central.",
    href: "https://mobo.md/proiectele-realizate/bucatarii/bucatarie-moderna-liniara-cu-insula/",
    image: PHOTO.kitchenGreen,
  },
  {
    slug: "bucatarie-moderna-pe-colt-alba",
    title: "Bucătăria modernă pe colț albă",
    kind: "Bucătărie",
    description:
      "Designul pe colț optimizează spațiul, creând un mediu de lucru ergonomic și eficient.",
    href: "https://mobo.md/proiectele-realizate/bucatarii/bucatarie-moderna-pe-colt-alba/",
    image: PHOTO.kitchenLight,
  },
  {
    slug: "bucatarie-moderna-pe-colt",
    title: "Bucătăria modernă pe colț",
    kind: "Bucătărie",
    description:
      "Configurația pe colț maximizează fiecare unghi, oferind spații generoase de depozitare.",
    href: "https://mobo.md/proiectele-realizate/bucatarii/bucatarie-moderna-pe-colt/",
    image: PHOTO.kitchenTall,
  },
  {
    slug: "bucatarie-moderna-liniara",
    title: "Bucătărie modernă liniară",
    kind: "Bucătărie",
    description:
      "Un design compact și bine organizat, care optimizează fiecare centimetru de spațiu.",
    href: "https://mobo.md/proiectele-realizate/bucatarii/bucatarie-moderna-liniara/",
    image: PHOTO.kitchenWide,
  },
  {
    slug: "mobila-living-minimalism-in-contrast",
    title: "Living «Minimalism în Contrast»",
    kind: "Living",
    description:
      "O atmosferă modernă și sofisticată, definită de linii curate și materiale premium.",
    href: "https://mobo.md/proiectele-realizate/mobilier-living/mobila-living-minimalism-in-contrast/",
    image: PHOTO.living,
  },
  {
    slug: "mobila-living-simplitate-eleganta",
    title: "Living «Simplitate Elegantă»",
    kind: "Living",
    description:
      "Redefinește minimalismul modern prin utilizarea texturilor și culorilor naturale.",
    href: "https://mobo.md/proiectele-realizate/mobilier-living/mobila-living-simplitate-eleganta/",
    image: PHOTO.livingTall,
  },
];

export const PROJECTS_INDEX_HREF = "https://mobo.md/proiectele-realizate/";

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

export const ADVANTAGES = [
  "Proiect 3D al viitorului mobilier, înainte de orice decizie.",
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
