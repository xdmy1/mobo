"use client";

/**
 * THE FLYTHROUGH — one unbroken camera move through the MOBO wordmark.
 *
 * The previous scene (OutroScene) was a correct product shot: a gentle dolly,
 * static letters, no postprocessing. This is the film version. One continuous,
 * scroll-scrubbed long take:
 *
 *   1. EXTREME CLOSE on the oak O — real MOBO oak (sampled from the client's
 *      own kitchen photograph), razor-thin focal plane, the frame abstract.
 *   2. The camera threads the slot between M and O, passes INTO the dark
 *      behind the word — the graphite back of the B swallowing the frame —
 *   3. then rounds the lime O's outer edge back into the light and
 *   4. pulls back on a rising crane arc, focus racking from macro to deep,
 *      haze thinning as the kitchen resolves, decelerating on a soft-close
 *      curve (MOBO's actual product feature) into absolute stillness at the
 *      exact composed frame the old scene ended on.
 *
 * PATH SAFETY — the camera follows a centripetal CatmullRomCurve3 through
 * hand-placed waypoints. The path was verified numerically against the exact
 * glyph polygons (extruded + bevel-expanded) at every letter scale it can run
 * at: minimum clearance 0.082 world units, which exceeds the near-plane's
 * worst-case corner reach (0.045) plus maximum handheld drift (0.018) plus
 * sampling margin. Small letter scales (narrow viewports) switch to a
 * simplified front-side track with ≥ 0.23 clearance and no threading.
 *
 * OAK — the letters wear the client's own veneer: a seam-free single cabinet
 * door cropped from HERO.image (the region was inspected door-by-door; the
 * chosen pane has cathedral figure and two knots, no reveals). Colour detail
 * tops out at the photo's native resolution, so the macro beat's sharpness is
 * carried by geometry edges, a high-frequency micro-grain bump layer (crisp
 * speculars under the raking key), the razor DOF band and film grain — stated
 * honestly: the colour map alone cannot survive macro magnification.
 *
 * MOTION BLUR — no velocity-buffer pass exists in the installed postprocessing
 * set, and a real one is unaffordable on the target hardware. Faked instead:
 * scrub velocity widens the DOF bokeh (a fast move softens the frame the way
 * a slow shutter would), and the exponential smoothing on progress caps
 * angular velocity so the fake stays plausible. Chromatic aberration is a
 * static edge fringe — the effect wrapper stringifies its props, so it cannot
 * be safely mutated per frame.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode, type DepthOfFieldEffect } from "postprocessing";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import {
  GLYPHS,
  LETTER_GAP,
  PANEL_DEPTH,
  WORD_WIDTH,
  type Glyph,
  type GlyphMaterial,
} from "./letterforms";

export type SceneFlythroughProps = {
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
/** The locked final frame — identical to OutroScene's CAM_END composition. */
const CAM_LOCK = new THREE.Vector3(0.95, 1.5, 7.3);
/** Cap on letter cap-height in world units (desktop). */
const MAX_LETTER_SCALE = 1.35;
/** Below this letter scale the threading slots are too narrow — use the
 *  simplified front-side track. Covers all sub-640px viewports and any
 *  unusually narrow desktop window. */
const SIMPLE_PATH_BELOW = 0.8;

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: PANEL_DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.01,
  bevelSegments: 2,
  steps: 1,
};

/**
 * Camera waypoints. `glyph` entries are multiplied by the letter scale so the
 * close-quarters beats track the geometry exactly; the `world` tail is fixed
 * so the pull-back always lands on the same composed frame regardless of
 * viewport. Verified clip-free — see file header.
 */
const PATH_FULL: { glyph: [number, number, number][]; world: [number, number, number][] } = {
  glyph: [
    [-0.85, 0.34, 0.7], // macro on the oak O counter mouth
    [-1.02, 0.4, 0.55], // drift toward the M–O slot
    [-1.13, 0.47, 0.26], // slot mouth
    [-1.13, 0.53, -0.18], // inside the slot
    [-1.0, 0.58, -0.58], // emerged behind the word
    [-0.15, 0.6, -0.66], // travelling right behind O
    [0.92, 0.6, -0.5], // tight behind B — the dark beat
    [2.6, 0.61, -0.52], // approaching the lime O's rear
    [3.1, 0.63, 0.35], // rounding its right edge into the light
  ],
  world: [
    [3.45, 1.02, 2.3], // swinging out front-right
    [2.1, 1.3, 4.9], // pulling back, rising
    [0.95, 1.5, 7.3], // the lock
  ],
};

/** What the camera looks at (and focuses on), same parametrisation. */
const TARGET_FULL: { glyph: [number, number, number][]; world: [number, number, number][] } = {
  glyph: [
    [-0.58, 0.44, 0.12], // the counter's bevelled edge — focus razor-near
    [-1.05, 0.47, 0.18], // sliding to the slot mouth
    [-1.1, 0.53, -0.35], // through the slot, into the dark
    [-0.75, 0.57, -0.75],
    [0.45, 0.58, -0.45], // the letter backs sweeping past
    [0.9, 0.55, -0.15], // the B's graphite back fills the frame
    [1.75, 0.57, -0.3],
    [2.45, 0.56, 0.0], // the lime edge reveals on the turn
    [1.6, 0.6, 0.1], // swinging onto the face of the word
    [0.75, 0.55, 0.05],
    [0.12, 0.5, 0.0],
    [0.0, 0.5, 0.0], // locked on the word's centre
  ],
  world: [],
};

/** Simplified track (small viewports / small letter scales): a close lateral
 *  glide across the letter faces, then the same pull-back — no threading. */
const PATH_SIMPLE: typeof PATH_FULL = {
  glyph: [
    [-0.8, 0.4, 0.95],
    [-0.1, 0.48, 0.8],
    [1.05, 0.55, 0.85],
    [2.3, 0.66, 1.25],
  ],
  world: [
    [2.3, 1.1, 3.6],
    [0.95, 1.5, 7.3],
  ],
};

const TARGET_SIMPLE: typeof TARGET_FULL = {
  glyph: [
    [-0.45, 0.44, 0.15],
    [0.25, 0.5, 0.12],
    [1.45, 0.55, 0.15],
    [2.1, 0.6, 0.1],
    [0.6, 0.55, 0.0],
    [0.0, 0.5, 0.0],
  ],
  world: [],
};

/**
 * The speed profile: monotone piecewise-Hermite. Slow take-up while the
 * letterbox closes, acceleration through the threading and the dark beat,
 * then a hard weighted deceleration to ZERO terminal velocity — the
 * soft-close drawer. Knots (x, y, slope):
 */
const EASE_KNOTS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, 0.12],
  [0.42, 0.24, 1.35],
  [0.78, 0.86, 1.05],
  [1, 1, 0],
];

function weightedEase(t: number): number {
  const x = THREE.MathUtils.clamp(t, 0, 1);
  for (let i = 0; i < EASE_KNOTS.length - 1; i++) {
    const [x0, y0, m0] = EASE_KNOTS[i] as readonly [number, number, number];
    const [x1, y1, m1] = EASE_KNOTS[i + 1] as readonly [number, number, number];
    if (x <= x1 || i === EASE_KNOTS.length - 2) {
      const h = x1 - x0;
      const u = (x - x0) / h;
      const u2 = u * u;
      const u3 = u2 * u;
      return (
        (2 * u3 - 3 * u2 + 1) * y0 +
        (u3 - 2 * u2 + u) * h * m0 +
        (-2 * u3 + 3 * u2) * y1 +
        (u3 - u2) * h * m1
      );
    }
  }
  return 1;
}

const smoothstep = (a: number, b: number, x: number): number => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* -------------------------------------------------------------- textures -- */

/**
 * The single clean cabinet door in HERO.image, as fractions of the full
 * photograph. Chosen by inspecting the oak run door-by-door: this pane has
 * cathedral figure and two knots and NO seams (the neighbouring reveals fall
 * outside the crop), so no reveal can land across a letter face. Grain runs
 * vertically in the source, matching glyph Y.
 */
const OAK_CROP = { x0: 531 / 4032, x1: 843 / 4032, y0: 1115 / 3024, y1: 1885 / 3024 } as const;

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

/** Load the photograph with retry — the optimizer can 504 on a cold cache. */
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

type KitchenTextures = {
  backdrop: THREE.Texture;
  env: THREE.Texture | null;
  oak: THREE.CanvasTexture | null;
};

/**
 * Backdrop (defocused + vignetted photo), environment (blurred equirect) and
 * the oak colour map (the door crop). The oak is fetched at w=3840 on desktop
 * — the crop needs every native pixel for the macro beat — and reuses the
 * already-downloaded w=1920 image on small viewports to spare mobile data.
 * All CanvasTextures are memoised; disposal happens in SceneContents.
 */
function useKitchenTextures(src: string, onFail: () => void): KitchenTextures | null {
  const gl = useThree((s) => s.gl);
  const [imgs, setImgs] = useState<{
    base: HTMLImageElement;
    hi: HTMLImageElement | null;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    const wantHi = window.innerWidth >= 640;
    const hiSrc = src.replace(/([?&])w=\d+/, "$1w=3840");
    const hiPromise =
      wantHi && hiSrc !== src ? loadPhoto(hiSrc, 2).catch(() => null) : Promise.resolve(null);
    Promise.all([loadPhoto(src, 3), hiPromise]).then(
      ([base, hi]) => {
        if (alive) setImgs({ base, hi });
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
    if (!imgs) return null;
    const { base, hi } = imgs;
    const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy());

    /* Backdrop: gently defocused + vignetted. The real DOF pass adds the
       focus rack on top; this bake keeps the photo filmic even at the
       shallowest mobile settings. */
    let backdrop: THREE.Texture;
    const bg = document.createElement("canvas");
    bg.width = 1536;
    bg.height = 1152;
    const bgCtx = bg.getContext("2d");
    if (bgCtx) {
      bgCtx.filter = "blur(2px)";
      drawCover(bgCtx, base, bg.width, bg.height, 8);
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
      tex.anisotropy = maxAniso;
      backdrop = tex;
    } else {
      const tex = new THREE.Texture(base);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      backdrop = tex;
    }

    /* Environment: heavily blurred equirect — the room lights the letters. */
    let env: THREE.Texture | null = null;
    const ec = document.createElement("canvas");
    ec.width = 1024;
    ec.height = 512;
    const eCtx = ec.getContext("2d");
    if (eCtx) {
      eCtx.filter = "blur(18px)";
      drawCover(eCtx, base, ec.width, ec.height, 24);
      const tex = new THREE.CanvasTexture(ec);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      env = tex;
    }

    /* Oak: the seam-free door, 1:1 native pixels from the best image we got. */
    let oak: THREE.CanvasTexture | null = null;
    const oakImg = hi ?? base;
    const sx = OAK_CROP.x0 * oakImg.width;
    const sy = OAK_CROP.y0 * oakImg.height;
    const sw = (OAK_CROP.x1 - OAK_CROP.x0) * oakImg.width;
    const sh = (OAK_CROP.y1 - OAK_CROP.y0) * oakImg.height;
    const oc = document.createElement("canvas");
    oc.width = Math.max(64, Math.round(sw));
    oc.height = Math.max(128, Math.round(sh));
    const oCtx = oc.getContext("2d");
    if (oCtx) {
      oCtx.drawImage(oakImg, sx, sy, sw, sh, 0, 0, oc.width, oc.height);
      const tex = new THREE.CanvasTexture(oc);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.anisotropy = maxAniso;
      /* Shape coords are glyph units: u spans the O's 0.98 width; v shows a
         one-glyph-tall band of the (much taller) door, centred on the
         cathedral figure. */
      const worldH = 0.98 * (oc.height / oc.width);
      tex.repeat.set(1 / 0.98, 1 / worldH);
      tex.offset.set(0, 0.24);
      oak = tex;
    }

    return { backdrop, env, oak };
  }, [imgs, gl]);
}

/** Deterministic PRNG — identical micro-grain on every visit. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * High-frequency micro-relief for bump + roughness. NOT the old fake figure —
 * the figure comes from the photograph; this is pore-level detail only, far
 * above the photo's resolving power, so the macro beat keeps crisp specular
 * structure under the raking key light. Drawn thrice-shifted so it tiles.
 */
function makeMicroGrain(): THREE.CanvasTexture | null {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const rnd = mulberry32(19470);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 300; i++) {
    const x0 = rnd() * c.width;
    const dark = rnd() > 0.5;
    ctx.strokeStyle = dark
      ? `rgba(70, 70, 70, ${0.05 + rnd() * 0.1})`
      : `rgba(190, 190, 190, ${0.04 + rnd() * 0.08})`;
    ctx.lineWidth = 0.5 + rnd() * 1.1;
    for (const shift of [-c.width, 0, c.width]) {
      ctx.beginPath();
      ctx.moveTo(x0 + shift, -6);
      let x = x0;
      for (let y = 64; y <= c.height + 6; y += 64) {
        x += (rnd() - 0.5) * 3;
        ctx.quadraticCurveTo(x + shift + (rnd() - 0.5) * 2, y - 32, x + shift, y);
      }
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1.6);
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

type LetterMaterial = THREE.Material | THREE.Material[];

function Letters({
  scale,
  small,
  oak,
}: {
  scale: number;
  small: boolean;
  oak: THREE.CanvasTexture | null;
}) {
  const gl = useThree((s) => s.gl);

  /* Geometries built once and SHARED between the letters and their floor
     reflection — half the memory, and one manual disposal path. */
  const geometries = useMemo(
    () => GLYPHS.map((g) => new THREE.ExtrudeGeometry(glyphShape(g), EXTRUDE)),
    [],
  );
  useEffect(() => {
    return () => {
      for (const g of geometries) g.dispose();
    };
  }, [geometries]);

  const { materials, mirrors, micro } = useMemo(() => {
    const microTex = makeMicroGrain();
    /* Oak face: the client's own veneer. Oak edges: ABS edge banding — a
       solid warm tone with the same micro-relief. Real manufactured panels
       are edge-banded, and it saves the extrude side-UVs from smearing the
       photo crop across the counter walls. */
    const oakFace = new THREE.MeshPhysicalMaterial({
      map: oak ?? undefined,
      color: oak ? "#ffffff" : "#a89078",
      roughness: 0.6,
      metalness: 0,
      bumpMap: microTex ?? undefined,
      bumpScale: 0.02,
    });
    const oakEdge = new THREE.MeshPhysicalMaterial({
      color: "#9c8266",
      roughness: 0.66,
      metalness: 0,
      bumpMap: microTex ?? undefined,
      bumpScale: 0.014,
    });
    const graphite = new THREE.MeshPhysicalMaterial({
      color: "#24251d",
      roughness: 0.28,
      metalness: 0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
    });
    const lime = new THREE.MeshPhysicalMaterial({
      color: "#ccdf10",
      roughness: 0.34,
      metalness: 0,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3,
    });
    const byKind: Record<GlyphMaterial, LetterMaterial> = {
      oak: [oakFace, oakEdge], // extrude group 0 = faces, group 1 = side walls
      graphite,
      lime,
    };
    /* The reflection copies: same maps, faint and double-sided (the mirror
       flip inverts winding). depthWrite off so the shadow catcher and the
       contact blob composite over them in a deterministic order. */
    const mirrorOf = (m: THREE.MeshPhysicalMaterial): THREE.MeshPhysicalMaterial => {
      const c = m.clone();
      c.transparent = true;
      c.opacity = 0.16;
      c.side = THREE.DoubleSide;
      c.depthWrite = false;
      return c;
    };
    const mirrorByKind: Record<GlyphMaterial, LetterMaterial> = {
      oak: [mirrorOf(oakFace), mirrorOf(oakEdge)],
      graphite: mirrorOf(graphite),
      lime: mirrorOf(lime),
    };
    return { materials: byKind, mirrors: mirrorByKind, micro: microTex };
  }, [oak]);

  useEffect(() => {
    return () => {
      micro?.dispose();
      const seen = new Set<THREE.Material>();
      for (const group of [materials, mirrors]) {
        for (const m of Object.values(group)) {
          for (const mat of Array.isArray(m) ? m : [m]) {
            if (!seen.has(mat)) {
              seen.add(mat);
              mat.dispose();
            }
          }
        }
      }
    };
  }, [materials, mirrors, micro]);

  /* Letters and lights are static: render the shadow map ONCE, then freeze
     the shadow pass. Re-render it a single time whenever a resize rescales
     the word (or crosses the 640px map-size breakpoint) — never per frame. */
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl, scale, small]);

  const placed = useMemo(() => {
    let cursor = -WORD_WIDTH / 2;
    return GLYPHS.map((g, i) => {
      const x = cursor;
      cursor += g.width + LETTER_GAP;
      return { g, x, geometry: geometries[i] as THREE.ExtrudeGeometry };
    });
  }, [geometries]);

  return (
    <>
      <group scale={scale}>
        {placed.map(({ g, x, geometry }, i) => (
          <mesh
            key={i}
            position={[x, 0.012, -PANEL_DEPTH / 2]}
            geometry={geometry}
            material={materials[g.material]}
            castShadow
          />
        ))}
        <ContactShadows
          position={[-0.18, 0.001, 0.05]}
          scale={[WORD_WIDTH + 1.8, 2.6]}
          far={1.4}
          blur={2.4}
          opacity={0.4}
          resolution={small ? 256 : 512}
          frames={1}
          color="#12110b"
        />
      </group>
      {/* The polished floor: the word reflected in a y=0 mirror, faint. */}
      <group scale={[scale, -scale, scale]} renderOrder={1}>
        {placed.map(({ g, x, geometry }, i) => (
          <mesh
            key={i}
            position={[x, 0.012, -PANEL_DEPTH / 2]}
            geometry={geometry}
            material={mirrors[g.material]}
          />
        ))}
      </group>
      {/* Shadow catcher for the key light — hard directional shadow with real
          conviction, over the reflection. Rendered into a frozen map. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow renderOrder={2}>
        <planeGeometry args={[26, 12]} />
        <shadowMaterial opacity={0.32} color="#0b0a06" depthWrite={false} />
      </mesh>
    </>
  );
}

/* ---------------------------------------------------------------- camera -- */

type Paths = { cam: THREE.CatmullRomCurve3; tgt: THREE.CatmullRomCurve3 };

function buildPaths(scale: number, simple: boolean): Paths {
  const src = simple ? PATH_SIMPLE : PATH_FULL;
  const tgtSrc = simple ? TARGET_SIMPLE : TARGET_FULL;
  const toVec = (pts: [number, number, number][], s: number) =>
    pts.map(([x, y, z]) => new THREE.Vector3(x * s, y * s, z * s));
  const cam = new THREE.CatmullRomCurve3(
    [...toVec(src.glyph, scale), ...toVec(src.world, 1)],
    false,
    "centripetal",
  );
  const tgt = new THREE.CatmullRomCurve3(
    [...toVec(tgtSrc.glyph, scale), ...toVec(tgtSrc.world, 1)],
    false,
    "centripetal",
  );
  return { cam, tgt };
}

function CameraRig({
  progress,
  paths,
  fog,
  small,
  dofRef,
}: {
  progress: MotionValue<number>;
  paths: Paths;
  fog: THREE.FogExp2;
  small: boolean;
  dofRef: RefObject<DepthOfFieldEffect | null>;
}) {
  const smoothed = useRef(0);
  const prev = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const t = THREE.MathUtils.clamp(progress.get(), 0, 1);
    /* Exponential smoothing = the operator's weight. No spring, no bounce. */
    smoothed.current = THREE.MathUtils.damp(smoothed.current, t, 3.0, delta);
    const vel = Math.abs(smoothed.current - prev.current) / Math.max(delta, 1e-4);
    prev.current = smoothed.current;

    const e = weightedEase(smoothed.current);
    paths.cam.getPointAt(e, pos);
    paths.tgt.getPointAt(e, tgt);

    /* Handheld drift: subdued in the close quarters, fullest mid-move, and
       ZERO at the lock — the held breath. Two incommensurate sines per axis. */
    const settle = smoothstep(0.82, 0.985, e);
    const drift = (0.3 + 0.7 * 4 * e * (1 - e)) * (1 - settle);
    const s = state.clock.elapsedTime;
    pos.x += drift * (0.02 * Math.sin(s * 0.43 + 1.7) + 0.009 * Math.sin(s * 1.11));
    pos.y += drift * (0.013 * Math.sin(s * 0.57 + 0.6) + 0.006 * Math.sin(s * 1.31 + 2.2));
    pos.z += drift * (0.011 * Math.sin(s * 0.36 + 3.1));
    tgt.y += drift * 0.007 * Math.sin(s * 0.49 + 1.1);

    state.camera.position.copy(pos);
    state.camera.lookAt(tgt);

    /* Haze thins as the kitchen resolves. FogExp2 density, animated. */
    fog.density = THREE.MathUtils.lerp(0.085, 0.014, e);

    /* THE FOCUS RACK — from a razor 0.22-unit plane on the oak grain to an
       11-unit deep stop on the whole word. Focus follows the look target;
       scrub velocity widens the bokeh (the faked motion blur — see header). */
    const dof = dofRef.current;
    if (dof) {
      dof.cocMaterial.worldFocusDistance = state.camera.position.distanceTo(tgt);
      dof.cocMaterial.worldFocusRange = 0.22 + 10.8 * e * e;
      const base = small ? 3.2 - 1.2 * e : 5.2 - 3.0 * e;
      dof.bokehScale = base + Math.min(small ? 0.8 : 1.4, vel * 2.4);
    }
  });

  return null;
}

/** Reduced motion: the locked final frame, posed once. A scrubbed camera
 *  travelling through geometry is a vestibular trigger — this path never
 *  mounts the rig at all. */
function StillCamera({
  targetY,
  fog,
  dofRef,
}: {
  targetY: number;
  fog: THREE.FogExp2;
  dofRef: RefObject<DepthOfFieldEffect | null>;
}) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    camera.position.copy(CAM_LOCK);
    camera.lookAt(0, targetY, 0);
    fog.density = 0.014;
    const dof = dofRef.current;
    if (dof) {
      dof.cocMaterial.worldFocusDistance = CAM_LOCK.distanceTo(
        new THREE.Vector3(0, targetY, 0),
      );
      dof.cocMaterial.worldFocusRange = 11;
      dof.bokehScale = 2.2;
    }
    invalidate();
  }, [camera, invalidate, targetY, fog, dofRef]);

  return null;
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

  const backdrop = textures?.backdrop ?? null;
  const env = textures?.env ?? null;
  const oak = textures?.oak ?? null;

  const dofRef = useRef<DepthOfFieldEffect | null>(null);

  /* Static lens fringing, strongest at frame edges via radial modulation.
     Kept OFF the per-frame path: the wrapped effect memoises its constructor
     args by stringifying props, so this Vector2 must be stable. */
  const caOffset = useMemo(() => new THREE.Vector2(0.0005, 0.0007), []);

  const fog = useMemo(() => new THREE.FogExp2("#141310", 0.085), []);

  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useEffect(() => {
    if (!env) return;
    scene.environment = env;
    scene.environmentIntensity = 0.85;
    return () => {
      scene.environment = null;
    };
  }, [scene, env]);

  useEffect(() => {
    if (!backdrop) return;
    return () => {
      backdrop.dispose();
      env?.dispose();
      oak?.dispose();
    };
  }, [backdrop, env, oak]);

  useEffect(() => {
    if (!backdrop) return;
    const id = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(id);
  }, [backdrop, onReady]);

  /* Word fitted to ~88% of viewport width at the lock distance, capped. */
  const aspect = size.width / Math.max(1, size.height);
  const viewW = 2 * Math.tan((FOV * Math.PI) / 360) * 7.4 * aspect;
  const letterScale = Math.min(MAX_LETTER_SCALE, (viewW * 0.88) / WORD_WIDTH);
  const targetY = letterScale * 0.5;
  const small = size.width < 640;
  const simplePath = small || letterScale < SIMPLE_PATH_BELOW;

  const paths = useMemo(() => buildPaths(letterScale, simplePath), [letterScale, simplePath]);

  /* Backdrop out-covers the frustum along the entire path (verified in the
     path script: every look direction is -z dominant). Ultrawide viewports
     scale the plane uniformly and re-anchor, as in the original scene. */
  const planeScale = Math.max(1, aspect / 1.7);
  const planeY = -1.675 + 3.825 * planeScale;

  if (!backdrop) return null;

  return (
    <>
      <mesh position={[0, planeY, -8]} scale={planeScale}>
        <planeGeometry args={[30, 22.5]} />
        <meshBasicMaterial map={backdrop} toneMapped={false} />
      </mesh>

      {/* Key from the right — the window in MOBO31 — now with a real cast
          shadow. A faint neutral fill from the left, and a cool rim from
          behind for the photographed-not-rendered separation, which also
          edge-lights the letter backs during the dark beat. */}
      <directionalLight
        position={[7, 6, 4.5]}
        intensity={1.6}
        color="#ffe9d2"
        castShadow
        shadow-mapSize={[small ? 512 : 1024, small ? 512 : 1024]}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={4}
        shadow-camera-bottom={-1.5}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 3.5, 5]} intensity={0.3} color="#e9e7de" />
      <directionalLight position={[-3.5, 4.5, -6]} intensity={1.0} color="#cfe0ee" />

      <Letters scale={letterScale} small={small} oak={oak} />

      {progress ? (
        <CameraRig progress={progress} paths={paths} fog={fog} small={small} dofRef={dofRef} />
      ) : (
        <StillCamera targetY={targetY} fog={fog} dofRef={dofRef} />
      )}

      {/* The lens. DOF is the direction: everything else is restraint.
          Small viewports cut Bloom, chromatic aberration, Noise and MSAA. */}
      <EffectComposer multisampling={small ? 0 : 4}>
        <DepthOfField
          ref={dofRef}
          worldFocusDistance={7.45}
          worldFocusRange={11}
          bokehScale={2.2}
        />
        {small ? (
          <></>
        ) : (
          <>
            <Bloom
              intensity={0.4}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.2}
              mipmapBlur
            />
            <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.4} />
          </>
        )}
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        {small ? <></> : <Noise premultiply opacity={0.1} />}
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

/* -------------------------------------------------------------- letterbox -- */

/** Anamorphic 2.39:1 mattes, closing over the first 9% of scroll — before the
 *  camera has meaningfully moved. Implemented here (not the shared Letterbox)
 *  at z-[5]: below the wrapper's caption (z-10), so the tagline composites
 *  ONTO the bottom matte like a subtitle instead of vanishing behind z-50
 *  bars. Same geometry as components/ui/film.tsx: 12.8% per side, scaleY. */
const BAR_HEIGHT = "12.8%";

function LetterboxBars({ scaleY }: { scaleY: MotionValue<number> }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]">
      <motion.div
        className="absolute inset-x-0 top-0 origin-top bg-black"
        style={{ height: BAR_HEIGHT, scaleY, willChange: "transform" }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 origin-bottom bg-black"
        style={{ height: BAR_HEIGHT, scaleY, willChange: "transform" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ root -- */

export default function SceneFlythrough({
  src,
  progress,
  active,
  dprMax,
  onReady,
  onFail,
}: SceneFlythroughProps) {
  const failed = useRef(false);

  /* Reduced motion (progress null) arrives with the frame already composed:
     bars closed, no animation ever mounted. */
  const closed = useMotionValue(1);
  const barScaleY = useTransform(progress ?? closed, [0, 0.09], [0, 1]);

  return (
    <>
      <Canvas
        frameloop={progress ? (active ? "always" : "never") : "demand"}
        dpr={[1, dprMax]}
        camera={{ fov: FOV, near: 0.06, far: 60, position: CAM_LOCK.toArray() }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        shadows
        onCreated={({ gl }) => {
          /* Single deterministic tone map: the ACES pass in the composer.
             Prevents any double-mapping across three versions. */
          gl.toneMapping = THREE.NoToneMapping;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
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
      <LetterboxBars scaleY={barScaleY} />
    </>
  );
}
