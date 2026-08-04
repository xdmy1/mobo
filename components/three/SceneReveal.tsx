"use client";

/**
 * THE REVEAL — light is the protagonist.
 *
 * The wordmark is present from the first frame, standing in total darkness.
 * Nothing in the scene ever moves except the light and the camera. A single
 * hard key travels across the word, raking the real oak grain and catching
 * every bevel; volumetric shafts pour through the letter gaps as it passes
 * behind; then the fill rises, the kitchen resolves out of the black, and the
 * lime panel ignites last and holds.
 *
 * Beat map (scroll progress t, scrubbed — never scroll-jacked). The tempo is
 * the drama: one fast violent event, darkness, then a slow expensive one.
 *   0.00–0.07   Anamorphic letterbox closes over near-total black. The only
 *               light is a 0.035-intensity rim — mass, not identity.
 *   0.05–0.185  THE STRIKE. The key whips across the whole word in a tenth of
 *               the scroll — a hard, hot, DEFOCUSED rake (focus is still
 *               short) that snaps bevels into brilliance and strobes shafts
 *               through the gaps. Then it is gone.
 *   0.19–0.23   Black again. What was that.
 *   0.23–0.60   THE REVEAL. The light returns, slower, and this time it
 *               stays: focus racks onto the letters (0.16–0.28), the raking
 *               pool crawls across the oak, and the occluded sun behind the
 *               word drives unmistakable GodRays through the M/O/B/O slots
 *               and the O counters (~0.30–0.52).
 *   ~0.50       The cool rim SNAPS on over ~5% of scroll — an edge, not a
 *               fade — separating the word from the void.
 *   0.52–0.86   Hand-over. The sun exits, the key parks camera-right (the
 *               window side of the photograph) and dims to an accent; fill
 *               rises, the photo environment resolves from black, haze
 *               clears, the stage floor cross-fades to the kitchen's own.
 *   0.80–0.97   The lime O IGNITES — emissive overshoots to 2.2 through the
 *               bloom threshold, then settles. Locked, letterboxed frame.
 *
 * Material truth: the oak is not procedural — it is sampled from MOBO's own
 * kitchen photograph (the left cabinet run of MOBO31, crop x 4–22%,
 * y 22–70%, grain vertical). The crop's baked-in daylight gradient is
 * flattened (low-frequency luminance normalisation) so the travelling key is
 * the only light that models it, and the bump map is derived from the
 * high-frequency detail only. The letters wear the client's own veneer.
 *
 * Postprocessing (@react-three/postprocessing): DepthOfField → GodRays →
 * Bloom (threshold 1.0 in the HDR buffer — only genuine speculars, the sun
 * and the lime ever bloom) → ACES tone mapping → Vignette → Noise. No
 * anamorphic streak — it was optional and it is exactly the kind of garnish
 * that reads as fake.
 *
 * Mobile (<640px) cuts, stated honestly: GodRays and DepthOfField are dropped
 * and MSAA is off. The shafts are substituted with a single additive gradient
 * "beam" plane behind the letters — the letters occlude it via the depth
 * buffer, so the slot/counter money shot survives at the cost of one draw
 * call. Shadow map drops 1024→512. Budget: ~11 scene draw calls; desktop runs
 * render + 4 post passes (60fps target on integrated GPUs at DPR≤2), mobile
 * runs render + 2 post passes (30fps floor, typically 45+, at DPR 1.5).
 *
 * Reduced motion is a genuinely different path: progress=null poses the
 * fully-revealed, composed, letterboxed still once (frameloop="demand", no
 * travelling light, no drift, no scrubbing).
 *
 * Disposal: letter materials + all CanvasTextures are memoised and disposed
 * explicitly; JSX-created geometries/materials are auto-disposed by r3f; the
 * composer and the GodRays effect (which the library wrapper leaks) are
 * disposed through callback refs. Context loss calls onFail — the wrapper's
 * poster stays, never a white screen.
 */

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  GodRays,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type {
  DepthOfFieldEffect,
  EffectComposer as EffectComposerImpl,
  GodRaysEffect,
} from "postprocessing";
import type { MotionValue } from "motion/react";
import {
  GLYPHS,
  LETTER_GAP,
  PANEL_DEPTH,
  WORD_WIDTH,
  type Glyph,
  type GlyphMaterial,
} from "./letterforms";

export type SceneRevealProps = {
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
/** Push-in: low and left in the dark, ending on the hero framing. */
const CAM_START = new THREE.Vector3(-2.4, 1.2, 10.2);
const CAM_END = new THREE.Vector3(0.95, 1.5, 7.3);
/** Cap on letter cap-height in world units (desktop). */
const MAX_LETTER_SCALE = 1.35;
/** Sun/key travel half-width, in letter-scale units. */
const SWEEP_HALF = 4;
/** z of the shaft source — behind the letters, in front of the backdrop. */
const SUN_Z = -1.9;

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: PANEL_DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.014,
  bevelSize: 0.012,
  bevelSegments: 3,
  steps: 1,
};

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Smoothstep band: 0 before `a`, 1 after `b`. */
function band(t: number, a: number, b: number): number {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

/* ------------------------------------------------------------ beat grades -- */

type Grade = {
  bars: number;
  sweep: number;
  key: number;
  sun: number;
  rim: number;
  fill: number;
  env: number;
  photo: number;
  floor: number;
  fog: number;
  lime: number;
  rack: number;
};

function makeGrade(): Grade {
  return {
    bars: 0,
    sweep: 0,
    key: 0,
    sun: 0,
    rim: 0.035,
    fill: 0,
    env: 0,
    photo: 0,
    floor: 1,
    fog: 0.048,
    lime: 0,
    rack: 0,
  };
}

/**
 * The entire film, as a pure function of scrubbed progress. Two sweeps share
 * one source: the fast strike (0.05–0.185) and the slow reveal (0.23–0.60).
 * The position switch at t=0.21 happens in full darkness — both intensity
 * envelopes are zero there — so the source never visibly teleports.
 */
function evalGrade(t: number, out: Grade): Grade {
  out.bars = band(t, 0.005, 0.07);

  const strikePos = band(t, 0.055, 0.165);
  const strikeI = band(t, 0.048, 0.08) * (1 - band(t, 0.15, 0.185));
  const revealPos = band(t, 0.23, 0.6);
  const revealI = band(t, 0.23, 0.285) * (1 - 0.78 * band(t, 0.62, 0.8));
  const revealSun = band(t, 0.25, 0.315) * (1 - band(t, 0.55, 0.66));

  out.sweep = t < 0.21 ? strikePos : revealPos;
  out.key = Math.max(strikeI * 1.3, revealI);
  out.sun = Math.max(strikeI, revealSun);

  out.rim = 0.035 + 0.95 * band(t, 0.495, 0.545);
  out.fill = 0.5 * band(t, 0.56, 0.82);
  out.env = 0.85 * band(t, 0.55, 0.84);
  out.photo = 1.35 * band(t, 0.52, 0.86);
  out.floor = 1 - band(t, 0.6, 0.8);
  out.fog = 0.048 - 0.036 * band(t, 0.55, 0.85);
  out.lime = Math.max(0, 2.2 * band(t, 0.8, 0.865) - 1.05 * band(t, 0.875, 0.97));
  out.rack = band(t, 0.16, 0.28);
  return out;
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
 * Load the photograph with retry — it comes through /_next/image (same-origin
 * is the only CORS-safe route into WebGL) and that optimizer can 504 cold.
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

/**
 * Real MOBO oak, sampled from the photograph itself. The crop (x 4–22%,
 * y 22–70% of MOBO31) is the left cabinet run: genuine cathedral figure,
 * knots, vertical grain. Two corrections make it usable under a travelling
 * light:
 *   1. The baked-in daylight gradient is divided out (per-pixel scale by
 *      meanLum/lowLum, where lowLum is a 48px-blurred copy) — otherwise the
 *      key would appear to illuminate areas that are already lit.
 *   2. The bump map is built from the high-frequency detail only
 *      (flattenedLum − mean), so the relief is grain, not lighting.
 * Harsh panel-seam darks are lifted halfway toward the mean so a reveal line
 * reads as joinery, not a stripe. One glyph is oak (the first O) and the crop
 * maps onto it once, full-height — the cathedral lands whole on the panel.
 */
function makeOakTextures(
  img: HTMLImageElement,
  maxAniso: number,
): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture | null } | null {
  const W = 512;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(
    img,
    img.width * 0.04,
    img.height * 0.22,
    img.width * 0.18,
    img.height * 0.48,
    0,
    0,
    W,
    H,
  );

  // Low-frequency lighting estimate: heavy blur, overdrawn past the edges so
  // the blur never pulls in transparent border pixels.
  const lowC = document.createElement("canvas");
  lowC.width = W;
  lowC.height = H;
  const lctx = lowC.getContext("2d", { willReadFrequently: true });
  if (!lctx) return null;
  lctx.filter = "blur(48px)";
  lctx.drawImage(c, -96, -96, W + 192, H + 192);
  lctx.filter = "none";

  let srcD: ImageData;
  let lowD: ImageData;
  try {
    srcD = ctx.getImageData(0, 0, W, H);
    lowD = lctx.getImageData(0, 0, W, H);
  } catch {
    return null;
  }

  const sp = srcD.data;
  const lp = lowD.data;
  const n = W * H;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    sum += 0.299 * lp[j] + 0.587 * lp[j + 1] + 0.114 * lp[j + 2];
  }
  const mean = Math.max(60, sum / n);

  const bumpD = ctx.createImageData(W, H);
  const bp = bumpD.data;
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const ll = Math.max(24, 0.299 * lp[j] + 0.587 * lp[j + 1] + 0.114 * lp[j + 2]);
    const g = Math.min(1.9, Math.max(0.55, mean / ll));
    let r = sp[j] * g;
    let gr = sp[j + 1] * g;
    let b = sp[j + 2] * g;
    const lum = 0.299 * r + 0.587 * gr + 0.114 * b;
    const floorLum = mean * 0.5;
    if (lum < floorLum && lum > 0) {
      // Soften panel-seam darks: keep the line, lose the harshness.
      const k = (lum + (floorLum - lum) * 0.45) / lum;
      r *= k;
      gr *= k;
      b *= k;
    }
    sp[j] = r;
    sp[j + 1] = gr;
    sp[j + 2] = b;
    const dev = 0.299 * r + 0.587 * gr + 0.114 * b - mean;
    const bump = 128 + Math.max(-96, Math.min(96, dev * 1.5));
    bp[j] = bump;
    bp[j + 1] = bump;
    bp[j + 2] = bump;
    bp[j + 3] = 255;
  }
  ctx.putImageData(srcD, 0, 0);

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.MirroredRepeatWrapping;
  map.wrapT = THREE.MirroredRepeatWrapping;
  map.anisotropy = Math.min(8, maxAniso);

  const bc = document.createElement("canvas");
  bc.width = W;
  bc.height = H;
  const bctx = bc.getContext("2d");
  let bump: THREE.CanvasTexture | null = null;
  if (bctx) {
    bctx.putImageData(bumpD, 0, 0);
    bump = new THREE.CanvasTexture(bc);
    bump.wrapS = THREE.MirroredRepeatWrapping;
    bump.wrapT = THREE.MirroredRepeatWrapping;
  }
  return { map, bump };
}

type KitchenTextures = {
  backdrop: THREE.Texture;
  env: THREE.Texture | null;
  oakMap: THREE.CanvasTexture | null;
  oakBump: THREE.CanvasTexture | null;
};

/**
 * One photograph, three roles: defocused backdrop, blurred equirect
 * environment (revealed late — near-black at the start), and the oak crop.
 */
function useKitchenTextures(src: string, onFail: () => void): KitchenTextures | null {
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

  return useMemo(() => {
    if (!img) return null;
    const maxAniso = gl.capabilities.getMaxAnisotropy();

    let backdrop: THREE.Texture;
    const bg = document.createElement("canvas");
    bg.width = 1536;
    bg.height = 1152;
    const bgCtx = bg.getContext("2d");
    if (bgCtx) {
      bgCtx.filter = "blur(2px)";
      drawCover(bgCtx, img, bg.width, bg.height, 8);
      bgCtx.filter = "none";
      const vig = bgCtx.createRadialGradient(
        bg.width / 2,
        bg.height * 0.42,
        bg.height * 0.35,
        bg.width / 2,
        bg.height * 0.42,
        bg.width * 0.72,
      );
      vig.addColorStop(0, "rgba(8, 8, 6, 0)");
      vig.addColorStop(1, "rgba(8, 8, 6, 0.34)");
      bgCtx.fillStyle = vig;
      bgCtx.fillRect(0, 0, bg.width, bg.height);
      const tex = new THREE.CanvasTexture(bg);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, maxAniso);
      backdrop = tex;
    } else {
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      backdrop = tex;
    }

    let env: THREE.Texture | null = null;
    const ec = document.createElement("canvas");
    ec.width = 1024;
    ec.height = 512;
    const eCtx = ec.getContext("2d");
    if (eCtx) {
      eCtx.filter = "blur(18px)";
      drawCover(eCtx, img, ec.width, ec.height, 24);
      const tex = new THREE.CanvasTexture(ec);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      env = tex;
    }

    const oak = makeOakTextures(img, maxAniso);
    return {
      backdrop,
      env,
      oakMap: oak?.map ?? null,
      oakBump: oak?.bump ?? null,
    };
  }, [img, gl]);
}

/** The mobile shaft substitute: a soft warm column, faded at both ends. */
function makeBeamTexture(): THREE.CanvasTexture | null {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const gx = ctx.createLinearGradient(0, 0, 128, 0);
  gx.addColorStop(0, "rgba(255, 216, 166, 0)");
  gx.addColorStop(0.5, "rgba(255, 216, 166, 1)");
  gx.addColorStop(1, "rgba(255, 216, 166, 0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, 128, 256);
  const gy = ctx.createLinearGradient(0, 0, 0, 256);
  gy.addColorStop(0, "rgba(0, 0, 0, 0)");
  gy.addColorStop(0.18, "rgba(0, 0, 0, 0.9)");
  gy.addColorStop(0.75, "rgba(0, 0, 0, 1)");
  gy.addColorStop(1, "rgba(0, 0, 0, 0.55)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, 128, 256);
  ctx.globalCompositeOperation = "source-over";
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

type LetterMaterials = Record<GlyphMaterial, THREE.MeshPhysicalMaterial>;

function makeLetterMaterials(
  oakMap: THREE.Texture | null,
  oakBump: THREE.Texture | null,
): LetterMaterials {
  return {
    // Real veneer from the photograph; a whisper of clearcoat = oiled oak,
    // so the raking key gets a grazing specular to catch.
    oak: new THREE.MeshPhysicalMaterial({
      map: oakMap ?? undefined,
      color: oakMap ? "#ffffff" : "#a3794f",
      roughness: 0.58,
      metalness: 0,
      bumpMap: oakBump ?? undefined,
      bumpScale: 0.05,
      clearcoat: 0.08,
      clearcoatRoughness: 0.5,
    }),
    // Matte graphite lacquer under clearcoat — the bevel-glint material.
    graphite: new THREE.MeshPhysicalMaterial({
      color: "#24251d",
      roughness: 0.3,
      metalness: 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.22,
    }),
    // The brand panel. Emissive stays 0 until the ignition beat.
    lime: new THREE.MeshPhysicalMaterial({
      color: "#ccdf10",
      roughness: 0.34,
      metalness: 0,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3,
      emissive: new THREE.Color("#ccdf10"),
      emissiveIntensity: 0,
    }),
  };
}

function Letters({
  materials,
  scale,
  small,
}: {
  materials: LetterMaterials;
  scale: number;
  small: boolean;
}) {
  const shapes = useMemo(() => GLYPHS.map(glyphShape), []);

  const placed = useMemo(() => {
    let cursor = -WORD_WIDTH / 2;
    return GLYPHS.map((g, i) => {
      const x = cursor;
      cursor += g.width + LETTER_GAP;
      return { g, x, shape: shapes[i] as THREE.Shape };
    });
  }, [shapes]);

  return (
    <group scale={scale}>
      {placed.map(({ g, x, shape }, i) => (
        <mesh
          key={i}
          position={[x, 0.012, -PANEL_DEPTH / 2]}
          material={materials[g.material]}
          castShadow
          receiveShadow
        >
          <extrudeGeometry args={[shape, EXTRUDE]} />
        </mesh>
      ))}
      {/* Grounding blob for the final, environment-lit frame; the raking
          beats get true directional shadows from the key instead. */}
      <ContactShadows
        position={[-0.18, 0, 0.05]}
        scale={[WORD_WIDTH + 1.8, 2.6]}
        far={1.4}
        blur={2.4}
        opacity={0.5}
        resolution={small ? 256 : 512}
        frames={1}
        color="#12110b"
      />
    </group>
  );
}

/* ------------------------------------------------------- postprocessing -- */

const Post = memo(function Post({
  small,
  fixed,
  sun,
  dofRef,
}: {
  small: boolean;
  fixed: boolean;
  sun: THREE.Mesh | null;
  dofRef: RefObject<DepthOfFieldEffect | null>;
}) {
  /* The library wrapper does not dispose the composer or the GodRays effect
     on unmount/recreation — callback refs dispose the previous instance. */
  const prevComposer = useRef<EffectComposerImpl | null>(null);
  const composerRef = useCallback((c: EffectComposerImpl | null) => {
    if (prevComposer.current && prevComposer.current !== c) {
      try {
        prevComposer.current.dispose();
      } catch {
        /* context already lost — nothing left to free */
      }
    }
    prevComposer.current = c;
  }, []);

  const prevRays = useRef<GodRaysEffect | null>(null);
  const raysRef = useCallback((e: GodRaysEffect | null) => {
    if (prevRays.current && prevRays.current !== e) {
      try {
        prevRays.current.dispose();
      } catch {
        /* already gone */
      }
    }
    prevRays.current = e;
  }, []);

  const effects: ReactElement[] = [];
  if (!small) {
    effects.push(
      <DepthOfField
        key="dof"
        ref={dofRef}
        worldFocusDistance={7.2}
        worldFocusRange={3.2}
        bokehScale={3.2}
      />,
    );
  }
  if (!small && !fixed && sun) {
    effects.push(
      <GodRays
        key="rays"
        ref={raysRef}
        sun={sun}
        samples={56}
        density={0.96}
        decay={0.945}
        weight={0.75}
        exposure={0.5}
        clampMax={1}
        resolutionScale={0.5}
        blur
      />,
    );
  }
  effects.push(
    <Bloom
      key="bloom"
      mipmapBlur
      luminanceThreshold={1}
      luminanceSmoothing={0.2}
      intensity={1}
      radius={0.72}
    />,
    <ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />,
    <Vignette key="vignette" eskil={false} offset={0.26} darkness={0.62} />,
    <Noise key="grain" opacity={0.05} />,
  );

  return (
    <EffectComposer ref={composerRef} multisampling={small ? 0 : 4}>
      {effects}
    </EffectComposer>
  );
});

/* -------------------------------------------------------- cinematography -- */

const V_POS = new THREE.Vector3();
const V_LOOK = new THREE.Vector3();
const V_DIR = new THREE.Vector3();
const V_UP = new THREE.Vector3();

/**
 * The entire lighting rig, the camera, and every scrubbed parameter, driven
 * from one useFrame. `progress === null` (reduced motion) applies the fully
 * revealed grade(1) with no drift, rendered on demand.
 */
function Cinematography({
  progress,
  scale,
  targetY,
  small,
  limeMat,
  backdropMat,
  dofRef,
  onSun,
}: {
  progress: MotionValue<number> | null;
  scale: number;
  targetY: number;
  small: boolean;
  limeMat: THREE.MeshPhysicalMaterial;
  backdropMat: RefObject<THREE.MeshBasicMaterial | null>;
  dofRef: RefObject<DepthOfFieldEffect | null>;
  onSun: (m: THREE.Mesh | null) => void;
}) {
  const fixed = progress === null;
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  const keyRef = useRef<THREE.SpotLight | null>(null);
  const keyTargetRef = useRef<THREE.Object3D | null>(null);
  const rimRef = useRef<THREE.DirectionalLight | null>(null);
  const fillRef = useRef<THREE.DirectionalLight | null>(null);
  const limeLightRef = useRef<THREE.PointLight | null>(null);
  const sunRef = useRef<THREE.Mesh | null>(null);
  const sunMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const beamRef = useRef<THREE.Mesh | null>(null);
  const beamMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const floorRef = useRef<THREE.Mesh | null>(null);
  const floorMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const barTopRef = useRef<THREE.Mesh | null>(null);
  const barBotRef = useRef<THREE.Mesh | null>(null);

  const smoothed = useRef(0);
  const grade = useRef<Grade>(makeGrade());

  const handleSun = useCallback(
    (m: THREE.Mesh | null) => {
      sunRef.current = m;
      onSun(m);
    },
    [onSun],
  );

  const beamTex = useMemo(() => makeBeamTexture(), []);
  useEffect(() => {
    return () => {
      beamTex?.dispose();
    };
  }, [beamTex]);

  // Hard shadows need a real target object in the scene.
  useEffect(() => {
    const key = keyRef.current;
    const tgt = keyTargetRef.current;
    if (key && tgt) key.target = tgt;
  }, []);

  // Atmospheric haze — dense enough for the shafts, cleared in beat 4.
  useEffect(() => {
    scene.fog = new THREE.FogExp2("#050503", 0.048);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  // Reduced motion: pose once, render a handful of demand frames to settle.
  useEffect(() => {
    if (!fixed) return;
    let n = 0;
    let id = requestAnimationFrame(function kick() {
      invalidate();
      if (++n < 6) id = requestAnimationFrame(kick);
    });
    return () => cancelAnimationFrame(id);
  }, [fixed, invalidate]);

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const raw = progress ? THREE.MathUtils.clamp(progress.get(), 0, 1) : 1;
    // Tighter damping than a gentle scrub — the strike and the snaps must
    // stay snappy; 4.2 tracks scroll closely without frame-stepping.
    smoothed.current = fixed
      ? 1
      : THREE.MathUtils.damp(smoothed.current, raw, 4.2, delta);
    const t = smoothed.current;
    const g = evalGrade(t, grade.current);

    // -- camera: slow push-in, centimetre handheld drift -------------------
    const e = easeInOutCubic(t);
    V_POS.lerpVectors(CAM_START, CAM_END, e);
    const s = state.clock.elapsedTime;
    if (!fixed) {
      V_POS.x += 0.022 * Math.sin(s * 0.43 + 1.7) + 0.01 * Math.sin(s * 1.11);
      V_POS.y += 0.014 * Math.sin(s * 0.57 + 0.6) + 0.007 * Math.sin(s * 1.31 + 2.2);
      V_POS.z += 0.012 * Math.sin(s * 0.36 + 3.1);
    }
    cam.position.copy(V_POS);
    const lookY = targetY + (fixed ? 0 : 0.008 * Math.sin(s * 0.49 + 1.1));
    cam.lookAt(0, lookY, 0);

    // -- the travelling source ---------------------------------------------
    const sunX = (-SWEEP_HALF + 2 * SWEEP_HALF * g.sweep) * scale;
    const key = keyRef.current;
    if (key) {
      key.position.set(
        THREE.MathUtils.clamp(sunX * 1.05, -4.2 * scale, 4.2 * scale),
        3.1,
        2.7,
      );
      key.intensity = 150 * g.key;
    }
    keyTargetRef.current?.position.set(
      THREE.MathUtils.clamp(sunX * 0.45, -2 * scale, 2 * scale),
      targetY * 0.8,
      0,
    );

    const sunI = 9 * g.sun;
    const sun = sunRef.current;
    if (sun) {
      sun.position.set(sunX, 0.62 * scale, SUN_Z);
      sun.visible = g.sun > 0.002;
    }
    sunMatRef.current?.color.setRGB(sunI, sunI * 0.82, sunI * 0.58);

    const beam = beamRef.current;
    if (beam) {
      beam.position.set(sunX, 1.3 * scale, SUN_Z - 0.02);
      beam.scale.set(1.25 * scale, 4.6 * scale, 1);
      beam.visible = g.sun > 0.002;
    }
    const beamMat = beamMatRef.current;
    if (beamMat) beamMat.opacity = g.sun * (small ? 0.95 : 0.45);

    // -- rising fill, rim, environment, lime -------------------------------
    if (rimRef.current) rimRef.current.intensity = g.rim;
    if (fillRef.current) fillRef.current.intensity = g.fill;
    scene.environmentIntensity = g.env;
    backdropMat.current?.color.setScalar(g.photo);
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = g.fog;

    const floorMat = floorMatRef.current;
    if (floorMat) {
      floorMat.opacity = g.floor;
      // Opaque while it is the stage (so the letterbox always wins the
      // depth/queue fight), transparent only for its cross-fade out.
      floorMat.transparent = g.floor < 0.999;
    }
    if (floorRef.current) floorRef.current.visible = g.floor > 0.004;

    limeMat.emissiveIntensity = g.lime;
    if (limeLightRef.current) limeLightRef.current.intensity = g.lime * 2.2;

    // -- focus: short in the dark, racking onto the letters as light lands -
    V_LOOK.set(0, targetY, 0);
    const letterDist = cam.position.distanceTo(V_LOOK);
    const focus = letterDist * (0.58 + 0.42 * g.rack);
    const dof = dofRef.current;
    if (dof) dof.cocMaterial.worldFocusDistance = focus;

    // -- anamorphic letterbox: camera-locked planes at the focus distance --
    // (in focus under DoF; they write depth, so GodRays never streak across
    // the matte and transparencies behind them are clipped).
    const h = 2 * Math.tan((cam.fov * Math.PI) / 360) * focus;
    const w = h * cam.aspect * 1.15;
    const frac =
      THREE.MathUtils.clamp(0.5 * (1 - cam.aspect / 2.39), 0.055, 0.125) * g.bars;
    cam.getWorldDirection(V_DIR);
    V_UP.set(0, 1, 0).applyQuaternion(cam.quaternion);
    const bars: Array<[THREE.Mesh | null, number]> = [
      [barTopRef.current, 1],
      [barBotRef.current, -1],
    ];
    for (const [bar, side] of bars) {
      if (!bar) continue;
      bar.visible = frac > 0.0006;
      bar.position
        .copy(cam.position)
        .addScaledVector(V_DIR, focus * 0.995)
        .addScaledVector(V_UP, side * ((h - h * frac) / 2));
      bar.quaternion.copy(cam.quaternion);
      bar.scale.set(w, Math.max(h * frac, 1e-4), 1);
    }
  });

  return (
    <>
      {/* THE key: one hard, small, travelling source with real shadows. */}
      <spotLight
        ref={keyRef}
        color="#ffd9a6"
        intensity={0}
        angle={0.62}
        penumbra={0.3}
        decay={2}
        position={[-5, 3.1, 2.7]}
        castShadow
        shadow-mapSize={small ? [512, 512] : [1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={26}
      />
      <object3D ref={keyTargetRef} position={[0, targetY * 0.8, 0]} />

      {/* Cool rim — its 0.035 base is beat 1's "sensed mass"; it SNAPS to
          full at t≈0.50, the sharpest cut in the film. */}
      <directionalLight
        ref={rimRef}
        color="#9fb6d8"
        intensity={0.035}
        position={[-3.5, 4.5, -5.5]}
      />
      {/* Neutral fill, rising only in the hand-over. */}
      <directionalLight ref={fillRef} color="#e9e4d6" intensity={0} position={[-5, 3, 6]} />
      {/* Lime spill onto the B as the brand panel ignites. */}
      <pointLight
        ref={limeLightRef}
        color="#ccdf10"
        intensity={0}
        distance={3.4 * scale}
        decay={2}
        position={[1.81 * scale, 0.55 * scale, 0.85]}
      />

      {/* The occluded source behind the letters — GodRays' "sun". The effect
          re-parents it into its own light scene, so positions are world-space
          on purpose (never nest this in a scaled group). */}
      <mesh
        ref={handleSun}
        position={[-SWEEP_HALF * scale, 0.62 * scale, SUN_Z]}
        scale={scale}
        visible={false}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.3, 24, 16]} />
        <meshBasicMaterial ref={sunMatRef} color="#000000" fog={false} />
      </mesh>

      {/* Volumetric-shaft approximation: additive column occluded by the
          letters via the depth buffer. Faint thickener on desktop, the whole
          shaft story on mobile. */}
      <mesh ref={beamRef} position={[0, 1.3 * scale, SUN_Z - 0.02]} visible={false} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={beamMatRef}
          map={beamTex ?? undefined}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </mesh>

      {/* The dark stage floor: receives the sweeping pool and the long raking
          letter shadows, then cross-fades out as the kitchen's own floor
          resolves in the photograph. */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.004, -1]}
        receiveShadow
      >
        <planeGeometry args={[44, 22]} />
        <meshStandardMaterial
          ref={floorMatRef}
          color="#0b0b09"
          roughness={0.9}
          metalness={0}
          opacity={1}
        />
      </mesh>

      {/* Anamorphic mattes. depthFunc=Always + last renderOrder: they always
          win the colour buffer AND write near depth, which keeps god-ray
          streaks and transparencies off the matte. */}
      <mesh ref={barTopRef} renderOrder={999} visible={false} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#000000" depthFunc={THREE.AlwaysDepth} fog={false} />
      </mesh>
      <mesh ref={barBotRef} renderOrder={999} visible={false} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#000000" depthFunc={THREE.AlwaysDepth} fog={false} />
      </mesh>
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
  const scene = useThree((s) => s.scene);
  const size = useThree((s) => s.size);

  const [sun, setSun] = useState<THREE.Mesh | null>(null);
  const dofRef = useRef<DepthOfFieldEffect | null>(null);
  const backdropMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const materials = useMemo(
    () => (textures ? makeLetterMaterials(textures.oakMap, textures.oakBump) : null),
    [textures],
  );

  useEffect(() => {
    if (!materials) return;
    return () => {
      for (const m of Object.values(materials)) m.dispose();
    };
  }, [materials]);

  useEffect(() => {
    if (!textures) return;
    return () => {
      textures.backdrop.dispose();
      textures.env?.dispose();
      textures.oakMap?.dispose();
      textures.oakBump?.dispose();
    };
  }, [textures]);

  // The environment is a REVEAL: assigned immediately, held at intensity 0
  // until beat 4 raises it (the rig owns environmentIntensity per frame).
  useEffect(() => {
    const env = textures?.env;
    if (!env) return;
    scene.environment = env;
    scene.environmentIntensity = 0;
    return () => {
      scene.environment = null;
      scene.environmentIntensity = 1;
    };
  }, [scene, textures]);

  // Signal readiness on the frame after the textures have committed.
  useEffect(() => {
    if (!textures) return;
    const id = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(id);
  }, [textures, onReady]);

  // Fit the word to ~88% of viewport width at the end-of-dolly distance.
  const aspect = size.width / Math.max(1, size.height);
  const viewW = 2 * Math.tan((FOV * Math.PI) / 360) * 7.4 * aspect;
  const letterScale = Math.min(MAX_LETTER_SCALE, (viewW * 0.88) / WORD_WIDTH);
  const targetY = letterScale * 0.5;
  const small = size.width < 640;

  /* Backdrop cover math inherited from the verified original: 30x22.5 at
     z=-8 covers every aspect to ~1.9; ultrawide scales the plane uniformly
     and re-anchors so the baseline stays on the photographed floor. */
  const planeScale = Math.max(1, aspect / 1.7);
  const planeY = -1.675 + 3.825 * planeScale;

  // Poster (in the wrapper) shows until the photo arrives.
  if (!textures || !materials) return null;

  return (
    <>
      <color attach="background" args={["#040403"]} />

      {/* The room. Unlit; its colour scalar IS the beat-4 reveal — black at
          the start, full photographic brightness only once the sweep ends. */}
      <mesh position={[0, planeY, -8]} scale={planeScale}>
        <planeGeometry args={[30, 22.5]} />
        <meshBasicMaterial ref={backdropMatRef} map={textures.backdrop} color="#000000" />
      </mesh>

      <Letters materials={materials} scale={letterScale} small={small} />

      <Cinematography
        progress={progress}
        scale={letterScale}
        targetY={targetY}
        small={small}
        limeMat={materials.lime}
        backdropMat={backdropMatRef}
        dofRef={dofRef}
        onSun={setSun}
      />

      <Post small={small} fixed={progress === null} sun={sun} dofRef={dofRef} />
    </>
  );
}

export default function SceneReveal({
  src,
  progress,
  active,
  dprMax,
  onReady,
  onFail,
}: SceneRevealProps) {
  const failed = useRef(false);

  return (
    <Canvas
      shadows
      frameloop={progress ? (active ? "always" : "never") : "demand"}
      dpr={[1, dprMax]}
      camera={{ fov: FOV, near: 0.1, far: 80, position: CAM_START.toArray() }}
      gl={{
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
      }}
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
  );
}
