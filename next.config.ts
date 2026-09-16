import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Without this, Turbopack walks up looking for a lockfile, finds one in the
     home directory, and infers the workspace root as ~ — which would pull the
     entire home directory into the module graph. Pin it to this project. */
  turbopack: {
    root: __dirname,
  },
  images: {
    // 2026-09-12: no remote images left — the old WordPress hosting died and
    // everything it still served was rescued into /public/wp (see lib/data.ts),
    // so the remotePatterns allowlist is gone with it.
    // 100 is on the qualities allowlist for the hero: full-bleed AVIF at the
    // default 75 visibly smears — Next 16 rejects any quality not listed here.
    formats: ["image/avif", "image/webp"],
    // 90 is the gallery lightbox: a photo opened to be looked at closely, but
    // fetched on demand, so it stops short of the hero's near-lossless 100.
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
