/**
 * MOBO letterforms as pure polygon data — no three.js, no react.
 *
 * The wordmark is built the way MOBO builds kitchens: from panels. Each glyph
 * is a closed outline (plus holes) designed on a 1.0-unit cap height, sampled
 * into straight segments so THREE.Shape can consume it directly and a plain
 * node script can rasterise it for verification. Keeping this file
 * dependency-free is what lets the letterforms be unit-checked without a GPU.
 *
 * Coordinate system: x right, y up, baseline at y = 0, cap height y = 1.
 */

export type Pt = readonly [number, number];

export type GlyphMaterial = "oak" | "graphite" | "lime";

export type Glyph = {
  /** Outer contour, sampled to straight segments. */
  outer: Pt[];
  /** Counters (holes) punched through the panel. */
  holes: Pt[][];
  /** Advance width of the glyph at cap height 1. */
  width: number;
  /** Which cabinet finish this panel gets. */
  material: GlyphMaterial;
};

/** Panel thickness (extrude depth) in glyph units. */
export const PANEL_DEPTH = 0.18;

/** Gap between letters in glyph units. */
export const LETTER_GAP = 0.26;

const TAU = Math.PI * 2;

/** Sample an arc from a0 to a1 (radians, signed direction) into points. */
function arc(cx: number, cy: number, r: number, a0: number, a1: number, seg = 10): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = a0 + ((a1 - a0) * i) / seg;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

/** Rounded rectangle outline (counter-clockwise), corner radius r. */
function roundedRect(x: number, y: number, w: number, h: number, r: number, seg = 8): Pt[] {
  const pts: Pt[] = [
    ...arc(x + w - r, y + r, r, -TAU / 4, 0, seg), // bottom-right
    ...arc(x + w - r, y + h - r, r, 0, TAU / 4, seg), // top-right
    ...arc(x + r, y + h - r, r, TAU / 4, TAU / 2, seg), // top-left
    ...arc(x + r, y + r, r, TAU / 2, (3 * TAU) / 4, seg), // bottom-left
  ];
  return dedupe(pts);
}

/** Drop consecutive points closer than epsilon (arc joints repeat corners). */
function dedupe(pts: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of pts) {
    const q = out[out.length - 1];
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-5) out.push(p);
  }
  const first = out[0];
  const last = out[out.length - 1];
  if (first && last && Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-5) out.pop();
  return out;
}

/* ----------------------------------------------------------------- glyphs -- */

/**
 * M — four straight panels: two stems, two diagonals meeting in a valley.
 * Drawn as one dodecagon; the diagonal counters are part of the outline.
 */
const M: Glyph = {
  width: 1.04,
  material: "graphite",
  outer: [
    [0, 0],
    [0, 1],
    [0.25, 1],
    [0.52, 0.44],
    [0.79, 1],
    [1.04, 1],
    [1.04, 0],
    [0.79, 0],
    [0.79, 0.6],
    [0.52, 0.06],
    [0.25, 0.6],
    [0.25, 0],
  ],
  holes: [],
};

/**
 * O — a cabinet-frame ring: soft-rectangular outside, softer rectangle
 * punched out of the middle. Deliberately not a perfect circle; MOBO fronts
 * are rounded rectangles, and the squarer O keeps the word reading as
 * joinery rather than type.
 */
function makeO(material: GlyphMaterial): Glyph {
  return {
    width: 0.98,
    material,
    outer: roundedRect(0, 0, 0.98, 1, 0.4),
    holes: [roundedRect(0.25, 0.25, 0.48, 0.5, 0.16)],
  };
}

/**
 * B — flat stem, two bowls (the lower one slightly wider, as in any
 * grotesque), two rounded counters.
 */
const B: Glyph = {
  width: 0.82,
  material: "graphite",
  outer: dedupe([
    [0, 0],
    [0, 1],
    [0.5, 1],
    ...arc(0.5, 0.745, 0.255, TAU / 4, -TAU / 4, 14), // top bowl, clockwise
    [0.575, 0.49],
    ...arc(0.575, 0.245, 0.245, TAU / 4, -TAU / 4, 14), // bottom bowl
  ]),
  holes: [
    roundedRect(0.24, 0.6, 0.32, 0.255, 0.12),
    roundedRect(0.24, 0.145, 0.37, 0.255, 0.12),
  ],
};

/** The word, in reading order. Finishes alternate: graphite, oak, graphite, lime. */
export const GLYPHS: Glyph[] = [M, makeO("oak"), B, makeO("lime")];

/** Total advance width of "MOBO" at cap height 1, gaps included. */
export const WORD_WIDTH = GLYPHS.reduce((w, g) => w + g.width, 0) + LETTER_GAP * (GLYPHS.length - 1);
