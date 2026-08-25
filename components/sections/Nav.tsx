"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type Variants,
} from "motion/react";
import { SocialGlyph } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { NAV_LINKS, SITE, SOCIALS } from "@/lib/data";
import { DUR, EASE_DRAWER, EASE_OUT, SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PANEL_ID = "nav-mobile-panel";

/** Roughly the point where the bar has cleared the hero's own top padding. */
const MORPH_AT = 40;

/* Every observed section on the page, in document order. Not all of them have
   a nav link — the map below resolves each one to the link that should light
   up, using classic scrollspy semantics: the *last passed* anchor stays lit.
   So Avantaje and Recenzii, which sit between Servicii and Despre in the flow,
   keep "Servicii" active rather than prematurely lighting "Despre Noi" for a
   section the reader has not reached. Categorii precedes the first anchor, so
   it resolves to nothing and the indicator stays hidden through the hero. */
const SECTION_IDS = [
  "proiecte",
  "servicii",
  "avantaje",
  "recenzii",
  "despre",
  "contact",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

/* The site is multi-page now, so the values are routes: passing a homepage
   section lights up the nav item of the PAGE that covers the same subject.
   On subpages the observer finds none of these ids and pathname decides. */
const SECTION_TO_LINK: Record<SectionId, string | null> = {
  proiecte: "/proiecte",
  servicii: "/servicii",
  avantaje: "/servicii",
  recenzii: "/servicii",
  despre: "/despre-noi",
  contact: "/contacte",
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Nav() {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [spyHref, setSpyHref] = useState<string | null>(null);

  /* Away from the homepage the current route owns the hairline; the scrollspy
     only ever speaks on "/", where sections stand in for the pages. Prefix
     matching keeps "Proiecte" lit on /proiecte/[slug]. */
  const routeHref =
    pathname === "/"
      ? null
      : (NAV_LINKS.find((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))?.href ??
        null);
  const activeHref = pathname === "/" ? spyHref : routeHref;

  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { scrollY, scrollYProgress } = useScroll();

  /* The bar reads as a state machine, not a scroll animation: one boolean, one
     cross-fade. Driving opacity off scroll progress would make the glass flicker
     in and out while a user nudges the wheel around the threshold. */
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > MORPH_AT));

  // A reload can land mid-page, where no scroll event will ever fire.
  useEffect(() => {
    setScrolled(window.scrollY > MORPH_AT);
  }, []);

  /* Scrollspy. The observer's root is shrunk to a thin band 20–30% down the
     viewport, so "active" means "the section whose content currently sits
     under the reader's eye line", not "any section touching the screen".
     When two sections straddle the band, the later one in document order wins
     — the incoming section takes over the moment its top crosses the line.
     IO fires immediately on observe, so a mid-page reload resolves too. */
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        let current: SectionId | null = null;
        for (const id of SECTION_IDS) if (inBand.has(id)) current = id;
        setSpyHref(current ? SECTION_TO_LINK[current] : null);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    for (const section of sections) io.observe(section);
    return () => io.disconnect();
  }, []);

  /* aria-modal tells assistive tech the rest of the page is off-limits; inert
     makes it true — behind the open panel, #main and the footer drop out of
     both the tab order and the accessibility tree. The panel lives inside
     this header, so the header itself stays live. */
  useEffect(() => {
    if (!open) return;
    const behind = [document.getElementById("main"), document.querySelector("footer")].filter(
      (el): el is HTMLElement => el !== null,
    );
    for (const el of behind) el.setAttribute("inert", "");
    return () => {
      for (const el of behind) el.removeAttribute("inert");
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  /* Scroll lock. The gap compensation stops the page (and this fixed bar) from
     jumping left by the scrollbar width the moment the lock lands. */
  useEffect(() => {
    if (!open) return;
    const { body, documentElement: root } = document;
    const prevOverflow = body.style.overflow;
    const gap = window.innerWidth - root.clientWidth;

    if (gap > 0) root.style.setProperty("--scroll-lock-gap", `${gap}px`);
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = prevOverflow;
      root.style.removeProperty("--scroll-lock-gap");
    };
  }, [open]);

  // Focus lands in the panel; Escape and the focus trap keep it there.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const root = rootRef.current;
      if (!root) return;
      /* The trigger doubles as the close button, so the trap spans the whole
         header. getClientRects() filters out the desktop cluster, which is
         display:none here but still matches the selector. */
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Resizing up to the desktop layout would otherwise strand a locked body.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open]);

  /* One choreography, one direction. The panel belongs to the bar, so it
     descends from it; every item inside travels the same way, unfurling
     downward a beat behind the surface. Exit is the enter played backwards
     along the same path, last item first, quicker — the menu reels back up
     into the bar it came from. Leaving along a different route breaks the
     mental model of where the menu went, and is the fastest way to make a
     panel feel cheap. */
  const panelVariants: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : -16,
      transition: {
        duration: DUR.ui,
        ease: EASE_DRAWER,
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: DUR.panel,
        ease: EASE_DRAWER,
        delayChildren: 0.08,
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : -14,
      transition: { duration: DUR.micro, ease: EASE_DRAWER },
    },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_DRAWER } },
  };

  /* The pill is permanent, not scroll-triggered.
     The hero is now a full-bleed photograph, and the top of that frame is a
     brightly-lit ceiling — a transparent bar put dark nav labels straight onto
     white and they vanished. Chrome that is only legible over some of the
     content is not legible chrome. It hides only while the mobile panel is
     open, where the panel itself provides the surface. */
  const showGlass = !open;

  return (
    <header
      ref={rootRef}
      id="nav"
      className="fixed inset-x-0 top-0 z-[90]"
      style={{ paddingRight: "var(--scroll-lock-gap, 0px)" }}
    >
      {/* The legal links used to sit in a utility strip up here; the client
          reconsidered — they now live only in the footer's bottom bar. */}
      <div className="mx-auto w-full max-w-[88rem] px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
        {/* z-10 is load-bearing: the fullscreen mobile panel is a later sibling
            inside this same header. With both at `z-index: auto` the panel won
            on tree order and painted over the hamburger — which doubles as the
            close button — leaving touch users with no way out of the menu. */}
        <div className="relative z-10 flex h-14 w-full items-center justify-between rounded-pill pl-4 pr-2 sm:h-16 sm:pl-5 sm:pr-3">
          {/* The morph. Nothing resizes — a glass slab simply materialises behind
              the existing bar, so no layout is touched at any scroll position.

              The tint is overridden to warm graphite rather than the default
              white: this bar floats over the ivory bands too, and .glass-invert
              is no help when the content on top has to stay light at all times. */}
          <motion.div
            aria-hidden="true"
            className="glass glass-thin pointer-events-none absolute inset-0 rounded-pill bg-ink-950/82"
            initial={false}
            animate={{ opacity: showGlass ? 1 : 0 }}
            transition={{ duration: DUR.ui, ease: EASE_OUT }}
          />

          {/* Reading progress, drawn as edge lighting rather than a bar: a
              hairline riding the pill's bottom border, scaleX bound directly
              to document scroll. Inset past the corner radius so it never
              pokes out of the curve, and transform-only so it costs nothing.
              It fades with the glass when the panel takes over the surface. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 bottom-0 h-px origin-left rounded-full bg-lime-brand/45"
            initial={false}
            animate={{ opacity: showGlass ? 1 : 0 }}
            transition={{ duration: DUR.ui, ease: EASE_OUT }}
            style={{ scaleX: scrollYProgress }}
          />

          {/* ---------------------------------------------------------- logo -- */}
          <motion.a
            href="/"
            aria-label="MOBO Kitchens & Home — pagina principală"
            className="relative flex shrink-0 items-center rounded-md"
            initial={false}
            animate={{ scale: scrolled && !reduce ? 0.92 : 1 }}
            transition={{ duration: DUR.ui, ease: EASE_OUT }}
            style={{ transformOrigin: "left center" }}
          >
            <Image
              src={SITE.logo}
              alt="MOBO Kitchens & Home"
              width={105}
              height={36}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </motion.a>

          {/* -------------------------------------------------- desktop links -- */}
          <nav
            aria-label="Navigare principală"
            className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
          >
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative inline-flex h-10 items-center px-3 text-sm",
                        "transition-colors duration-200 ease-out-strong",
                        isActive ? "text-fg" : "text-fg-dim hover-fine:hover:text-fg",
                      )}
                    >
                      {link.label}
                      {/* Hover hairline: scaleX, never width — width would
                          relayout every frame. Resting origin is RIGHT and only
                          :hover flips it to LEFT, so the wipe enters from the
                          left and, on leave, keeps travelling — collapsing out
                          through the right edge instead of retreating. Neutral
                          ink, one weight: an affordance, not a state. */}
                      {!isActive && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "pointer-events-none absolute inset-x-3 bottom-[7px] h-px origin-right scale-x-0 bg-fg/40",
                            "transition-transform duration-[220ms] ease-out-strong",
                            "hover-fine:group-hover:origin-left hover-fine:group-hover:scale-x-100",
                            "group-focus-visible:origin-left group-focus-visible:scale-x-100",
                          )}
                        />
                      )}
                      {/* The state layer the hover hands off to: same slot,
                          same weight, lime. One shared layoutId means the
                          hairline physically slides from the previous link to
                          this one as the page scrolls — position IS the
                          animation, so there is nothing to cross-fade. */}
                      {isActive && (
                        <motion.span
                          aria-hidden="true"
                          layoutId="nav-active-hairline"
                          className="pointer-events-none absolute inset-x-3 bottom-[7px] h-px bg-lime-brand"
                          transition={reduce ? { duration: 0 } : SPRING.ui}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ------------------------------------------------------- actions -- */}
          <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={SITE.phoneHref}
              aria-label={`Sună la ${SITE.phone}`}
              className={cn(
                "hidden items-center gap-2 rounded-pill px-2 text-[0.8125rem] font-medium tracking-tight text-fg-dim",
                "transition-colors duration-200 ease-out-strong",
                "hover-fine:hover:text-fg xl:inline-flex",
              )}
            >
              {SITE.phone}
            </a>

            <Magnetic strength={0.25} className="hidden lg:block">
              <Button href="/#contact" size="md">
                Solicit Calcul
              </Button>
            </Magnetic>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => (open ? close() : setOpen(true))}
              aria-expanded={open}
              aria-controls={PANEL_ID}
              aria-label={open ? "Închide meniul" : "Deschide meniul"}
              className={cn(
                "glass glass-thin grid size-11 shrink-0 place-items-center rounded-full text-fg",
                "transition-transform duration-[160ms] ease-out-strong active:scale-[0.97] lg:hidden",
              )}
            >
              <span className="relative block h-3 w-5">
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-px w-5 bg-current",
                    "transition-transform duration-[220ms] ease-out-strong",
                    open ? "rotate-45" : "-translate-y-[4px]",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-px w-5 bg-current",
                    "transition-transform duration-[220ms] ease-out-strong",
                    open ? "-rotate-45" : "translate-y-[4px]",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------- mobile overlay -- */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="nav-panel"
            id={PANEL_ID}
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Meniu"
            /* Dark tint for the same reason as the bar — the menu can be opened
               while the ivory bands are behind it. */
            /* Near-opaque, not translucent. At 85% the hero photograph read
               straight through the panel and the menu labels competed with
               cabinetry edges. A navigation overlay is a place to make a
               decision, so the content behind it should recede completely —
               the blur stays only to soften the boundary at the edges. */
            className="glass glass-thick fixed inset-0 border-0 bg-ink-950/97 outline-none lg:hidden"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            /* Delegated: every link in here closes the menu, including the CTA
               and the socials, without threading a handler through each one.
               Keyboard activation bubbles a click too, so this is not mouse-only. */
            onClick={(e) => {
              if (e.target instanceof Element && e.target.closest("a[href]")) close();
            }}
          >
            <div className="flex h-full flex-col justify-between gap-10 overflow-y-auto overscroll-contain px-5 pb-8 pt-24 sm:px-8">
              <nav aria-label="Navigare mobilă">
                <ul className="flex flex-col">
                  {NAV_LINKS.map((link, i) => {
                    const isActive = activeHref === link.href;
                    return (
                      <motion.li key={link.href} variants={itemVariants}>
                        <Link
                          href={link.href}
                          aria-current={isActive ? "page" : undefined}
                          className="group flex items-center gap-4 border-b border-white/10 py-4 text-fg"
                        >
                          <span className="font-mono text-xs text-lime-brand">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-h2">{link.label}</span>
                          {/* The chevron doubles as the "you are here" mark —
                              lime on the section currently in view. */}
                          <ChevronRight
                            className={cn(
                              "ml-auto size-5 shrink-0",
                              isActive ? "text-lime-brand" : "text-fg-faint",
                              "transition-transform duration-200 ease-out-strong",
                              "hover-fine:group-hover:translate-x-1",
                            )}
                          />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <div className="flex flex-col gap-6">
                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                  <a
                    href={SITE.phoneHref}
                    className="text-h3 text-fg"
                    aria-label={`Sună la ${SITE.phone}`}
                  >
                    {SITE.phone}
                  </a>
                  <a href={`mailto:${SITE.email}`} className="text-sm text-fg-dim">
                    {SITE.email}
                  </a>
                  <p className="text-sm text-fg-faint">{SITE.address}</p>
                </motion.div>

                <motion.ul variants={itemVariants} className="flex flex-wrap gap-2">
                  {SOCIALS.map((social) => (
                    <li key={social.href}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "glass glass-thin inline-flex h-9 items-center gap-2 rounded-pill px-4 text-[0.8125rem] text-fg-dim",
                          "transition-[color,transform] duration-200 ease-out-strong active:scale-[0.97]",
                          "hover-fine:hover:text-fg",
                        )}
                      >
                        <SocialGlyph label={social.label} className="size-3.5" />
                        {social.label}
                      </a>
                    </li>
                  ))}
                </motion.ul>

                <motion.div variants={itemVariants}>
                  <Button href="/#contact" size="lg" withArrow className="w-full">
                    Solicit Calcul
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
