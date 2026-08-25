import type { ReactNode } from "react";
import { Reveal, RevealText } from "@/components/ui/Reveal";

/**
 * Subpage opener — the shared first band of every inner page.
 *
 * The homepage opens on a full-bleed photograph; inner pages open on type. Same
 * grammar as every section header on the home (eyebrow, display headline, dim
 * lead), but sized as a page title and given enough top padding to clear the
 * fixed pill nav plus its utility strip. Dark band, so the light nav chrome
 * lands on it the way it lands on the hero.
 */
export default function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Optional extra row under the intro — CTAs, meta, filters. */
  children?: ReactNode;
}) {
  return (
    <section className="grain relative bg-ink-900">
      <div className="mx-auto w-full max-w-[88rem] px-5 pb-14 pt-36 sm:px-8 sm:pb-16 sm:pt-40 lg:px-12 lg:pb-20 lg:pt-44">
        <Reveal from="none">
          <p className="text-eyebrow text-fg-dim">{eyebrow}</p>
        </Reveal>
        <h1 className="text-display text-balance mt-5 max-w-[20ch]">
          <RevealText text={title} delay={0.08} />
        </h1>
        {intro ? (
          <Reveal index={2}>
            <p className="text-body text-pretty mt-6 max-w-[52ch] text-fg-dim">{intro}</p>
          </Reveal>
        ) : null}
        {children ? <Reveal index={3}>{children}</Reveal> : null}
      </div>
      {/* Baseline hairline — the hero's editorial rule, restated quietly. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </section>
  );
}
