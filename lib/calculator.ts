/**
 * Motorul de preț al calculatorului — FORMULA REALĂ a MOBO, nu una inventată.
 *
 * Proveniență (2026-09-04): calculatorul existent de pe calculator.mobo.md e un
 * React SPA care își ia prețurile din https://crm.mobo.md/api/settings și
 * calculează:
 *
 *   arie      = lungime(m) × înălțime(m)
 *   corp      = arie × preț_pal[brand][finisaj]   (bucătărie cu adâncime 900: ×1.5;
 *               premium cu finisaj ≠ alb: preț ×1.8)
 *   fațadă    = arie × 1.5 × preț_front[material]
 *   sertare   = Σ preț_sertar[brand][tip] × buc   (premium metal: ×2)
 *   mecanisme = Σ preț_mecanism[model] × buc
 *   organiz.  = Σ preț_storex[model] × buc        (doar garderobă/dulap)
 *   blat      = m² × preț_blat[brand]             (doar bucătărie)
 *   formă     = adaos fix pe forma bucătăriei
 *   TOTAL     = round((start[tip][mod] + Σ toate) × coef[tip])
 *
 * Formula a fost decodată din bundle-ul JS al calculatorului vechi (autorul nu
 * mai e disponibil, Iurii nu ține minte formulele) și verificată pe valorile
 * live. O singură corecție deliberată față de vechiul cod: finisajul „color"
 * folosea din greșeală prețul „lemn" deși cheile *_color există în CRM — aici
 * color folosește prețul color.
 *
 * Prețurile de mai jos sunt SNAPSHOT-ul valorilor live din CRM (2026-09-04).
 * Pagina /calculator încearcă la fiecare request (cu cache de o oră) să ia
 * valorile proaspete din același CRM — deci Iurii le editează într-un singur
 * loc și ambele calculatoare rămân sincronizate; snapshot-ul e plasa de
 * siguranță când CRM-ul nu răspunde.
 */

import type { StaticImageData } from "next/image";
import type { Lang } from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/dictionary";

/**
 * Bilingv: fiecare opțiune poartă DOUĂ etichete.
 *
 * `label` / `blurb` sunt textele ROMÂNEȘTI și rămân sursa pentru `summarize()`,
 * adică pentru `_wizardQuote`-ul din CRM — echipa MOBO citește CRM-ul în
 * română, indiferent în ce limbă a configurat vizitatorul. Nu le traduce.
 *
 * `labelKey` / `blurbKey` sunt cheile de dicționar pentru ECRAN; componenta
 * (client, are context) face `t(option.labelKey)`. Modulul ăsta nu importă
 * dicționarul — doar tipul cheilor, ca o cheie greșită să pice la compilare.
 */

/* Fiecare opțiune vizuală poartă o fotografie REALĂ din ședințele proiectelor —
   nu stock, nu randări: cardul de „furnir" chiar arată furnirul montat de MOBO
   într-o casă. Alegerea cadrelor e făcută vizual, material cu material. */
import mioBucatarie01 from "@/assets/proiecte/str-miorita/bucatarie-01.jpg";
import mioBaie01 from "@/assets/proiecte/str-miorita/baie-01.jpg";
import mioLiving02 from "@/assets/proiecte/str-miorita/living-02.jpg";
import ialBucatarie01 from "@/assets/proiecte/str-ialoveni/bucatarie-01.jpg";
import ialBucatarie02 from "@/assets/proiecte/str-ialoveni/bucatarie-02.jpg";
import csBucatarie01 from "@/assets/proiecte/str-constantin-stere/bucatarie-01.jpg";
import csBucatarie04 from "@/assets/proiecte/str-constantin-stere/bucatarie-04.jpg";
import csBucatarie07 from "@/assets/proiecte/str-constantin-stere/bucatarie-07.jpg";
import uniBucatarie01 from "@/assets/proiecte/str-universitatii/bucatarie-01.jpg";
import uniDormitor08 from "@/assets/proiecte/str-universitatii/dormitor-08.jpg";
import uniAntreu01 from "@/assets/proiecte/str-universitatii/antreu-01.jpg";
import uniAntreu04 from "@/assets/proiecte/str-universitatii/antreu-04.jpg";
import bucDressing01 from "@/assets/proiecte/str-bucovina/dressing-01.jpg";
import bucAntreu01 from "@/assets/proiecte/str-bucovina/antreu-01.jpg";
import bucAntreu04 from "@/assets/proiecte/str-bucovina/antreu-04.jpg";
import bucBucatarie01 from "@/assets/proiecte/str-bucovina/bucatarie-01.jpg";
import vrBirou01 from "@/assets/proiecte/str-valentin-rosca/birou-01.jpg";
import vrDressing01 from "@/assets/proiecte/str-valentin-rosca/dressing-01.jpg";
/* Feronerie și fronturi fotografiate pe montajele MOBO — trimise de client
   (2026-09-10) special pentru pașii Sertare / Mecanisme / Furnir frezat. */
import calcBlumLemn from "@/assets/calculator/blum-lemn.jpg";
import calcBlumMetal from "@/assets/calculator/blum-metal.jpg";
import calcHettichLemn from "@/assets/calculator/hettich-lemn.jpg";
import calcHettichMetal from "@/assets/calculator/hettich-metal.jpg";
import calcAventosHkXs from "@/assets/calculator/aventos-hk-xs.jpg";
import calcAventosHf from "@/assets/calculator/aventos-hf.jpg";
import calcColtKessebohmer from "@/assets/calculator/colt-kessebohmer.jpg";
import calcFurnirRiflat from "@/assets/calculator/furnir-riflat.jpg";

export const CRM_SETTINGS_URL = "https://crm.mobo.md/api/settings";

/** CRM-ul întoarce numere simple azi; tolerăm și forma {value} din vechiul cod. */
export type CalcSettings = Record<string, unknown>;

export const SETTINGS_SNAPSHOT: Record<string, number> = {
  eurExchangeRate: 20.038,

  start_bucatarie_std: 15000,
  start_bucatarie_prem: 19000,
  start_garderoba_std: 6000,
  start_garderoba_prem: 9000,
  start_dulap_std: 6000,
  start_dulap_prem: 9000,
  start_pieseMici_std: 1500,
  start_pieseMici_prem: 2000,

  coef_bucatarie: 2.3,
  coef_garderoba: 2.1,
  coef_dulap: 2.2,
  coef_pieseMici: 2.5,

  price_forma_dreapta: 1000,
  price_forma_colt: 2000,
  price_forma_u: 3000,
  price_forma_bar: 4000,
  price_forma_insula: 5000,

  price_pal_krono_alb: 150,
  price_pal_krono_color: 180,
  price_pal_krono_lemn: 200,
  price_pal_egger_alb: 200,
  price_pal_egger_color: 250,
  price_pal_egger_lemn: 280,

  price_front_pal: 250,
  price_front_agt_1: 650,
  price_front_agt_2: 750,
  price_front_mdf_1: 1800,
  price_front_mdf_2: 2040,
  price_front_front_sticla: 2500,
  price_front_front_oglinda: 2700,
  price_front_furnir: 2800,
  price_front_furnir_2: 3200,
  price_front_furnir_riflat: 3600,

  price_sertar_blum_lemn: 380,
  price_sertar_blum_metal: 1100,
  price_sertar_hettich_lemn: 350,
  price_sertar_hettich_metal: 750,

  price_mecanism_blum_aventos_hk_xs: 400,
  price_mecanism_blum_piston_gaz: 2100,
  price_mecanism_blum: 2200,
  price_mecanism_hettich: 380,
  price_mecanism_kesslohmer: 3600,

  price_storex_incaltaminte_8: 6100,
  price_storex_incaltaminte_12: 7050,
  price_storex_pantaloni_600: 2300,
  price_storex_pantaloni_800: 2650,
  price_storex_pantaloni_900: 3000,
  price_storex_pantograf: 2333,

  price_blat_pal_egger: 300,
  price_blat_hpl_negru: 2070,
  price_blat_hpl_alb: 3800,
};

/* ------------------------------------------------------------- vocabular -- */

export type Mode = "standart" | "premium";
export type FurnitureType = "bucatarie" | "garderoba" | "dulap" | "pieseMici";
export type KitchenShape = "dreapta" | "colt" | "u" | "bar" | "insula";
/* Client, 2026-09-05: fără Krono și fără pasul de finisaj — corpul e una din
   două plăci Egger. Valoarea e chiar sufixul cheii de preț price_pal_*. */
export type CorpChoice = "egger_alb" | "egger_color";

export type PhotoOption<V extends string = string> = {
  value: V;
  /** Română — pleacă spre CRM prin `summarize()`. */
  label: string;
  /** Cheia de dicționar pentru afișare. */
  labelKey: TranslationKey;
  blurb: string;
  blurbKey: TranslationKey;
  /** Cadru real dintr-un proiect MOBO — vezi blocul de importuri de mai sus. */
  image: StaticImageData;
  /** Cadru separat pentru bannerul din pasul „Estimarea ta" (dacă diferă de card). */
  resultImage?: StaticImageData;
};

export const MODE_OPTIONS: PhotoOption<Mode>[] = [
  {
    value: "standart",
    label: "Standart",
    labelKey: "calc.mode.standart",
    blurb: "Materiale verificate și feronerie de bază — cel mai accesibil punct de pornire.",
    blurbKey: "calc.mode.standart.blurb",
    image: mioBucatarie01,
  },
  {
    value: "premium",
    label: "Premium",
    labelKey: "calc.mode.premium",
    blurb: "Plăci și mecanisme din gamele înalte, finisaje speciale, execuție de vitrină.",
    blurbKey: "calc.mode.premium.blurb",
    /* Client, 2026-09-10: aici stă bucătăria de pe strada Universității. */
    image: uniBucatarie01,
  },
];

/* Cadrele pe tipuri — alese de client (2026-09-10): bucătăria pe un cadru unde
   se vede mobilierul, nu masa; garderoba e dulapul cu uși de sticlă de la
   Bucovinei; dulapul e dulapul alb riflat de la Valentin Roșca; piesele mici —
   masa de machiaj de la Miorița. Bannerul din pasul final are cadru propriu. */
export const TYPE_OPTIONS: (PhotoOption<FurnitureType> & {
  /** Forma de mic, pentru fraza „… la comandă" de sub bannerul final. */
  lowerKey: TranslationKey;
})[] = [
  {
    value: "bucatarie",
    label: "Bucătărie",
    labelKey: "calc.type.bucatarie",
    lowerKey: "calc.type.bucatarie.lower",
    blurb: "Corpuri jos și sus, pe forma spațiului tău.",
    blurbKey: "calc.type.bucatarie.blurb",
    image: csBucatarie01,
    resultImage: ialBucatarie02,
  },
  {
    value: "garderoba",
    label: "Garderobă",
    labelKey: "calc.type.garderoba",
    lowerKey: "calc.type.garderoba.lower",
    blurb: "Cameră de haine organizată la centimetru, cu uși sau deschisă.",
    blurbKey: "calc.type.garderoba.blurb",
    image: bucAntreu01,
  },
  {
    value: "dulap",
    label: "Dulap",
    labelKey: "calc.type.dulap",
    lowerKey: "calc.type.dulap.lower",
    blurb: "Dulap închis, până în tavan, cu uși batante sau glisante.",
    blurbKey: "calc.type.dulap.blurb",
    image: vrBirou01,
  },
  {
    value: "pieseMici",
    label: "Piese mici",
    labelKey: "calc.type.pieseMici",
    lowerKey: "calc.type.pieseMici.lower",
    blurb: "Comodă, noptiere, masă de machiaj, corpuri singulare.",
    blurbKey: "calc.type.pieseMici.blurb",
    image: mioLiving02,
  },
];

export const SHAPE_OPTIONS: { value: KitchenShape; label: string; labelKey: TranslationKey }[] = [
  { value: "dreapta", label: "În linie dreaptă", labelKey: "calc.shape.dreapta" },
  { value: "colt", label: "Pe colț", labelKey: "calc.shape.colt" },
  { value: "u", label: "În formă de U", labelKey: "calc.shape.u" },
  { value: "bar", label: "Cu masă de bar", labelKey: "calc.shape.bar" },
  { value: "insula", label: "Cu insulă", labelKey: "calc.shape.insula" },
];

export const CORP_OPTIONS: {
  value: CorpChoice;
  label: string;
  labelKey: TranslationKey;
  blurb: string;
  blurbKey: TranslationKey;
}[] = [
  {
    value: "egger_alb",
    label: "Egger — placă albă standard",
    labelKey: "calc.corp.egger_alb",
    blurb: "Plăci austriece Egger, interior alb clasic.",
    blurbKey: "calc.corp.egger_alb.blurb",
  },
  {
    value: "egger_color",
    label: "Egger — placă în culoare premium",
    labelKey: "calc.corp.egger_color",
    blurb: "Aceleași plăci Egger, în decorurile colorate din gama premium.",
    blurbKey: "calc.corp.egger_color.blurb",
  },
];

/** id = sufixul cheii price_front_* din CRM. */
export const FRONT_OPTIONS: PhotoOption[] = [
  {
    value: "pal",
    label: "PAL",
    labelKey: "calc.front.pal",
    blurb: "Fronturi din plăci decorate — soluția accesibilă.",
    blurbKey: "calc.front.pal.blurb",
    image: bucDressing01,
  },
  {
    value: "agt_1",
    label: "AGT — fronturi drepte",
    labelKey: "calc.front.agt_1",
    blurb: "Panouri MDF cu suprafață netedă, plăcate pe o parte.",
    blurbKey: "calc.front.agt_1.blurb",
    /* Client, 2026-09-10: un cadru mai apropiat de bucătărie. */
    image: csBucatarie07,
  },
  {
    value: "agt_2",
    label: "AGT — plăcat pe ambele părți",
    labelKey: "calc.front.agt_2",
    blurb: "Aceleași panouri MDF netede, plăcate față-verso.",
    blurbKey: "calc.front.agt_2.blurb",
    image: uniDormitor08,
  },
  {
    value: "mdf_1",
    label: "MDF vopsit",
    labelKey: "calc.front.mdf_1",
    blurb: "Vopsit în orice culoare, față netedă.",
    blurbKey: "calc.front.mdf_1.blurb",
    image: mioBaie01,
  },
  {
    value: "mdf_2",
    label: "MDF vopsit cu freză",
    labelKey: "calc.front.mdf_2",
    blurb: "Vopsit, cu frezări și orice formă la comandă.",
    blurbKey: "calc.front.mdf_2.blurb",
    image: vrDressing01,
  },
  {
    value: "front_sticla",
    label: "Sticlă",
    labelKey: "calc.front.front_sticla",
    blurb: "Fronturi cu sticlă fumurie, în ramă de aluminiu.",
    blurbKey: "calc.front.front_sticla.blurb",
    /* Vitrina fumurie de la Constantin Stere — cadrul de la Bucovinei a plecat
       pe cardul „Garderobă", la cererea clientului. */
    image: csBucatarie04,
  },
  {
    value: "front_oglinda",
    label: "Oglindă",
    labelKey: "calc.front.front_oglinda",
    blurb: "Uși cu oglindă în ramă de aluminiu.",
    blurbKey: "calc.front.front_oglinda.blurb",
    image: bucAntreu04,
  },
  {
    value: "furnir",
    label: "Furnir",
    labelKey: "calc.front.furnir",
    blurb: "Lemn adevărat, placat pe fiecare front.",
    blurbKey: "calc.front.furnir.blurb",
    image: uniAntreu01,
  },
  {
    /* Cheia CRM rămâne furnir_riflat; eticheta e cea dictată de client. */
    value: "furnir_riflat",
    label: "Furnir frezat",
    labelKey: "calc.front.furnir_riflat",
    blurb: "Lemn adevărat, placat sub orice formă.",
    blurbKey: "calc.front.furnir_riflat.blurb",
    image: calcFurnirRiflat,
  },
];

/** Id-urile de glife desenate inline în componenta calculatorului. */
export type CalcIcon =
  | "drawer"
  | "drawer-metal"
  | "flap"
  | "fold"
  | "slide"
  | "corner"
  | "shoe"
  | "trousers"
  | "pantograph";

/** Sertare: brand × construcție, prețul per bucată din price_sertar_*.
    Fotografiile sunt sistemele montate în bucătăriile MOBO (client, 2026-09-10). */
export const DRAWER_OPTIONS: {
  brand: "blum" | "hettich";
  type: "lemn" | "metal";
  label: string;
  labelKey: TranslationKey;
  icon: CalcIcon;
  image: StaticImageData;
}[] = [
  {
    brand: "blum",
    type: "lemn",
    label: "Blum — laterale din lemn",
    labelKey: "calc.drawer.blum_lemn",
    icon: "drawer",
    image: calcBlumLemn,
  },
  {
    brand: "blum",
    type: "metal",
    label: "Blum — laterale metalice",
    labelKey: "calc.drawer.blum_metal",
    icon: "drawer-metal",
    image: calcBlumMetal,
  },
  {
    brand: "hettich",
    type: "lemn",
    label: "Hettich — laterale din lemn",
    labelKey: "calc.drawer.hettich_lemn",
    icon: "drawer",
    image: calcHettichLemn,
  },
  {
    brand: "hettich",
    type: "metal",
    label: "Hettich — laterale metalice",
    labelKey: "calc.drawer.hettich_metal",
    icon: "drawer-metal",
    image: calcHettichMetal,
  },
];

/**
 * id = sufixul cheii price_mecanism_* din CRM. `types` = tipurile de mobilier
 * la care mecanismul are sens — clarificare de client (2026-09-05): sistemele
 * Aventos și colțurile sunt de bucătărie, nu apar la piese mici; glisarea e a
 * dulapurilor și garderobelor.
 */
export const MECHANISM_OPTIONS: {
  value: string;
  label: string;
  labelKey: TranslationKey;
  blurb: string;
  blurbKey: TranslationKey;
  icon: CalcIcon;
  types: FurnitureType[];
  /** Sistemul fotografiat pe un montaj MOBO; glisarea rămâne pe glifă. */
  image?: StaticImageData;
}[] = [
  {
    value: "blum_aventos_hk_xs",
    label: "Blum Aventos HK-XS",
    labelKey: "calc.mech.blum_aventos_hk_xs",
    blurb: "Ridicare pentru fronturi mici.",
    blurbKey: "calc.mech.blum_aventos_hk_xs.blurb",
    icon: "flap",
    types: ["bucatarie"],
    image: calcAventosHkXs,
  },
  {
    value: "blum_piston_gaz",
    label: "Blum Aventos HF",
    labelKey: "calc.mech.blum_piston_gaz",
    blurb: "Front pliant pentru corpurile de sus.",
    blurbKey: "calc.mech.blum_piston_gaz.blurb",
    icon: "fold",
    types: ["bucatarie"],
    image: calcAventosHf,
  },
  /* Aventos HS/HL (cheia „blum") a ieșit din listă — client, 2026-09-10:
     „se foloseste rar". Cheia de preț rămâne în CRM, doar nu o mai oferim. */
  {
    value: "hettich",
    label: "Glisare Hettich",
    labelKey: "calc.mech.hettich",
    blurb: "TopLine / WingLine pentru uși glisante.",
    blurbKey: "calc.mech.hettich.blurb",
    icon: "slide",
    types: ["garderoba", "dulap"],
  },
  {
    value: "kesslohmer",
    label: "Colț Kessebohmer",
    labelKey: "calc.mech.kesslohmer",
    blurb: "Sisteme extractibile pentru corpul de colț.",
    blurbKey: "calc.mech.kesslohmer.blurb",
    icon: "corner",
    types: ["bucatarie"],
    image: calcColtKessebohmer,
  },
];

/** Mecanismele valabile pentru un tip de mobilier; piese mici = niciunul. */
export function mechanismsFor(type: FurnitureType) {
  return MECHANISM_OPTIONS.filter((option) => option.types.includes(type));
}

/** id = sufixul cheii price_storex_* din CRM. */
export const ORGANIZER_OPTIONS: {
  value: string;
  label: string;
  labelKey: TranslationKey;
  blurb: string;
  blurbKey: TranslationKey;
  icon: CalcIcon;
}[] = [
  {
    value: "incaltaminte_8",
    label: "Suport încălțăminte",
    labelKey: "calc.organizer.incaltaminte_8",
    blurb: "8 rafturi extractibile.",
    blurbKey: "calc.organizer.incaltaminte_8.blurb",
    icon: "shoe",
  },
  {
    value: "incaltaminte_12",
    label: "Suport încălțăminte",
    labelKey: "calc.organizer.incaltaminte_12",
    blurb: "12 rafturi extractibile.",
    blurbKey: "calc.organizer.incaltaminte_12.blurb",
    icon: "shoe",
  },
  {
    value: "pantaloni_600",
    label: "Suport pantaloni",
    labelKey: "calc.organizer.pantaloni_600",
    blurb: "Lățime 600 mm.",
    blurbKey: "calc.organizer.pantaloni_600.blurb",
    icon: "trousers",
  },
  {
    value: "pantaloni_800",
    label: "Suport pantaloni",
    labelKey: "calc.organizer.pantaloni_800",
    blurb: "Lățime 800 mm.",
    blurbKey: "calc.organizer.pantaloni_800.blurb",
    icon: "trousers",
  },
  {
    value: "pantaloni_900",
    label: "Suport pantaloni",
    labelKey: "calc.organizer.pantaloni_900",
    blurb: "Lățime 900 mm.",
    blurbKey: "calc.organizer.pantaloni_900.blurb",
    icon: "trousers",
  },
  {
    value: "pantograf",
    label: "Pantograf",
    labelKey: "calc.organizer.pantograf",
    blurb: "Bara de haine coboară la tine.",
    blurbKey: "calc.organizer.pantograf.blurb",
    icon: "pantograph",
  },
];

/** id = sufixul cheii price_blat_* din CRM. */
export const COUNTERTOP_OPTIONS: PhotoOption[] = [
  {
    value: "pal_egger",
    label: "PAL Egger",
    labelKey: "calc.top.pal_egger",
    blurb: "Blat stratificat, decoruri Egger.",
    blurbKey: "calc.top.pal_egger.blurb",
    image: uniAntreu04,
  },
  {
    value: "hpl_negru",
    label: "HPL compact negru",
    labelKey: "calc.top.hpl_negru",
    blurb: "Miez negru, muchie fină — 12 mm.",
    blurbKey: "calc.top.hpl_negru.blurb",
    image: bucBucatarie01,
  },
  {
    value: "hpl_alb",
    label: "HPL compact alb",
    labelKey: "calc.top.hpl_alb",
    blurb: "Miez alb, aspect de piatră — 12 mm.",
    blurbKey: "calc.top.hpl_alb.blurb",
    image: ialBucatarie01,
  },
];

/* ---------------------------------------------------------- configurația -- */

export type CalcConfig = {
  mode: Mode;
  type: FurnitureType;
  shape: KitchenShape;
  /** Metri liniari — singurul câmp fără de care nu există preț. */
  lengthM: number;
  /** Metri; 2.6 e înălțimea implicită de tavan din vechiul calculator. */
  heightM: number;
  /** Adâncimea corpurilor de bucătărie; 900 scumpește corpul cu 50%. */
  depth: 600 | 900;
  corp: CorpChoice;
  front: string;
  /** brand_tip → bucăți. */
  drawers: Record<string, number>;
  mechanisms: Record<string, number>;
  organizers: Record<string, number>;
  countertop: { brand: string; m2: number };
};

export const DEFAULT_CONFIG: CalcConfig = {
  mode: "standart",
  type: "bucatarie",
  shape: "dreapta",
  lengthM: 0,
  heightM: 2.6,
  depth: 600,
  corp: "egger_alb",
  front: "agt_1",
  drawers: {},
  mechanisms: {},
  organizers: {},
  countertop: { brand: "hpl_negru", m2: 0 },
};

export function hasOrganizers(type: FurnitureType): boolean {
  return type === "garderoba" || type === "dulap";
}

export function hasCountertop(type: FurnitureType): boolean {
  return type === "bucatarie";
}

/* --------------------------------------------------------------- formula -- */

function num(settings: CalcSettings, key: string): number {
  const raw = settings[key];
  const value =
    raw !== null && typeof raw === "object" && "value" in raw
      ? (raw as { value?: unknown }).value
      : raw;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function estimatePrice(settings: CalcSettings, cfg: CalcConfig): number {
  if (!(cfg.lengthM > 0)) return 0;

  const area = cfg.lengthM * cfg.heightM;
  let sum = 0;

  /* Corpul. */
  let corpRate = num(settings, `price_pal_${cfg.corp}`);
  if (cfg.mode === "premium" && cfg.corp !== "egger_alb") corpRate *= 1.8;
  sum += area * (cfg.type === "bucatarie" && cfg.depth === 900 ? 1.5 : 1) * corpRate;

  /* Fațada — aria fronturilor e estimată la 1.5 × aria corpului. */
  sum += area * 1.5 * num(settings, `price_front_${cfg.front}`);

  /* Sertarele. */
  for (const option of DRAWER_OPTIONS) {
    const qty = cfg.drawers[`${option.brand}_${option.type}`] ?? 0;
    if (qty <= 0) continue;
    let rate = num(settings, `price_sertar_${option.brand}_${option.type}`);
    if (cfg.mode === "premium" && option.type === "metal") rate *= 2;
    sum += rate * qty;
  }

  /* Mecanismele. */
  for (const option of MECHANISM_OPTIONS) {
    const qty = cfg.mechanisms[option.value] ?? 0;
    if (qty > 0) sum += num(settings, `price_mecanism_${option.value}`) * qty;
  }

  /* Organizatoarele — doar garderobă și dulap. */
  if (hasOrganizers(cfg.type)) {
    for (const option of ORGANIZER_OPTIONS) {
      const qty = cfg.organizers[option.value] ?? 0;
      if (qty > 0) sum += num(settings, `price_storex_${option.value}`) * qty;
    }
  }

  /* Blatul — doar bucătărie. */
  if (hasCountertop(cfg.type) && cfg.countertop.m2 > 0) {
    sum += cfg.countertop.m2 * num(settings, `price_blat_${cfg.countertop.brand}`);
  }

  /* Forma bucătăriei. */
  if (cfg.type === "bucatarie") sum += num(settings, `price_forma_${cfg.shape}`);

  const start = num(settings, `start_${cfg.type}_${cfg.mode === "premium" ? "prem" : "std"}`);
  const coef = num(settings, `coef_${cfg.type}`) || 1;

  return Math.round((start + sum) * coef);
}

export function estimateEur(settings: CalcSettings, mdl: number): number {
  const rate = num(settings, "eurExchangeRate") || 20;
  return Math.round(mdl / rate);
}

/** Locala de numere pentru fiecare limbă a site-ului. */
const NUMBER_LOCALE: Record<Lang, string> = { ro: "ro-RO", ru: "ru-RU" };

/**
 * Formatarea sumelor PENTRU ECRAN.
 *
 * Ambele locale grupează miile cu spațiu, deci azi ieșirea e practic identică —
 * dar cifrele rămân corecte dacă vreuna dintre convenții se schimbă. Ce pleacă
 * spre CRM nu trece pe aici: acolo suma e un număr, formatat în română pe
 * server (`app/api/calculator-lead/route.ts`).
 */
export function formatMdl(value: number, lang: Lang = "ro"): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[lang]).format(value);
}

/**
 * Rezumatul configurației PENTRU CRM — rândurile astea ajung în `_wizardQuote`
 * și le citește echipa MOBO, care lucrează în română. Rămâne românesc chiar
 * dacă vizitatorul a configurat în rusă; varianta de pe ecran se construiește
 * separat, din dicționar, în `components/sections/Calculator.tsx`.
 */
export function summarize(cfg: CalcConfig): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [
    { label: "Mod", value: MODE_OPTIONS.find((o) => o.value === cfg.mode)?.label ?? cfg.mode },
    { label: "Tip", value: TYPE_OPTIONS.find((o) => o.value === cfg.type)?.label ?? cfg.type },
  ];

  if (cfg.type === "bucatarie") {
    rows.push({
      label: "Formă",
      value: SHAPE_OPTIONS.find((o) => o.value === cfg.shape)?.label ?? cfg.shape,
    });
  }

  rows.push({
    label: "Dimensiuni",
    value:
      `${cfg.lengthM} m lungime × ${cfg.heightM} m înălțime` +
      (cfg.type === "bucatarie" ? `, adâncime ${cfg.depth} mm` : ""),
  });

  rows.push({
    label: "Corp",
    value: CORP_OPTIONS.find((o) => o.value === cfg.corp)?.label ?? cfg.corp,
  });

  rows.push({
    label: "Fațadă",
    value: FRONT_OPTIONS.find((o) => o.value === cfg.front)?.label ?? cfg.front,
  });

  const drawers = DRAWER_OPTIONS.filter((o) => (cfg.drawers[`${o.brand}_${o.type}`] ?? 0) > 0)
    .map((o) => `${o.label} ×${cfg.drawers[`${o.brand}_${o.type}`]}`)
    .join(", ");
  rows.push({ label: "Sertare", value: drawers || "—" });

  const mechanisms = MECHANISM_OPTIONS.filter((o) => (cfg.mechanisms[o.value] ?? 0) > 0)
    .map((o) => `${o.label} ×${cfg.mechanisms[o.value]}`)
    .join(", ");
  rows.push({ label: "Mecanisme", value: mechanisms || "—" });

  if (hasOrganizers(cfg.type)) {
    const organizers = ORGANIZER_OPTIONS.filter((o) => (cfg.organizers[o.value] ?? 0) > 0)
      .map((o) => `${o.label} (${o.blurb.replace(/\.$/, "")}) ×${cfg.organizers[o.value]}`)
      .join(", ");
    rows.push({ label: "Organizatoare", value: organizers || "—" });
  }

  if (hasCountertop(cfg.type)) {
    rows.push({
      label: "Blat",
      value:
        cfg.countertop.m2 > 0
          ? `${COUNTERTOP_OPTIONS.find((o) => o.value === cfg.countertop.brand)?.label}, ${cfg.countertop.m2} m²`
          : "—",
    });
  }

  return rows;
}
