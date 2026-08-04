import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Without this, Turbopack walks up looking for a lockfile, finds one in the
     home directory, and infers the workspace root as ~ — which would pull the
     entire home directory into the module graph. Pin it to this project. */
  turbopack: {
    root: __dirname,
  },
  images: {
    // Preview phase: images are pulled straight from the live mobo.md WordPress
    // media library + its asset CDN. When the redesign is approved these get
    // swapped for local files in /public and this block can be deleted.
    remotePatterns: [
      { protocol: "https", hostname: "mobo.md", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "b4574890.assetcdn.net", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
