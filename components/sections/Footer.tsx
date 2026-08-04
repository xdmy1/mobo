import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { CATEGORIES, NAV_LINKS, SITE, SOCIALS } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Site footer — the end credits.
 *
 * The outro above stages the closing title card; this footer is what follows.
 *
 * An earlier version took the credit-roll metaphor literally: a centred axis
 * with roles right-aligned across a gutter from their links, stacked
 * vertically. It read as one long column and pushed the phone number far below
 * the fold — the opposite of a footer's job. The metaphor now lives only in
 * the typography (quiet tracked role headings, blocks resolving in sequence),
 * while the layout is horizontal: brand and contact take three columns each,
 * the three link groups take two apiece, across a 12-column grid on desktop.
 * Two columns at `sm`, a single stack on phones.
 *
 * Arrival is scroll-driven, never timed: each block resolves in sequence as it
 * enters the viewport, via the house Reveal (rise + fade, fired once; a pure
 * cross-fade under prefers-reduced-motion). A timed auto-scroll would fight
 * the reader.
 *
 * There is deliberately no giant wordmark here — the outro owns the brand
 * moment, and repeating the beat directly below it would cheapen both.
 */

type CreditLink = { label: string; href: string; external?: true };
type CreditNavBlock = {
  /** id of the visible role heading; names the block's <nav> landmark. */
  id: string;
  role: string;
  links: CreditLink[];
};

const NAV_BLOCKS: CreditNavBlock[] = [
  {
    id: "footer-informatii",
    role: "Informații",
    links: [
      ...NAV_LINKS.map((link) => ({ label: link.label, href: link.href })),
      { label: "Oferte", href: "#avantaje" },
      { label: "Info Clienți", href: "https://mobo.md/info-clienti/", external: true },
    ],
  },
  {
    id: "footer-categorii",
    role: "Categorii",
    /* All six point at the category grid — the single-page redesign has no
       per-category routes, and deep-linking would fabricate URLs. */
    links: CATEGORIES.map((category) => ({ label: category.label, href: "#categorii" })),
  },
  {
    id: "footer-social",
    role: "Social",
    links: SOCIALS.map((social) => ({ label: social.label, href: social.href, external: true })),
  },
];

/* Colour-only hover, gated to real cursors: on touch a tap fires :hover and
   the link stays stuck until the next tap elsewhere. */
const LINK_CLASS = cn(
  "text-[0.9375rem] leading-6 text-fg-dim",
  "transition-colors duration-200 ease-out-strong",
  "hover-fine:hover:text-fg",
);

/* The role side of a credit. Quiet tracked caps — plain type, no ornament.
   leading-6 matches the name column's line box so the first baselines meet
   across the gutter. fg-dim, not fg-faint: 11px type needs the 4.5:1 clear. */
const ROLE_CLASS =
  "text-[0.6875rem] font-medium uppercase leading-6 tracking-[0.075em] text-fg-dim";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      aria-labelledby="footer-title"
      /* No border against the outro: the film cuts straight to the credits,
         ink-950 to ink-950, and the projection grain carries across the cut. */
      className="grain relative bg-ink-950 pb-8 pt-16 sm:pb-10 sm:pt-20 lg:pt-24"
    >
      <h2 id="footer-title" className="sr-only">
        Contacte și navigare MOBO Kitchens &amp; Home
      </h2>

      {/* Horizontal on desktop. The centred credit-roll version read as a long
          vertical column and pushed the contact details far below the fold —
          the opposite of what a footer is for. The credits character is kept in
          the typography (quiet tracked role headings, sequenced arrival), not
          in the axis. Columns collapse to a stack on phones. */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-10">
          {/* ------------------------------------------------------ brand -- */}
          <Reveal className="sm:col-span-2 lg:col-span-3">
            <Image
              src={SITE.logo}
              alt={SITE.name}
              width={SITE.logoWidth}
              height={SITE.logoHeight}
              className="h-8 w-auto sm:h-9"
            />
            <p className="text-pretty mt-5 max-w-[34ch] text-[0.9375rem] leading-relaxed text-fg-dim">
              {SITE.tagline}
            </p>
          </Reveal>

          {/* ---------------------------------------------------- contact -- */}
          <Reveal index={1} className="lg:col-span-3">
            <h3 id="footer-contact" className={ROLE_CLASS}>
              Contact
            </h3>
            <address className="not-italic">
              <ul className="mt-5 list-none space-y-2.5">
                <li className="text-[0.9375rem] leading-6 text-fg-dim">{SITE.address}</li>
                <li>
                  <a
                    href={SITE.phoneHref}
                    className={cn(
                      LINK_CLASS,
                      "font-medium text-fg hover-fine:hover:text-lime-brand",
                    )}
                  >
                    {SITE.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${SITE.email}`} className={LINK_CLASS}>
                    {SITE.email}
                  </a>
                </li>
              </ul>
            </address>
          </Reveal>

          {/* ------------------------------------------------ nav columns -- */}
          {NAV_BLOCKS.map((block, i) => (
            <Reveal key={block.id} index={i + 2} className="lg:col-span-2">
              <h3 id={block.id} className={ROLE_CLASS}>
                {block.role}
              </h3>
              <nav aria-labelledby={block.id}>
                <ul className="mt-5 list-none space-y-2.5">
                  {block.links.map((link) => (
                    <li key={`${block.id}-${link.label}`}>
                      <a
                        href={link.href}
                        className={LINK_CLASS}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>
          ))}
        </div>

        {/* -------------------------------------------------- bottom bar --- */}
        <Reveal
          from="none"
          className="mt-14 flex flex-col gap-2 border-t border-white/8 pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <p className="text-[0.8125rem] leading-6 text-fg-dim">
            © {year} {SITE.name}
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            Bucătării la comandă în Chișinău
          </p>
          <p className="text-[0.8125rem] leading-6 text-fg-dim">
            Redesign conceptual — pagină de previzualizare, nu site-ul oficial.
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
