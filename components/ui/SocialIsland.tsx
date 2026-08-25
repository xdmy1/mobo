"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { BrandIcon } from "@/components/ui/BrandIcon";
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

/* The genuine marks, via BrandIcon (Simple Icons paths). TikTok gets its
   signature chromatic offset — the cyan and magenta copies peeking out from
   under the white glyph — because a plain white note on black reads as a
   knock-off of the real logo. */
const tiktokLayered = (
  <span className="relative block size-5">
    <BrandIcon name="tiktok" className="absolute inset-0 -translate-x-[0.75px] -translate-y-[0.75px] text-[#25f4ee]" />
    <BrandIcon name="tiktok" className="absolute inset-0 translate-x-[0.75px] translate-y-[0.75px] text-[#fe2c55]" />
    <BrandIcon name="tiktok" className="absolute inset-0 text-white" />
  </span>
);

const CHANNELS: Channel[] = [
  {
    label: "Sună-ne",
    href: SITE.phoneHref,
    bg: "#26b04c",
    icon: <BrandIcon name="phone" className="size-5" />,
  },
  {
    label: "TikTok",
    href: socialHref("TikTok"),
    external: true,
    bg: "#0f0f0f",
    icon: tiktokLayered,
  },
  {
    label: "Instagram",
    href: socialHref("Instagram"),
    external: true,
    bg: "radial-gradient(circle at 30% 110%, #fdf497 0%, #fd5949 45%, #d6249f 62%, #285aeb 92%)",
    icon: <BrandIcon name="instagram" className="size-5" />,
  },
  {
    label: "Telegram",
    href: socialHref("Telegram"),
    external: true,
    /* Telegram's own vertical gradient, not a flat approximation. The nudge
       re-centres the plane, which sits low-left inside the full mark's grid. */
    bg: "linear-gradient(180deg, #2aabee 0%, #229ed9 100%)",
    icon: <BrandIcon name="telegramPlane" className="size-5 translate-x-[0.5px] -translate-y-px" />,
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
