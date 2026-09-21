"use client";

import { useSyncExternalStore } from "react";
import OutroE from "@/components/sections/OutroE";
import OutroG from "@/components/sections/OutroG";

/**
 * TEMPORARY — the outro is being chosen from three variants, shown to the
 * client one at a time (2026-09-21). `?outro=3` on the homepage swaps the
 * variant in, so every candidate can be opened on the live site without
 * changing what visitors get. Delete this file once one is picked and mount
 * the winner directly in app/[lang]/page.tsx.
 *
 * The query is read on the client on purpose: `searchParams` in the page would
 * opt the statically generated homepage into dynamic rendering. The server
 * snapshot is always the default, so hydration matches, and the swap happens
 * long before anyone has scrolled to the bottom of the page.
 */
/* "2" was OutroF, turned down on sight; it is kept in the tree for reference
   but not mounted here, so it is not shipped. The numbers stay as the client
   knows them. */
const VARIANTS = { "1": OutroE, "3": OutroG } as const;
type VariantKey = keyof typeof VARIANTS;
const DEFAULT: VariantKey = "1";

const subscribe = () => () => {};
const fromQuery = (): VariantKey => {
  const asked = new URLSearchParams(window.location.search).get("outro");
  return asked !== null && asked in VARIANTS ? (asked as VariantKey) : DEFAULT;
};

export default function OutroReview() {
  const key = useSyncExternalStore(subscribe, fromQuery, () => DEFAULT);
  const Outro = VARIANTS[key];
  return <Outro />;
}
