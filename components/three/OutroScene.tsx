"use client";

/**
 * The MOBO wordmark as a physical object, standing in MOBO's own kitchen.
 *
 * Realism strategy — every decision below serves the composite reading as one
 * photograph rather than a graphic pasted over one:
 *
 *  - The hero photo is BOTH the backdrop plane and the environment map, so the
 *    letters are lit by, and reflect, the room they stand in. The environment
 *    copy is heavily pre-blurred: an equirect approximation of a flat photo is
 *    geometrically wrong, but blurred to soft warm tones it reads exactly like
 *    satin lacquer reflecting a room.
 *  - The backdrop copy is pre-blurred by ~2px and gently vignetted in an
 *    offscreen canvas: depth of field at zero per-frame cost. The letters stay
 *    sharp — they own the focal plane.
 *  - Key light comes from the right, matching the daylight in MOBO31. This is
 *    the single most important compositing rule.
 *  - Contact shadows ground the panels. The shadow is nudged slightly left —
 *    away from the key — so even the blob shadow agrees with the window.
 *
 * Perf: 6 draw calls (4 letters, backdrop, shadow blit), shadows rendered once
 * (frames={1}, the letters never move — only the camera does), no
 * postprocessing. The render loop only runs while the section is near the
 * viewport; the wrapper drives that through the `active` prop.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import {
  GLYPHS,
  LETTER_GAP,
  PANEL_DEPTH,
  WORD_WIDTH,
  type Glyph,
  type GlyphMaterial,
} from "./letterforms";

export type OutroSceneProps = {
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
/** Dolly start/end. A slow push-in from camera-left to just right of centre. */
const CAM_START = new THREE.Vector3(-1.7, 1.95, 9.6);
const CAM_END = new THREE.Vector3(0.95, 1.5, 7.3);
/** Cap on letter cap-height in world units (desktop). */
const MAX_LETTER_SCALE = 1.35;

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: PANEL_DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.01,
  bevelSegments: 2,
  steps: 1,
};

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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
 * WebGL), and that optimizer can 504 on a cold cache when the upstream is
 * slow — one attempt is not enough for a load-bearing texture.
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
 * Split the loaded photograph into its two roles.
 * Backdrop: slightly defocused + vignetted (the fake depth of field).
 * Environment: heavily blurred equirect for lighting and reflections.
 */
function useKitchenTextures(
  src: string,
  onFail: () => void,
): { backdrop: THREE.Texture; env: THREE.Texture | null } | null {
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

    let backdrop: THREE.Texture | null = null;
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
      tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      backdrop = tex;
    } else {
      // No 2d context (vanishingly rare): use the raw photo, unprocessed.
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

    return { backdrop, env };
  }, [img, gl]);
}

/** Deterministic PRNG so the oak grain is identical on every visit. */
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

/** Procedural brushed-oak grain — subtle vertical streaks, no photo needed. */
function makeWoodTexture(): THREE.CanvasTexture | null {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  const rnd = mulberry32(20241131);
  ctx.fillStyle = "#a3794f";
  ctx.fillRect(0, 0, c.width, c.height);

  // Broad tonal planks first, fine grain lines on top.
  for (let i = 0; i < 14; i++) {
    const x = rnd() * c.width;
    const w = 14 + rnd() * 34;
    ctx.fillStyle = rnd() > 0.5 ? "rgba(196, 152, 100, 0.07)" : "rgba(112, 80, 50, 0.07)";
    ctx.fillRect(x, 0, w, c.height);
  }
  for (let i = 0; i < 170; i++) {
    const x0 = rnd() * c.width;
    const dark = rnd() > 0.42;
    ctx.strokeStyle = dark
      ? `rgba(96, 66, 40, ${0.04 + rnd() * 0.08})`
      : `rgba(214, 172, 122, ${0.03 + rnd() * 0.06})`;
    ctx.lineWidth = 0.6 + rnd() * 1.3;
    ctx.beginPath();
    ctx.moveTo(x0, -8);
    let x = x0;
    for (let y = 56; y <= c.height + 8; y += 56) {
      x += (rnd() - 0.5) * 6;
      ctx.quadraticCurveTo(x + (rnd() - 0.5) * 4, y - 28, x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
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

function Letters({ scale, small }: { scale: number; small: boolean }) {
  const shapes = useMemo(() => GLYPHS.map(glyphShape), []);

  const materials = useMemo<Record<GlyphMaterial, THREE.MeshPhysicalMaterial>>(() => {
    const wood = makeWoodTexture();
    return {
      // Brushed oak: fully diffuse, warm, with faint grain relief.
      oak: new THREE.MeshPhysicalMaterial({
        map: wood ?? undefined,
        color: wood ? "#ffffff" : "#a3794f",
        roughness: 0.62,
        metalness: 0,
        bumpMap: wood ?? undefined,
        bumpScale: 0.03,
      }),
      // Matte graphite lacquer: low roughness + a restrained clearcoat.
      graphite: new THREE.MeshPhysicalMaterial({
        color: "#24251d",
        roughness: 0.28,
        metalness: 0,
        clearcoat: 0.55,
        clearcoatRoughness: 0.22,
      }),
      // The one brand-lime panel: satin lacquer, not neon.
      lime: new THREE.MeshPhysicalMaterial({
        color: "#ccdf10",
        roughness: 0.34,
        metalness: 0,
        clearcoat: 0.45,
        clearcoatRoughness: 0.3,
      }),
    };
  }, []);

  useEffect(() => {
    return () => {
      for (const m of Object.values(materials)) {
        m.map?.dispose();
        m.dispose();
      }
    };
  }, [materials]);

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
        >
          <extrudeGeometry args={[shape, EXTRUDE]} />
        </mesh>
      ))}
      {/* Grounding. Nudged away from the key light so the blob agrees with
          the window; rendered once — the letters never move. */}
      <ContactShadows
        position={[-0.18, 0, 0.05]}
        scale={[WORD_WIDTH + 1.8, 2.6]}
        far={1.4}
        blur={2.4}
        opacity={0.55}
        resolution={small ? 256 : 512}
        frames={1}
        color="#12110b"
      />
    </group>
  );
}

/* ---------------------------------------------------------------- camera -- */

function CameraRig({ progress, targetY }: { progress: MotionValue<number>; targetY: number }) {
  const smoothed = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const t = THREE.MathUtils.clamp(progress.get(), 0, 1);
    // Exponential smoothing = weight. No spring, no overshoot, no bounce.
    smoothed.current = THREE.MathUtils.damp(smoothed.current, t, 3.2, delta);
    const e = easeInOutCubic(smoothed.current);
    pos.lerpVectors(CAM_START, CAM_END, e);

    // Handheld drift: two incommensurate sines per axis, centimetre amplitude.
    const s = state.clock.elapsedTime;
    pos.x += 0.022 * Math.sin(s * 0.43 + 1.7) + 0.01 * Math.sin(s * 1.11);
    pos.y += 0.014 * Math.sin(s * 0.57 + 0.6) + 0.007 * Math.sin(s * 1.31 + 2.2);
    pos.z += 0.012 * Math.sin(s * 0.36 + 3.1);

    state.camera.position.copy(pos);
    state.camera.lookAt(0, targetY + 0.008 * Math.sin(s * 0.49 + 1.1), 0);
  });

  return null;
}

/** Reduced motion: the resolved end-of-dolly frame, posed once, no loop. */
function StillCamera({ targetY }: { targetY: number }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    camera.position.copy(CAM_END);
    camera.lookAt(0, targetY, 0);
    invalidate();
  }, [camera, invalidate, targetY]);

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

  // The room lights the object: photo-as-environment is what welds the two.
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
    };
  }, [backdrop, env]);

  // Signal readiness on the frame after the textures have committed.
  useEffect(() => {
    if (!backdrop) return;
    const id = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(id);
  }, [backdrop, onReady]);

  // Fit the word to ~88% of the viewport width at the end-of-dolly distance,
  // capped at its full desktop size. Width-bound, like typography.
  const aspect = size.width / Math.max(1, size.height);
  const viewW = 2 * Math.tan((FOV * Math.PI) / 360) * 7.4 * aspect;
  const letterScale = Math.min(MAX_LETTER_SCALE, (viewW * 0.88) / WORD_WIDTH);
  const targetY = letterScale * 0.5;
  const small = size.width < 700;

  /* Backdrop must out-cover the frustum at every point of the dolly. 30x22.5
     at z=-8 covers every aspect up to ~1.9; ultrawide viewports scale the
     plane up uniformly (photo stays 4:3, never stretched) and re-anchor it so
     the word's baseline keeps landing a third of the way up the photograph —
     on the floor, not up the wall. Verified numerically across aspects
     0.46-2.4 and the full camera path incl. drift extremes. */
  const planeScale = Math.max(1, aspect / 1.7);
  const planeY = -1.675 + 3.825 * planeScale;

  // Poster shows through the transparent canvas until the photo arrives.
  if (!backdrop) return null;

  return (
    <>
      {/* The room. Unlit and untonemapped — it is the ground truth the
          letters must live up to, so it keeps its exact photographic colour. */}
      <mesh position={[0, planeY, -8]} scale={planeScale}>
        <planeGeometry args={[30, 22.5]} />
        <meshBasicMaterial map={backdrop} toneMapped={false} />
      </mesh>

      {/* Key from the right — the window side in MOBO31 — plus a faint
          neutral bounce from the left. No rim light, no accents. */}
      <directionalLight position={[7, 6, 4.5]} intensity={1.5} color="#ffedd6" />
      <directionalLight position={[-6, 3.5, 5]} intensity={0.35} color="#e9e7de" />

      <Letters scale={letterScale} small={small} />

      {progress ? (
        <CameraRig progress={progress} targetY={targetY} />
      ) : (
        <StillCamera targetY={targetY} />
      )}
    </>
  );
}

export default function OutroScene({
  src,
  progress,
  active,
  dprMax,
  onReady,
  onFail,
}: OutroSceneProps) {
  const failed = useRef(false);

  return (
    <Canvas
      frameloop={progress ? (active ? "always" : "never") : "demand"}
      dpr={[1, dprMax]}
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
  );
}
