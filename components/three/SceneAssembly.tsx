"use client";

/**
 * THE ASSEMBLY — the MOBO wordmark builds itself out of darkness.
 *
 * The previous scene (OutroScene) was a correct product shot: the letters
 * never moved, only the camera did. This is a title sequence. The wordmark is
 * manufactured in front of you, the way MOBO's furniture is manufactured:
 * panel by panel, each one arriving on a soft-close curve — the drawer that
 * catches itself instead of slamming is MOBO's actual product feature, and it
 * is the signature easing of this entire scene.
 *
 * NO POSTPROCESSING — deliberately. An earlier revision ran an
 * EffectComposer (DoF, bloom, chromatic aberration, vignette, noise); it
 * added ~220 KB to the chunk, a 15-second dev cold start, and five
 * full-screen passes that lagged an M3. Every one of those effects is now
 * carried at scene level or by the DOM:
 *   depth of field  -> the backdrop is pre-blurred in an offscreen canvas
 *                      (zero per-frame cost) and FogExp2 softens the deep
 *                      panels as they fly.
 *   bloom           -> emissive kicks on each catch, a warm pulse light, and
 *                      one additive halo plane behind the ignited lime O.
 *   vignette+grain  -> already painted over the canvas by the OutroReal
 *                      wrapper, in DOM, for free.
 *   motion blur     -> cut entirely (it was ghost meshes; without bloom it
 *                      read less anyway and cost 4 draw calls).
 *
 * BEAT MAP (scroll progress, after exponential smoothing):
 *   0.00–0.07  Bars. The 2.39:1 anamorphic mattes close as the section pins.
 *              The room sits at 7% exposure — barely a room, mostly darkness.
 *   0.00–0.10  Atmosphere. Volumetric haze rises; the key light's shafts
 *              rake in from the upper right.
 *   0.10–0.76  Assembly. Four panels fly in from far off-frame at different
 *              depths, speeds and durations, tumbling out of the fog. Each
 *              locks on the soft-close curve: the full travel plus 2.5%
 *              OVERSHOOT in the first 58% of its window — the panel lunges
 *              past its seat — then the damper catches it and pulls it home.
 *              Every catch has impact: a warm pulse light blooms off the
 *              panel's edge, its face flashes, the haze kicks, the room's
 *              exposure answers, and the camera takes a body blow.
 *              Stagger:  M 0.10–0.30 (fast) · O(oak) 0.18–0.50 (long fall) ·
 *              B 0.34–0.55 (fast) · O(lime) 0.46–0.76 (the longest).
 *   0.12–0.82  Reveal. The photograph fades up 7%→66% exposure, fog thins,
 *              and the key light itself comes up 2.4→3.6.
 *   0.78–0.90  Ignition. The lime panel — the final O — comes up last and
 *              holds: emissive plus one additive halo plane, restrained.
 *   0.84–1.00  Lock. The camera, which has spent the assembly low and close
 *              on a bezier dip with a decaying dutch tilt, rises and centres
 *              — the reframe — and the handheld drift dies to a tripod.
 *
 * LIGHTING — three-point, not ambient:
 *   KEY   hard warm directional from the right (the window side of MOBO31),
 *         2.4→3.6, casting the one real shadow (512px map, 4 casters).
 *   RIM   cool directional from behind-left — the edge that carves the
 *         panels out of the darkness. This is what makes them photographed.
 *   FILL  barely there, plus the photo-derived environment map held low
 *         (0.10→0.35) — reflections, no longer the light source.
 *   FLOOR a dark semi-gloss pool fading radially into the photograph,
 *         carrying the key shadow and a mirrored copy of the letters
 *         (4 y-inverted meshes — no second scene render).
 *
 * OAK — sampled from MOBO's own kitchen, not procedural. A seam-free crop of
 * the hero photograph's cabinet fronts (x 13.5–21.6%, y 37.5–62.5%, between
 * the door reveals — verified visually against the 4032px original) becomes
 * the oak colour map, flat-fielded to remove the baked lighting gradient,
 * with a luminance-derived bump/roughness map. Mirrored horizontal wrap
 * reads as bookmatched veneer.
 *
 * PERF BUDGET — 13 draw calls total (backdrop, 2 shafts, floor, 4 letters,
 * 4 mirror letters, 1 lime halo; 12 on small viewports with 1 shaft) plus a
 * 4-caster 512px shadow pass. No composer, no fullscreen passes; AA is the
 * default framebuffer's MSAA. One useFrame drives everything with zero
 * per-frame allocation. The wrapper caps DPR at 1.5 on small viewports; the
 * render loop parks whenever the section is off-screen. This holds 60fps on
 * an M-class laptop and scrubs cleanly on mid-range Android — and because
 * the animation is scroll-scrubbed, a slow frame degrades to slower
 * scrubbing, never to dropped clock time.
 *
 * Reduced motion is a genuinely different path: progress arrives as null,
 * the frameloop is demand-only, and one pass of the same director function
 * at t=1 poses the finished, lit, letterboxed still. Nothing flies.
 *
 * Every imperative geometry, material and texture is disposed on unmount;
 * JSX-declared resources are auto-disposed by r3f.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMotionValue, useTransform, type MotionValue } from "motion/react";
import { Letterbox } from "@/components/ui/film";
import {
  GLYPHS,
  LETTER_GAP,
  PANEL_DEPTH,
  WORD_WIDTH,
  type Glyph,
} from "./letterforms";

export type SceneAssemblyProps = {
  /** Same-origin URL of the kitchen photograph. */
  src: string;
  /** Scroll progress 0..1, or null for the reduced-motion still frame. */
  progress: MotionValue<number> | null;
  /** Whether the section is near the viewport — drives the frameloop. */
  active: boolean;
  /** DPR ceiling — 2 on desktop, 1.5 on small viewports. */
  dprMax: number;
  /** Called once the scene has textures and has begun rendering. */
  onReady: () => void;
  /** Called if the WebGL context is lost. */
  onFail: () => void;
};

/* ------------------------------------------------------------- constants -- */

const FOV = 36;
/**
 * The camera path is a quadratic bezier, not a lerp: it opens low and to the
 * right gazing into the haze, DIPS lower and closer while the panels land
 * (the mid control point is near floor level — the assembly is shot from
 * inside it, not observed from a tripod), then rises and centres into the
 * final frame as the word completes. That rise is the reframe.
 */
const CAM_START = new THREE.Vector3(3.0, 0.9, 10.6);
const CAM_MID = new THREE.Vector3(2.1, 0.62, 8.5);
const CAM_END = new THREE.Vector3(0.95, 1.5, 7.3);
/** Look path: empty lit air → the landing zone near the floor → the word. */
const LOOK_START = new THREE.Vector3(0.9, 1.8, -2.6);
const LOOK_MID = new THREE.Vector3(0.35, 0.55, -0.6);
/** Dutch tilt at the open, in radians; decays to level by the lock. */
const DUTCH = -0.05;
/** Cap on letter cap-height in world units (desktop). */
const MAX_LETTER_SCALE = 1.35;
/** Bars finish closing here; the first panel launches just after. */
const BARS_CLOSED_AT = 0.07;
/** Fraction of a panel's window at which the soft-close damper catches. */
const CATCH = 0.58;
/** The panel lunges 2.5% past its seat before the damper arrests it. */
const OVERSHOOT = 1.025;

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: PANEL_DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.01,
  bevelSegments: 2,
  steps: 1,
};

/**
 * Flight choreography, in glyph-local units (the letter group scales them).
 * Every panel arrives from a different edge and a different depth, so the
 * parallax against the backdrop reads immediately. Windows overlap — the
 * assembly is a relay, not a queue.
 */
type PanelCue = {
  readonly window: readonly [number, number];
  readonly from: readonly [number, number, number];
  readonly spin: readonly [number, number, number];
  readonly arc: number;
};

const PANELS: readonly PanelCue[] = [
  // M — hard and fast from frame left, the announcement.
  { window: [0.1, 0.3], from: [-9.5, 2.8, -3.8], spin: [-0.85, -1.35, 0.6], arc: 0.55 },
  // O oak — the long fall from high right, deep in the fog.
  { window: [0.18, 0.5], from: [7.0, 5.0, -5.4], spin: [1.05, 1.5, -0.75], arc: 0.95 },
  // B — a fast low skim from the right while the oak O is still airborne.
  { window: [0.34, 0.55], from: [9.5, 1.1, -2.8], spin: [-0.5, 2.0, 0.45], arc: 0.35 },
  // O lime — the last panel: deepest start, longest flight, highest arc.
  { window: [0.46, 0.76], from: [3.0, 6.2, -5.6], spin: [1.2, -1.7, 0.8], arc: 1.15 },
];

/** Light shafts: x/z placement, tilt, width×length, relative strength. */
const SHAFTS: readonly {
  readonly pos: readonly [number, number, number];
  readonly tilt: number;
  readonly size: readonly [number, number];
  readonly strength: number;
}[] = [
  { pos: [2.9, 2.9, -3.0], tilt: -0.88, size: [2.4, 8.5], strength: 1.0 },
  { pos: [1.6, 2.6, -1.8], tilt: -0.8, size: [1.3, 7.5], strength: 0.55 },
];

const clamp01 = (v: number): number => THREE.MathUtils.clamp(v, 0, 1);

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * The soft-close curve — MOBO's drawer, as an easing function. Free travel:
 * the panel covers its whole distance plus a 2.5% lunge past the seat in the
 * first 58% of the window, fast and decaying. Then the damper catches — the
 * arrest — and a cubic creep draws it back that last fraction home. One
 * overshoot, arrested, never an oscillation: a panel that bounced twice
 * would be a drawer that slammed.
 */
function softClose(u: number): number {
  const c = clamp01(u);
  if (c < CATCH) {
    const a = c / CATCH;
    return OVERSHOOT * (1 - Math.pow(1 - a, 2.1));
  }
  const b = (c - CATCH) / (1 - CATCH);
  return OVERSHOOT - (OVERSHOOT - 1) * (1 - Math.pow(1 - b, 3));
}

/* -------------------------------------------------------------- textures -- */

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  bleed: number,
): void {
  const iw = img.width;
  const ih = img.height;
  const s = Math.max((w + bleed * 2) / iw, (h + bleed * 2) / ih);
  ctx.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
}

/**
 * Load the photograph with retry. The image comes through /_next/image (the
 * WordPress host sends no CORS headers, so same-origin is the only route into
 * WebGL), and that optimizer can 504 on a cold cache — one attempt is not
 * enough for a load-bearing texture.
 */
function loadPhoto(src: string, attempts: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const attempt = (n: number) => {
      const img = new window.Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (n < attempts) setTimeout(() => attempt(n + 1), 1500 * n);
        else reject(new Error(`texture failed after ${attempts} attempts: ${src}`));
      };
      img.src = src;
    };
    attempt(1);
  });
}

/** Moving average with clamped edges — the low-frequency illumination model. */
function boxSmooth(src: Float64Array, radius: number): Float64Array {
  const n = src.length;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - radius);
    const b = Math.min(n - 1, i + radius);
    let sum = 0;
    for (let j = a; j <= b; j++) sum += src[j];
    out[i] = sum / (b - a + 1);
  }
  return out;
}

/**
 * MOBO's real oak, sampled from their own kitchen photograph.
 *
 * The crop (x 13.5–21.6%, y 37.5–62.5% of MOBO31) is the large right-hand
 * cabinet door between the reveals: continuous vertical grain with genuine
 * cathedral figure and knots, no seams, no ceiling, no oven — verified
 * visually against the 4032px original. The photo's baked lighting gradient
 * is removed by separable flat-fielding (smoothed column × row luminance
 * means divided out at 85% strength — full correction would kill the life in
 * the veneer). A second, half-resolution canvas remaps luminance into a
 * ~0.62-centred band that serves as both bump and roughness map.
 */
function buildOakMaps(
  img: HTMLImageElement,
): { color: HTMLCanvasElement; relief: HTMLCanvasElement } | null {
  const W = 384;
  const H = 768;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(
    img,
    img.width * 0.135,
    img.height * 0.375,
    img.width * (0.216 - 0.135),
    img.height * (0.625 - 0.375),
    0,
    0,
    W,
    H,
  );

  const data = ctx.getImageData(0, 0, W, H);
  const px = data.data;

  const col = new Float64Array(W);
  const row = new Float64Array(H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      col[x] += l;
      row[y] += l;
    }
  }
  for (let x = 0; x < W; x++) col[x] /= H;
  for (let y = 0; y < H; y++) row[y] /= W;

  const colS = boxSmooth(col, 48);
  const rowS = boxSmooth(row, 96);
  let mean = 0;
  for (let y = 0; y < H; y++) mean += rowS[y];
  mean /= H;

  if (mean > 1) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const illum = (colS[x] * rowS[y]) / mean;
        if (illum <= 1) continue;
        const f = 1 + 0.85 * (mean / illum - 1);
        const i = (y * W + x) * 4;
        px[i] = Math.min(255, px[i] * f);
        px[i + 1] = Math.min(255, px[i + 1] * f);
        px[i + 2] = Math.min(255, px[i + 2] * f);
      }
    }
    ctx.putImageData(data, 0, 0);
  }

  const rc = document.createElement("canvas");
  rc.width = W / 2;
  rc.height = H / 2;
  const rctx = rc.getContext("2d", { willReadFrequently: true });
  if (!rctx) return { color: c, relief: c };
  rctx.drawImage(c, 0, 0, rc.width, rc.height);
  const rd = rctx.getImageData(0, 0, rc.width, rc.height);
  const rpx = rd.data;
  let rMean = 0;
  const count = rc.width * rc.height;
  for (let i = 0; i < rpx.length; i += 4) {
    rMean += 0.2126 * rpx[i] + 0.7152 * rpx[i + 1] + 0.0722 * rpx[i + 2];
  }
  rMean /= count;
  for (let i = 0; i < rpx.length; i += 4) {
    const l = 0.2126 * rpx[i] + 0.7152 * rpx[i + 1] + 0.0722 * rpx[i + 2];
    const v = THREE.MathUtils.clamp(158 + (l - rMean) * 1.6, 0, 255);
    rpx[i] = v;
    rpx[i + 1] = v;
    rpx[i + 2] = v;
  }
  rctx.putImageData(rd, 0, 0);

  return { color: c, relief: rc };
}

type SceneTextures = {
  backdrop: THREE.Texture;
  env: THREE.Texture | null;
  oakMap: THREE.Texture | null;
  oakRelief: THREE.Texture | null;
};

/**
 * One photograph, four roles: defocused backdrop, blurred equirect
 * environment, oak colour map, oak relief map. All built once per image in
 * offscreen canvases, memoised, disposed together. The backdrop's 2px
 * pre-blur IS the scene's depth of field — paid once here, never per frame.
 */
function useKitchenTextures(src: string, onFail: () => void): SceneTextures | null {
  const gl = useThree((s) => s.gl);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let alive = true;
    loadPhoto(src, 3).then(
      (image) => {
        if (alive) setImg(image);
      },
      () => {
        if (alive) onFail();
      },
    );
    return () => {
      alive = false;
    };
  }, [src, onFail]);

  const textures = useMemo<SceneTextures | null>(() => {
    if (!img) return null;

    let backdrop: THREE.Texture;
    const bg = document.createElement("canvas");
    bg.width = 1024;
    bg.height = 768;
    const bgCtx = bg.getContext("2d");
    if (bgCtx) {
      bgCtx.filter = "blur(2px)";
      drawCover(bgCtx, img, bg.width, bg.height, 6);
      bgCtx.filter = "none";
      const vig = bgCtx.createRadialGradient(
        bg.width / 2,
        bg.height * 0.42,
        bg.height * 0.32,
        bg.width / 2,
        bg.height * 0.42,
        bg.width * 0.72,
      );
      vig.addColorStop(0, "rgba(6, 6, 4, 0)");
      vig.addColorStop(1, "rgba(6, 6, 4, 0.42)");
      bgCtx.fillStyle = vig;
      bgCtx.fillRect(0, 0, bg.width, bg.height);
      const tex = new THREE.CanvasTexture(bg);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      backdrop = tex;
    } else {
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      backdrop = tex;
    }

    let env: THREE.Texture | null = null;
    const ec = document.createElement("canvas");
    ec.width = 512;
    ec.height = 256;
    const eCtx = ec.getContext("2d");
    if (eCtx) {
      eCtx.filter = "blur(14px)";
      drawCover(eCtx, img, ec.width, ec.height, 16);
      const tex = new THREE.CanvasTexture(ec);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      env = tex;
    }

    let oakMap: THREE.Texture | null = null;
    let oakRelief: THREE.Texture | null = null;
    const oak = buildOakMaps(img);
    if (oak) {
      const colorTex = new THREE.CanvasTexture(oak.color);
      colorTex.colorSpace = THREE.SRGBColorSpace;
      /* Mirrored horizontal wrap = bookmatched veneer; repeat 2×1 restores the
         source crop's 1:2 aspect so the grain keeps its true width. */
      colorTex.wrapS = THREE.MirroredRepeatWrapping;
      colorTex.wrapT = THREE.MirroredRepeatWrapping;
      colorTex.repeat.set(2, 1);
      colorTex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      oakMap = colorTex;

      const reliefTex = new THREE.CanvasTexture(oak.relief);
      reliefTex.wrapS = THREE.MirroredRepeatWrapping;
      reliefTex.wrapT = THREE.MirroredRepeatWrapping;
      reliefTex.repeat.set(2, 1);
      oakRelief = reliefTex;
    }

    return { backdrop, env, oakMap, oakRelief };
  }, [img, gl]);

  useEffect(() => {
    if (!textures) return;
    return () => {
      textures.backdrop.dispose();
      textures.env?.dispose();
      textures.oakMap?.dispose();
      textures.oakRelief?.dispose();
    };
  }, [textures]);

  return textures;
}

/** Additive gradient plate for the volumetric shafts. Built once, disposed. */
function makeShaftTexture(): THREE.CanvasTexture | null {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, "rgba(255, 236, 202, 0.85)");
  g.addColorStop(0.45, "rgba(255, 228, 188, 0.3)");
  g.addColorStop(1, "rgba(255, 224, 180, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  /* Soften the plate's vertical edges so the shaft has no silhouette. */
  const h = ctx.createLinearGradient(0, 0, c.width, 0);
  h.addColorStop(0, "rgba(0,0,0,0)");
  h.addColorStop(0.3, "rgba(0,0,0,1)");
  h.addColorStop(0.7, "rgba(0,0,0,1)");
  h.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Radial alpha for the floor: a dark stage pool that melts into the photo. */
function makeFloorAlphaTexture(): THREE.CanvasTexture | null {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.55, "#b4b4b4");
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/**
 * The ignition halo — bloom's stand-in, at one draw call. A soft radial
 * glow, warm-white at the core shading into the brand lime, sitting just
 * behind the lime O. Additive, and held at low opacity: it should read as
 * light spilling into the haze, never as a neon sign.
 */
function makeGlowTexture(): THREE.CanvasTexture | null {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, "rgba(245, 252, 205, 0.9)");
  g.addColorStop(0.35, "rgba(214, 231, 96, 0.34)");
  g.addColorStop(0.7, "rgba(190, 208, 60, 0.1)");
  g.addColorStop(1, "rgba(180, 200, 40, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* --------------------------------------------------------------- letters -- */

function glyphShape(g: Glyph): THREE.Shape {
  const shape = new THREE.Shape(g.outer.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const hole of g.holes) {
    shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x, y))));
  }
  return shape;
}

type LetterMaterials = {
  /** One instance per letter — the landing flashes are per-panel. */
  main: THREE.MeshPhysicalMaterial[];
  /** Floor-reflection clones under the y-inverted group. */
  mirror: THREE.MeshPhysicalMaterial[];
};

function buildLetterMaterials(
  oakMap: THREE.Texture | null,
  oakRelief: THREE.Texture | null,
): LetterMaterials {
  const make = (g: Glyph): THREE.MeshPhysicalMaterial => {
    switch (g.material) {
      case "oak":
        /* MOBO's own veneer, photographed in their own kitchen. Warm pulse
           emissive for the landing flash; roughness carried by the relief
           map (values centred ~0.62), bump from the same map. */
        return new THREE.MeshPhysicalMaterial({
          map: oakMap ?? undefined,
          color: oakMap ? "#ffffff" : "#a3794f",
          roughness: oakMap ? 1 : 0.62,
          roughnessMap: oakRelief ?? undefined,
          bumpMap: oakRelief ?? undefined,
          bumpScale: 0.18,
          metalness: 0,
          envMapIntensity: 0.55,
          emissive: "#ffd7a6",
          emissiveIntensity: 0,
        });
      case "graphite":
        return new THREE.MeshPhysicalMaterial({
          color: "#24251d",
          roughness: 0.28,
          metalness: 0,
          clearcoat: 0.55,
          clearcoatRoughness: 0.22,
          envMapIntensity: 0.9,
          emissive: "#ffd7a6",
          emissiveIntensity: 0,
        });
      case "lime":
        /* Satin lacquer, not neon. The emissive is the ignition channel —
           zero until beat 4, then held. */
        return new THREE.MeshPhysicalMaterial({
          color: "#ccdf10",
          roughness: 0.34,
          metalness: 0,
          clearcoat: 0.45,
          clearcoatRoughness: 0.3,
          envMapIntensity: 0.7,
          emissive: "#ccdf10",
          emissiveIntensity: 0,
        });
    }
  };

  const main = GLYPHS.map(make);
  const mirror = main.map((m) => {
    const g = m.clone();
    g.transparent = true;
    g.opacity = 0.26;
    g.depthWrite = false;
    /* The mirror never ignites on its own — the director copies a fraction
       of the lime's glow into it so the floor answers the ignition. */
    g.emissiveIntensity = 0;
    return g;
  });
  return { main, mirror };
}

/* ----------------------------------------------------------------- stage -- */

type StageProps = {
  textures: SceneTextures;
  progress: MotionValue<number> | null;
  small: boolean;
  letterScale: number;
  targetY: number;
  planeScale: number;
  planeY: number;
};

function Stage({
  textures,
  progress,
  small,
  letterScale,
  targetY,
  planeScale,
  planeY,
}: StageProps) {
  const scene = useThree((s) => s.scene);

  /* Environment: reflections only. Intensity is animated by the director —
     the drama comes from the key/rim contrast, not from ambient fill. */
  useEffect(() => {
    if (!textures.env) return;
    scene.environment = textures.env;
    scene.environmentIntensity = 0.1;
    return () => {
      scene.environment = null;
    };
  }, [scene, textures.env]);

  const shaftTexture = useMemo(() => makeShaftTexture(), []);
  const floorAlpha = useMemo(() => makeFloorAlphaTexture(), []);
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  useEffect(() => {
    return () => {
      shaftTexture?.dispose();
      floorAlpha?.dispose();
      glowTexture?.dispose();
    };
  }, [shaftTexture, floorAlpha, glowTexture]);

  const shaftMaterials = useMemo(
    () =>
      SHAFTS.map(
        () =>
          new THREE.MeshBasicMaterial({
            map: shaftTexture ?? undefined,
            color: "#ffe8cd",
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false,
          }),
      ),
    [shaftTexture],
  );
  const glowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glowTexture ?? undefined,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    [glowTexture],
  );
  useEffect(() => {
    return () => {
      for (const m of shaftMaterials) m.dispose();
      glowMaterial.dispose();
    };
  }, [shaftMaterials, glowMaterial]);

  const geometries = useMemo(
    () => GLYPHS.map((g) => new THREE.ExtrudeGeometry(glyphShape(g), EXTRUDE)),
    [],
  );
  useEffect(() => {
    return () => {
      for (const g of geometries) g.dispose();
    };
  }, [geometries]);

  const materials = useMemo(
    () => buildLetterMaterials(textures.oakMap, textures.oakRelief),
    [textures.oakMap, textures.oakRelief],
  );
  useEffect(() => {
    return () => {
      /* Materials only — the shared textures are disposed by their owner. */
      for (const m of materials.main) m.dispose();
      for (const m of materials.mirror) m.dispose();
    };
  }, [materials]);

  const placed = useMemo(() => {
    let cursor = -WORD_WIDTH / 2;
    return GLYPHS.map((g) => {
      const x = cursor;
      cursor += g.width + LETTER_GAP;
      return { x, width: g.width };
    });
  }, []);
  /* The lime O's face centre — where the ignition halo hangs. */
  const limeCenter = placed[3].x + placed[3].width / 2;

  /* Refs into the animated meshes and lights. */
  const mainRefs = useRef<(THREE.Mesh | null)[]>([]);
  const mirrorRefs = useRef<(THREE.Mesh | null)[]>([]);
  const backdropMat = useRef<THREE.MeshBasicMaterial | null>(null);
  const fogRef = useRef<THREE.FogExp2 | null>(null);
  const pulseLight = useRef<THREE.PointLight | null>(null);
  const keyLight = useRef<THREE.DirectionalLight | null>(null);

  /* Per-frame scratch state — allocated once, mutated forever. */
  const scratch = useMemo(
    () => ({
      smooth: { t: 0 },
      camPos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      lookEnd: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const s = scratch;
    const raw = progress ? clamp01(progress.get()) : 1;
    if (progress) {
      /* Exponential smoothing = camera weight. No spring, no overshoot. */
      s.smooth.t = THREE.MathUtils.damp(s.smooth.t, raw, 3.4, Math.min(delta, 0.1));
    } else {
      s.smooth.t = 1;
    }
    const t = s.smooth.t;
    const clock = state.clock.elapsedTime;
    /* How far the room has come up out of the dark — used everywhere. */
    const reveal = THREE.MathUtils.smoothstep(t, 0.12, 0.82);

    /* ---- the assembly (first: its impact feeds the camera and the haze) -- */
    let pulse = 0;
    let pulseIdx = 0;
    let limePulse = 0;
    for (let i = 0; i < PANELS.length; i++) {
      const mesh = mainRefs.current[i];
      if (!mesh) continue;
      const cue = PANELS[i];
      const fin = placed[i];
      const [w0, w1] = cue.window;
      const u = clamp01((t - w0) / (w1 - w0));
      const ePos = softClose(u);
      /* Rotation resolves slightly ahead of position and never overshoots —
         the face is readable in the instant before the lunge and the catch. */
      const eRot = Math.min(1, softClose(clamp01(u * 1.12)));
      const back = 1 - ePos;

      mesh.position.set(
        fin.x + cue.from[0] * back,
        /* The arc term is clamped so the overshoot lunge never dips the
           panel through the floor. */
        0.012 + cue.from[1] * back + Math.sin(Math.PI * Math.min(ePos, 1)) * cue.arc,
        -PANEL_DEPTH / 2 + cue.from[2] * back,
      );
      mesh.rotation.set(
        cue.spin[0] * (1 - eRot),
        cue.spin[1] * (1 - eRot),
        cue.spin[2] * (1 - eRot),
      );

      /* Floor reflection follows the panel; it dims while the panel is
         airborne and strengthens as the room's light comes up. */
      const mirror = mirrorRefs.current[i];
      if (mirror) {
        mirror.position.copy(mesh.position);
        mirror.rotation.copy(mesh.rotation);
        materials.mirror[i].opacity =
          0.26 * clamp01(1.15 - mesh.position.y * 0.45) * (0.35 + 0.65 * reveal);
      }

      /* The landing flash: a gaussian centred on the damper's catch point.
         Without bloom this carries the impact, so it is a touch stronger. */
      const catchT = w0 + CATCH * (w1 - w0);
      const g = Math.exp(-Math.pow((t - catchT) / 0.016, 2));
      if (g > pulse) {
        pulse = g;
        pulseIdx = i;
      }
      if (i === 3) limePulse = g;
      materials.main[i].emissiveIntensity = g * 0.6;
    }

    /* One shared pulse light — landings never overlap, so it teleports to
       whichever panel is catching and blooms off its top-right edge. */
    if (pulseLight.current) {
      const fin = placed[pulseIdx];
      pulseLight.current.intensity = pulse * 30 * letterScale;
      pulseLight.current.position.set(fin.x + fin.width * 0.9, 1.05, 0.5);
    }

    /* Beat 4 — the lime O ignites last and holds. Emissive plus the halo
       plane stand in for bloom; the mirror inherits a fraction so the floor
       answers it. */
    const ign = THREE.MathUtils.smoothstep(t, 0.78, 0.9);
    materials.main[3].emissiveIntensity += ign * 1.15;
    materials.mirror[3].emissiveIntensity = ign * 0.4;
    glowMaterial.opacity = ign * 0.24 + limePulse * 0.18;

    /* ---- camera: bezier dip through the assembly, then the reframe ---- */
    const e = easeInOutCubic(t);
    const ie = 1 - e;
    s.lookEnd.set(0, targetY, 0);
    s.camPos.set(
      ie * ie * CAM_START.x + 2 * e * ie * CAM_MID.x + e * e * CAM_END.x,
      ie * ie * CAM_START.y + 2 * e * ie * CAM_MID.y + e * e * CAM_END.y,
      ie * ie * CAM_START.z + 2 * e * ie * CAM_MID.z + e * e * CAM_END.z,
    );
    s.look.set(
      ie * ie * LOOK_START.x + 2 * e * ie * LOOK_MID.x + e * e * s.lookEnd.x,
      ie * ie * LOOK_START.y + 2 * e * ie * LOOK_MID.y + e * e * s.lookEnd.y,
      ie * ie * LOOK_START.z + 2 * e * ie * LOOK_MID.z + e * e * s.lookEnd.z,
    );
    if (progress) {
      /* Handheld drift that dies into a tripod as the frame locks… */
      const grip = 1 - 0.78 * THREE.MathUtils.smoothstep(t, 0.84, 0.98);
      s.camPos.x += grip * (0.024 * Math.sin(clock * 0.43 + 1.7) + 0.011 * Math.sin(clock * 1.11));
      s.camPos.y +=
        grip * (0.015 * Math.sin(clock * 0.57 + 0.6) + 0.007 * Math.sin(clock * 1.31 + 2.2));
      s.camPos.z += grip * 0.012 * Math.sin(clock * 0.36 + 3.1);
      s.look.y += grip * 0.008 * Math.sin(clock * 0.49 + 1.1);
      /* …and the body blow: every catch drops the camera a few millimetres.
         The gaussian gives it a natural attack and decay under the scrub. */
      s.camPos.y -= pulse * 0.03;
      s.camPos.x += pulse * 0.012;
    }
    state.camera.position.copy(s.camPos);
    state.camera.lookAt(s.look);
    /* Dutch tilt at the open — the frame itself is off balance until the
       word stands. rotateZ after lookAt rolls about the view axis. */
    if (progress) state.camera.rotateZ(DUTCH * ie);

    /* ---- atmosphere: exposure, fog, haze, environment ---- */
    if (backdropMat.current) {
      /* The room answers each landing with a flicker of exposure. */
      backdropMat.current.color.setScalar(0.07 + 0.59 * reveal + pulse * 0.025);
    }
    if (fogRef.current) {
      fogRef.current.density = THREE.MathUtils.lerp(
        0.055,
        0.013,
        THREE.MathUtils.smoothstep(t, 0.08, 0.8),
      );
    }
    scene.environmentIntensity = 0.1 + 0.25 * reveal;
    if (keyLight.current) keyLight.current.intensity = 2.4 + 1.2 * reveal;

    const haze =
      THREE.MathUtils.smoothstep(t, 0, 0.05) *
      THREE.MathUtils.lerp(0.42, 0.09, THREE.MathUtils.smoothstep(t, 0.2, 0.85)) *
      /* Each catch displaces the air — the shafts flare with the landing. */
      (1 + pulse * 0.45);
    for (let i = 0; i < shaftMaterials.length; i++) {
      /* Slow breathing — light through air, never a strobe. */
      shaftMaterials[i].opacity =
        haze * SHAFTS[i].strength * (0.94 + 0.06 * Math.sin(clock * 0.31 + i * 2.1));
    }
  });

  const shaftCount = small ? 1 : SHAFTS.length;

  return (
    <>
      {/* Haze. The density is animated; the colour sits in the warm-graphite
          palette so the darkness never reads blue. */}
      <fogExp2 ref={fogRef} attach="fog" args={["#0a0a07", 0.055]} />

      {/* The room. Untonemapped so it keeps its photographic colour; its
          exposure is the director's — near-black in beat 1, 66% at the end.
          fog=false: the photograph is behind the haze volume, not inside it. */}
      <mesh position={[0, planeY, -8]} scale={planeScale}>
        <planeGeometry args={[30, 22.5]} />
        <meshBasicMaterial
          ref={backdropMat}
          map={textures.backdrop}
          toneMapped={false}
          fog={false}
          color="#171717"
        />
      </mesh>

      {/* KEY — hard and warm, from the right, matching the window in MOBO31.
          Intensity is the director's (2.4 → 3.6 with the reveal). The only
          shadow-caster: one 512px map, four casters. */}
      <directionalLight
        ref={keyLight}
        position={[8, 6.5, 4.5]}
        intensity={2.4}
        color="#ffdfb8"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* RIM — cool, hard, from behind-left: the edge that carves the panels
          out of the darkness. The classic third point, pushed. */}
      <directionalLight position={[-5, 4.5, -6.5]} intensity={2.1} color="#a9c4e8" />
      {/* FILL — barely there. Drama comes from what is NOT lit. */}
      <directionalLight position={[-6, 2.5, 5]} intensity={0.12} color="#dfe2d8" />

      {/* Volumetric shafts: additive gradient plates angled down the key's
          direction. Cheap, and they carry beat 1 alone. One on phones. */}
      {SHAFTS.slice(0, shaftCount).map((sh, i) => (
        <mesh
          key={i}
          position={[sh.pos[0], sh.pos[1], sh.pos[2]]}
          rotation={[0, -0.12 * (i - 1), sh.tilt]}
          scale={[sh.size[0], sh.size[1], 1]}
          material={shaftMaterials[i]}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}

      {/* The stage floor: a dark semi-gloss pool that fades radially into the
          photograph's own floor. Receives the key's real cast shadow. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0.8]} receiveShadow>
        <planeGeometry args={[WORD_WIDTH * letterScale * 2.4, 7]} />
        <meshStandardMaterial
          color="#0b0b08"
          roughness={0.32}
          metalness={0.04}
          alphaMap={floorAlpha ?? undefined}
          transparent
          opacity={0.78}
          depthWrite={false}
          envMapIntensity={0.5}
        />
      </mesh>

      <group scale={letterScale}>
        {/* The panels. Transforms are owned by the director above. */}
        {placed.map((_, i) => (
          <mesh
            key={`main-${i}`}
            ref={(el: THREE.Mesh | null) => {
              mainRefs.current[i] = el;
            }}
            geometry={geometries[i]}
            material={materials.main[i]}
            castShadow
            receiveShadow
          />
        ))}
        {/* The floor reflection: the same panels through a y-inverted group.
            three.js flips winding for negative determinants, so FrontSide
            renders correctly. 4 draws — no second scene render. */}
        <group scale={[1, -1, 1]}>
          {placed.map((_, i) => (
            <mesh
              key={`mirror-${i}`}
              ref={(el: THREE.Mesh | null) => {
                mirrorRefs.current[i] = el;
              }}
              geometry={geometries[i]}
              material={materials.mirror[i]}
            />
          ))}
        </group>
        {/* The ignition halo, hanging just behind the lime O. The letter
            occludes its core, so what survives is a rim of light — bloom's
            silhouette without bloom's price. */}
        <mesh position={[limeCenter, 0.5, -PANEL_DEPTH / 2 - 0.4]} scale={2.6} material={glowMaterial}>
          <planeGeometry args={[1, 1]} />
        </mesh>
        {/* The landing flash — one light, teleported to each catch. */}
        <pointLight
          ref={pulseLight}
          color="#ffe6c2"
          intensity={0}
          distance={6}
          decay={2}
          position={[0, 1, 0.5]}
        />
      </group>
    </>
  );
}

/* ----------------------------------------------------------------- scene -- */

function SceneContents({
  src,
  progress,
  onReady,
  onFail,
}: {
  src: string;
  progress: MotionValue<number> | null;
  onReady: () => void;
  onFail: () => void;
}) {
  const textures = useKitchenTextures(src, onFail);
  const size = useThree((s) => s.size);

  /* Signal readiness on the frame after the textures have committed. */
  useEffect(() => {
    if (!textures) return;
    const id = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(id);
  }, [textures, onReady]);

  /* Fit the word to ~88% of the viewport width at the end-of-dolly distance,
     capped at its full desktop size. Width-bound, like typography — the
     letterbox eats height, never width. */
  const aspect = size.width / Math.max(1, size.height);
  const viewW = 2 * Math.tan((FOV * Math.PI) / 360) * 7.4 * aspect;
  const letterScale = Math.min(MAX_LETTER_SCALE, (viewW * 0.88) / WORD_WIDTH);
  const targetY = letterScale * 0.5;
  const small = size.width < 640;

  /* Backdrop must out-cover the frustum at every point of the dolly; same
     plane fit as the approved scene, re-verified for this camera path
     (x up to 3.0, z up to 10.6, drift extremes included) across aspects
     0.46–2.4 — ultrawide scales the plane and re-anchors the baseline. */
  const planeScale = Math.max(1, aspect / 1.7);
  const planeY = -1.675 + 3.825 * planeScale;

  /* Poster shows through the transparent canvas until the photo arrives. */
  if (!textures) return null;

  return (
    <Stage
      textures={textures}
      progress={progress}
      small={small}
      letterScale={letterScale}
      targetY={targetY}
      planeScale={planeScale}
      planeY={planeY}
    />
  );
}

export default function SceneAssembly({
  src,
  progress,
  active,
  dprMax,
  onReady,
  onFail,
}: SceneAssemblyProps) {
  const failed = useRef(false);

  /* The mattes close over the first 7% of the scroll — the frame becomes
     cinema before anything moves. Reduced motion: Letterbox itself renders
     the composed 2.39:1 still, and the fallback value keeps it closed. */
  const closed = useMotionValue(1);
  const bars = useTransform(progress ?? closed, [0, BARS_CLOSED_AT], [0, 1]);

  return (
    <>
      <Canvas
        frameloop={progress ? (active ? "always" : "never") : "demand"}
        dpr={[1, dprMax]}
        shadows
        camera={{ fov: FOV, near: 0.1, far: 80, position: CAM_START.toArray() }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            if (!failed.current) {
              failed.current = true;
              onFail();
            }
          });
        }}
        style={{ pointerEvents: "none" }}
      >
        <SceneContents src={src} progress={progress} onReady={onReady} onFail={onFail} />
      </Canvas>
      <Letterbox progress={bars} />
    </>
  );
}
