import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { CATEGORIES, NAV_LINKS, SITE, SOCIALS } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Site footer — the end credits.
 *
 * The outro above stages the closing title card; this footer is what follows
 * it: a credit roll. The structure is the classic one — a centred axis, with
 * the ROLE set right-aligned on the left of the gutter and the NAMES
 * left-aligned on the right — which maps one-to-one onto footer anatomy:
 * a label and its links. Nothing else of the vernacular is borrowed. No reel
 * clip art, no fake cast list; the content is exactly what a customer needs.
 *
 * Arrival is scroll-driven, never timed: each block resolves in sequence as it
 * enters the viewport, via the house Reveal (rise + fade, fired once; a pure
 * cross-fade under prefers-reduced-motion). A timed auto-scroll would fight
 * the reader.
 *
 * There is deliberately no giant wordmark here — the outro owns the brand
 * moment, and repeating the beat directly below it would cheapen both.
 *
 * On phones the credit axis would cramp, so below `sm` every block stacks:
 * role above, names below, left-aligned — a plain, sensible footer.
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

/* One credit row: role right of nothing / left of the gutter, names after it.
   Stacks below `sm`. */
const ROW_CLASS = "grid gap-y-2 sm:grid-cols-2 sm:gap-x-10 lg:gap-x-14";

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

      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 sm:px-8">
        {/* ---------------------------------------------------- head card -- */}
        <Reveal className="flex flex-col items-center text-center">
          <Image
            src={SITE.logo}
            alt={SITE.name}
            width={SITE.logoWidth}
            height={SITE.logoHeight}
            className="h-8 w-auto sm:h-9"
          />
          <p className="text-pretty mt-5 max-w-[38ch] text-[0.9375rem] leading-relaxed text-fg-dim">
            {SITE.tagline}
          </p>
        </Reveal>

        {/* --------------------------------------------------- the roll ---- */}
        <div className="mt-14 space-y-10 sm:mt-16 sm:space-y-12 lg:mt-20">
          {/* Contact leads the roll, as an <address>, not a <nav>. */}
          <Reveal index={1} className={ROW_CLASS}>
            <div className="sm:text-right">
              <h3 id="footer-contact" className={ROLE_CLASS}>
                Contact
              </h3>
            </div>
            <address className="not-italic">
              <ul className="list-none space-y-2.5">
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

          {NAV_BLOCKS.map((block, i) => (
            <Reveal key={block.id} index={i + 2} className={ROW_CLASS}>
              <div className="sm:text-right">
                <h3 id={block.id} className={ROLE_CLASS}>
                  {block.role}
                </h3>
              </div>
              <nav aria-labelledby={block.id}>
                <ul className="list-none space-y-2.5">
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
