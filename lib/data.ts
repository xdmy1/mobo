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
  tagline: "Mobilier la comandă pentru toată casa",
  logo: "https://mobo.md/wp-content/uploads/2024/09/logomobo.png",
  logoWidth: 500,
  logoHeight: 172,
  phone: "+373 60 331 331",
  phoneHref: "tel:+37360331331",
  email: "info@mobo.md",
  address: "stradela Studenților 15A, Chișinău",
  calculator: "https://calculator.mobo.md",
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

export const NAV_LINKS = [
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
 * Datele vin de pe mobo.md: cele cinci proiecte pe străzi publicate în 2026,
 * fiecare cu ședința lui foto completă (34–77 de cadre, toate portret 2:3).
 * `gallery` este selecția pentru filmstrip — primele 12 cadre în ordinea în
 * care le publică site-ul (prima e coperta); `photoCount` e numărul real de
 * fotografii unice ale ședinței, afișat ca un credit, nu inventat.
 */
export type Project = {
  slug: string;
  title: string;
  /** O propoziție despre ce arată coperta — legenda cardului. */
  blurb: string;
  /** Numărul real de cadre din ședința foto completă de pe mobo.md. */
  photoCount: number;
  href: string;
  cover: string;
  gallery: string[];
};

const UPLOADS = "https://mobo.md/wp-content/uploads/";

function project(
  slug: string,
  title: string,
  blurb: string,
  photoCount: number,
  shots: string[],
): Project {
  const gallery = shots.map((shot) => UPLOADS + shot);
  return { slug, title, blurb, photoCount, href: `/proiecte/${slug}`, cover: gallery[0], gallery };
}

export const PROJECTS: Project[] = [
  project(
    "str-universitatii",
    "Strada Universității",
    "Dressing cu fronturi din furnir de nuc și uși glisante din sticlă riflată.",
    51,
    [
      "2026/05/DSC_7958.jpg",
      "2026/05/DSC_7960.jpg",
      "2026/05/DSC_7962.jpg",
      "2026/05/DSC_7966.jpg",
      "2026/05/DSC_7965.jpg",
      "2026/05/DSC_7968.jpg",
      "2026/05/DSC_7970.jpg",
      "2026/05/DSC_7971.jpg",
      "2026/05/DSC_7981.jpg",
      "2026/05/DSC_7983.jpg",
      "2026/05/DSC_7984.jpg",
      "2026/05/DSC_7986.jpg",
    ],
  ),
  project(
    "str-bucovina",
    "Strada Bucovinei",
    "Baie cu lavoar din piatră cu aspect de marmură și corp suspendat negru mat.",
    64,
    [
      "2026/05/DSC_3977.jpg",
      "2026/05/DSC_3920.jpg",
      "2026/05/DSC_3921.jpg",
      "2026/05/DSC_3922.jpg",
      "2026/05/DSC_3923.jpg",
      "2026/05/DSC_3926.jpg",
      "2026/05/DSC_3931.jpg",
      "2026/05/DSC_3941.jpg",
      "2026/05/DSC_3944.jpg",
      "2026/05/DSC_3955.jpg",
      "2026/05/DSC_3964.jpg",
      "2026/05/DSC_3970.jpg",
    ],
  ),
  project(
    "str-miorita",
    "Strada Miorița",
    "Antreu alb cu dulap până în tavan și mânere profil din lemn.",
    77,
    [
      "2026/05/DSC_3702.jpg",
      "2026/05/DSC_3706.jpg",
      "2026/05/DSC_3707.jpg",
      "2026/05/DSC_3709.jpg",
      "2026/05/DSC_3712.jpg",
      "2026/05/DSC_3716.jpg",
      "2026/05/DSC_3718.jpg",
      "2026/05/DSC_3719.jpg",
      "2026/05/DSC_3724.jpg",
      "2026/05/DSC_3726.jpg",
      "2026/05/DSC_3732.jpg",
      "2026/05/DSC_3736.jpg",
    ],
  ),
  project(
    "str-ialoveni",
    "Strada Ialoveni",
    "Bucătărie crem pe colț, cu accente negre și candelabru din sticlă fumurie.",
    34,
    [
      "2026/05/DSC_9266.jpg",
      "2026/05/DSC_9269.jpg",
      "2026/05/DSC_9276.jpg",
      "2026/05/DSC_9279.jpg",
      "2026/05/DSC_9283.jpg",
      "2026/05/DSC_9285.jpg",
      "2026/05/DSC_9290.jpg",
      "2026/05/DSC_9292.jpg",
      "2026/05/DSC_9297.jpg",
      "2026/05/DSC_9305.jpg",
      "2026/05/DSC_9312.jpg",
      "2026/05/DSC_9318.jpg",
    ],
  ),
  project(
    "str-valentin-rosca",
    "Strada Valentin Roșca",
    "Birou acasă — dulap alb cu fronturi riflate și masă de lucru din nuc.",
    68,
    [
      "2026/05/Z61_4807.jpg",
      "2026/05/Z61_4810.jpg",
      "2026/05/Z61_4814.jpg",
      "2026/05/Z61_4821.jpg",
      "2026/05/Z61_4822.jpg",
      "2026/05/Z61_4824.jpg",
      "2026/05/Z61_4833.jpg",
      "2026/05/Z61_4836.jpg",
      "2026/05/Z61_4837.jpg",
      "2026/05/Z61_4839.jpg",
      "2026/05/Z61_4843.jpg",
      "2026/05/Z61_4845.jpg",
    ],
  ),
];

export const PROJECTS_INDEX_HREF = "/proiecte";

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

/* ------------------------------------------------------- Pagina Servicii -- */

/**
 * Descrierile extinse ale celor 9 etape, pentru pagina /servicii. Aliniate prin
 * index cu PROCESS — conținutul e preluat de pe mobo.md/servicii, unde fiecare
 * etapă are un paragraf întreg, nu doar rezumatul de pe homepage.
 */
export const SERVICE_DETAILS: string[] = [
  "Fiecare proiect începe cu o discuție personalizată, la showroom sau la telefon. Analizăm împreună spațiul, stilul dorit și bugetul disponibil, ca să identificăm din start materialele și soluțiile potrivite pentru tine.",
  "Echipa noastră vine la fața locului și ia măsurători exacte cu echipament modern. Fiecare centimetru contează: corpurile, blaturile și spațiile de depozitare trebuie să se integreze perfect în încăpere.",
  "Designerii noștri transformă măsurătorile într-un proiect 3D detaliat, cu randări realiste. Vezi mobilierul în spațiul tău înainte de orice decizie — configurație, culori, sisteme de depozitare inteligente.",
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
