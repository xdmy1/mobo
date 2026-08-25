"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { SITE, SOCIALS } from "@/lib/data";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Contact island — the floating quick-contact control, client-requested after
 * the reference every furniture shop in town uses: a single round button that
 * unfolds into phone + messaging channels.
 *
 * Kept comfortable rather than showy:
 *   - one 56px toggle, bottom-right, inside the thumb zone;
 *   - open = the channels spring upward out of the toggle, 40ms apart, with a
 *     touch of bounce (a gesture-adjacent flourish, so bounce is allowed);
 *   - close = the same path reversed, faster, top item first — the stack reels
 *     back into the button it came from;
 *   - each channel keeps its real brand colour (the reference does, and a row
 *     of identical glass chips would make phone and TikTok indistinguishable
 *     at a glance);
 *   - labels appear as quiet pills on hover, cursor devices only.
 *
 * Escape and any outside press close it. Sits below the nav overlay (z-80 vs
 * z-90) so the mobile menu covers it. Under reduced motion everything becomes
 * plain cross-fades.
 */

type Channel = {
  label: string;
  href: string;
  external?: true;
  /** Brand surface behind the glyph. */
  bg: string;
  fg?: string;
  icon: React.ReactNode;
};

function socialHref(label: string): string {
  return SOCIALS.find((s) => s.label === label)?.href ?? "#";
}

/* Stroke icons follow Feather geometry; TikTok and Telegram are filled glyphs
   because their marks don't survive being outlined at 20px. */
const ICONS = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        d="M19.6 8.3a6.15 6.15 0 0 1-3.6-1.16A6.24 6.24 0 0 1 13.77 4h-3.06v11.87a2.72 2.72 0 1 1-1.94-2.6v-3.17a5.9 5.9 0 1 0 5.04 5.84v-5.7a9.13 9.13 0 0 0 5.79 2.06z"
        fill="currentColor"
      />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        d="M21.7 4.2c.3-1.1-.8-2-1.85-1.6L2.9 9.2c-1.15.44-1.1 2.07.07 2.44l4.28 1.35 1.63 5.2c.3.98 1.55 1.27 2.26.52l2.32-2.44 4.36 3.2c.9.66 2.17.17 2.4-.92zM9.3 12.9l8.35-5.42c.2-.13.42.14.25.31l-6.9 6.5c-.24.23-.4.53-.45.86l-.28 1.95c-.04.3-.46.32-.54.03l-1-3.17c-.13-.4.03-.83.57-1.06z"
        fill="currentColor"
      />
    </svg>
  ),
} as const;

const CHANNELS: Channel[] = [
  { label: "Sună-ne", href: SITE.phoneHref, bg: "#22a95e", icon: ICONS.phone },
  {
    label: "TikTok",
    href: socialHref("TikTok"),
    external: true,
    bg: "#0f0f0f",
    icon: ICONS.tiktok,
  },
  {
    label: "Instagram",
    href: socialHref("Instagram"),
    external: true,
    bg: "radial-gradient(circle at 30% 110%, #fdf497 0%, #fd5949 45%, #d6249f 62%, #285aeb 92%)",
    icon: ICONS.instagram,
  },
  {
    label: "Telegram",
    href: socialHref("Telegram"),
    external: true,
    bg: "#229ed9",
    icon: ICONS.telegram,
  },
];

export default function SocialIsland() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Outside press + Escape both close — a floating control the user has to
     hunt down a close button for stops being comfortable. */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* Enter: spring with a little bounce, unfolding upward (nearest the toggle
     first). Exit: same path back, quicker, farthest first — reversed stagger
     reads as the stack being reeled back in. */
  const listVariants: Variants = {
    hidden: {
      transition: { staggerChildren: 0.03, staggerDirection: -1 },
    },
    visible: {
      transition: { staggerChildren: 0.04, staggerDirection: -1, delayChildren: 0.02 },
    },
  };

  const itemVariants: Variants = reduce
    ? {
        hidden: { opacity: 0, transition: { duration: DUR.micro } },
        visible: { opacity: 1, transition: { duration: DUR.micro } },
      }
    : {
        hidden: {
          opacity: 0,
          y: 14,
          scale: 0.5,
          transition: { duration: 0.16, ease: EASE_OUT },
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", bounce: 0.26, duration: 0.45 },
        },
      };

  return (
    <div
      ref={rootRef}
      className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      <AnimatePresence>
        {open && (
          <motion.ul
            key="channels"
            id="contact-island-channels"
            aria-label="Contactează-ne rapid"
            className="flex list-none flex-col items-end gap-3"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {CHANNELS.map((channel) => (
              <motion.li key={channel.label} variants={itemVariants} className="will-move">
                <a
                  href={channel.href}
                  aria-label={channel.label}
                  {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-3"
                >
                  {/* Hover label — a quiet glass pill, cursor devices only. */}
                  <span
                    className={cn(
                      "glass glass-thin pointer-events-none hidden rounded-pill bg-ink-950/82 px-3 py-1.5",
                      "text-[0.8125rem] whitespace-nowrap text-fg opacity-0",
                      "translate-x-1 transition-[opacity,transform] duration-200 ease-out-strong",
                      "hover-fine:group-hover:translate-x-0 hover-fine:group-hover:opacity-100 sm:block",
                    )}
                  >
                    {channel.label}
                  </span>
                  <span
                    style={{ background: channel.bg, color: channel.fg ?? "#fff" }}
                    className={cn(
                      "grid size-12 place-items-center rounded-full",
                      "shadow-[0_10px_28px_-10px_rgb(0_0_0/0.55),inset_0_1px_0_0_rgb(255_255_255/0.22)]",
                      "transition-transform duration-[160ms] ease-out-strong",
                      "active:scale-[0.94] hover-fine:group-hover:scale-105",
                    )}
                  >
                    {channel.icon}
                  </span>
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* The toggle. Brand lime, so it reads as MOBO chrome and not a support
          chat widget; the glyph cross-fades chat → X in place. */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="contact-island-channels"
        aria-label={open ? "Închide contactele rapide" : "Deschide contactele rapide"}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={
          reduce
            ? { duration: DUR.micro, delay: 0.6 }
            : { type: "spring", bounce: 0.3, duration: 0.5, delay: 0.9 }
        }
        className={cn(
          "grid size-14 place-items-center rounded-full bg-lime-brand text-lime-ink",
          "shadow-[0_14px_34px_-12px_rgb(0_0_0/0.6),inset_0_1px_0_0_rgb(255_255_255/0.35)]",
          "transition-[transform,background-color] duration-[160ms] ease-out-strong",
          "active:scale-[0.94] hover-fine:hover:bg-lime-hi",
        )}
      >
        <span className="relative block size-6" aria-hidden="true">
          {/* Chat bubble */}
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute inset-0"
            initial={false}
            animate={
              reduce
                ? { opacity: open ? 0 : 1 }
                : { opacity: open ? 0 : 1, scale: open ? 0.6 : 1, rotate: open ? -45 : 0 }
            }
            transition={{ duration: DUR.micro, ease: EASE_OUT }}
          >
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          {/* X */}
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute inset-0"
            initial={false}
            animate={
              reduce
                ? { opacity: open ? 1 : 0 }
                : { opacity: open ? 1 : 0, scale: open ? 1 : 0.6, rotate: open ? 0 : 45 }
            }
            transition={{ duration: DUR.micro, ease: EASE_OUT }}
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
        </span>
      </motion.button>
    </div>
  );
}
