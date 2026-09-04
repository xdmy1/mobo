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
export type CorpBrand = "krono" | "egger";
export type CorpFinish = "alb" | "color" | "lemn";

export const MODE_OPTIONS: { value: Mode; label: string; blurb: string }[] = [
  {
    value: "standart",
    label: "Standart",
    blurb: "Materiale verificate și feronerie de bază — cel mai accesibil punct de pornire.",
  },
  {
    value: "premium",
    label: "Premium",
    blurb: "Plăci și mecanisme din gamele înalte, finisaje speciale, execuție de vitrină.",
  },
];

export const TYPE_OPTIONS: { value: FurnitureType; label: string; blurb: string }[] = [
  { value: "bucatarie", label: "Bucătărie", blurb: "Corpuri jos și sus, pe forma spațiului tău." },
  { value: "garderoba", label: "Garderobă", blurb: "Cameră de haine deschisă, organizată la centimetru." },
  { value: "dulap", label: "Dulap", blurb: "Dulap închis, până în tavan, cu uși batante sau glisante." },
  { value: "pieseMici", label: "Piese mici", blurb: "Comodă, noptiere, masă TV, corpuri singulare." },
];

export const SHAPE_OPTIONS: { value: KitchenShape; label: string }[] = [
  { value: "dreapta", label: "În linie dreaptă" },
  { value: "colt", label: "Pe colț" },
  { value: "u", label: "În formă de U" },
  { value: "bar", label: "Cu masă de bar" },
  { value: "insula", label: "Cu insulă" },
];

export const CORP_BRAND_OPTIONS: { value: CorpBrand; label: string; blurb: string }[] = [
  { value: "krono", label: "Krono", blurb: "Plăci verificate, raport corect preț–calitate." },
  { value: "egger", label: "Egger", blurb: "Plăci austriece, decoruri bogate — partenerul nostru principal." },
];

export const CORP_FINISH_OPTIONS: { value: CorpFinish; label: string }[] = [
  { value: "alb", label: "Alb" },
  { value: "color", label: "Color" },
  { value: "lemn", label: "Aspect lemn" },
];

/** id = sufixul cheii price_front_* din CRM. */
export const FRONT_OPTIONS: { value: string; label: string; blurb: string }[] = [
  { value: "pal", label: "PAL", blurb: "Fronturi din plăci decorate — soluția accesibilă." },
  { value: "agt_1", label: "AGT — fronturi drepte", blurb: "Panouri MDF turcești cu față netedă." },
  { value: "agt_2", label: "AGT — fronturi cu formă", blurb: "Aceleași panouri, cu profil frezat." },
  { value: "mdf_1", label: "MDF vopsit", blurb: "Vopsit în orice culoare, față netedă." },
  { value: "mdf_2", label: "MDF vopsit, frezat", blurb: "Vopsit, cu frezări și profile la comandă." },
  { value: "front_sticla", label: "Sticlă", blurb: "Fronturi cu sticlă, în ramă de aluminiu." },
  { value: "front_oglinda", label: "Oglindă", blurb: "Uși cu oglindă — vizual dublează camera." },
  { value: "furnir", label: "Furnir natural", blurb: "Lemn adevărat pe fiecare front." },
  { value: "furnir_riflat", label: "Furnir riflat", blurb: "Lamele verticale din furnir — semnătura premium." },
];

/** Sertare: brand × construcție, prețul per bucată din price_sertar_*. */
export const DRAWER_OPTIONS: { brand: "blum" | "hettich"; type: "lemn" | "metal"; label: string }[] = [
  { brand: "blum", type: "lemn", label: "Blum — laterale din lemn" },
  { brand: "blum", type: "metal", label: "Blum — metalic (Tandembox)" },
  { brand: "hettich", type: "lemn", label: "Hettich — laterale din lemn" },
  { brand: "hettich", type: "metal", label: "Hettich — metalic (InnoTech)" },
];

/** id = sufixul cheii price_mecanism_* din CRM. */
export const MECHANISM_OPTIONS: { value: string; label: string; blurb: string }[] = [
  { value: "blum_aventos_hk_xs", label: "Blum Aventos HK-XS", blurb: "Ridicare pentru fronturi mici." },
  { value: "blum_piston_gaz", label: "Blum Aventos HF", blurb: "Front pliant pentru corpurile de sus." },
  { value: "blum", label: "Blum Aventos HS/HL", blurb: "Ridicare completă a frontului mare." },
  { value: "hettich", label: "Glisare Hettich", blurb: "TopLine / WingLine pentru uși glisante." },
  { value: "kesslohmer", label: "Colț Kessebohmer", blurb: "Sisteme extractibile pentru corpul de colț." },
];

/** id = sufixul cheii price_storex_* din CRM. */
export const ORGANIZER_OPTIONS: { value: string; label: string; blurb: string }[] = [
  { value: "incaltaminte_8", label: "Suport încălțăminte", blurb: "8 rafturi extractibile." },
  { value: "incaltaminte_12", label: "Suport încălțăminte", blurb: "12 rafturi extractibile." },
  { value: "pantaloni_600", label: "Suport pantaloni", blurb: "Lățime 600 mm." },
  { value: "pantaloni_800", label: "Suport pantaloni", blurb: "Lățime 800 mm." },
  { value: "pantaloni_900", label: "Suport pantaloni", blurb: "Lățime 900 mm." },
  { value: "pantograf", label: "Pantograf", blurb: "Bara de haine coboară la tine." },
];

/** id = sufixul cheii price_blat_* din CRM. */
export const COUNTERTOP_OPTIONS: { value: string; label: string; blurb: string }[] = [
  { value: "pal_egger", label: "PAL Egger", blurb: "Blat stratificat, decoruri Egger." },
  { value: "hpl_negru", label: "HPL compact negru", blurb: "Miez negru, muchie fină — 12 mm." },
  { value: "hpl_alb", label: "HPL compact alb", blurb: "Miez alb, aspect de piatră — 12 mm." },
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
  corpBrand: CorpBrand;
  corpFinish: CorpFinish;
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
  corpBrand: "egger",
  corpFinish: "alb",
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
  let corpRate = num(settings, `price_pal_${cfg.corpBrand}_${cfg.corpFinish}`);
  if (cfg.mode === "premium" && cfg.corpFinish !== "alb") corpRate *= 1.8;
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

export function formatMdl(value: number): string {
  return new Intl.NumberFormat("ro-RO").format(value);
}

/* Rezumatul configurației — pentru pasul final și pentru mesajul din lead. */
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
    value: `${CORP_BRAND_OPTIONS.find((o) => o.value === cfg.corpBrand)?.label}, ${CORP_FINISH_OPTIONS.find((o) => o.value === cfg.corpFinish)?.label?.toLowerCase()}`,
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
