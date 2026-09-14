"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { useI18n } from "@/components/ui/LangProvider";
import { SITE, SOCIALS } from "@/lib/data";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Quick contact — phone + messaging channels behind one toggle.
 *
 * This used to be a floating bubble pinned to the bottom-right corner. The
 * client moved it into the nav, immediately left of the hamburger, so the
 * channels now unfold ALONG THE BAR instead of up the side of the screen:
 * a horizontal row that drops just under the pill, right-aligned so it hangs
 * off the toggle it came from and can never run off a narrow screen.
 *
 * The toggle is glass, not lime, on purpose. It sits next to "Solicit Calcul",
 * and two lime circles side by side would fight; glass matches the hamburger
 * it is paired with and leaves the CTA the only lime thing in the cluster.
 * The colour lives in the channels themselves, which keep their real brand
 * surfaces — a row of identical glass chips would make phone and TikTok
 * indistinguishable at a glance.
 *
 * MOTION — everything radiates from the toggle:
 *   open   each channel pops out at 45ms intervals, nearest the toggle first,
 *          travelling right→left out of the button with a touch of spring
 *          bounce (gesture-adjacent, so bounce is allowed);
 *   close   the same path reversed, quicker, farthest first — the row reels
 *          back into the button it came from.
 * Under reduced motion both become plain cross-fades.
 */

type Channel = {
  /* Identity, not copy: the messaging channels are named after the brand, and
     that same string looks the href up in SOCIALS and the mark up in BrandIcon.
     Translating it would break both, so brands keep their name in every
     language and only the phone — which is not a brand — carries a labelKey. */
  label: string;
  labelKey?: TranslationKey;
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
  <span className="relative block size-[18px]">
    <BrandIcon
      name="tiktok"
      className="absolute inset-0 -translate-x-[0.75px] -translate-y-[0.75px] text-[#25f4ee]"
    />
    <BrandIcon
      name="tiktok"
      className="absolute inset-0 translate-x-[0.75px] translate-y-[0.75px] text-[#fe2c55]"
    />
    <BrandIcon name="tiktok" className="absolute inset-0 text-white" />
  </span>
);

/* Order matters: rendered into a row-reverse flex, so the FIRST entry lands
   nearest the toggle and opens first. Phone leads — it is the one channel
   that closes a sale. */
const CHANNELS: Channel[] = [
  {
    label: "Sună-ne",
    labelKey: "chrome.quick.call",
    href: SITE.phoneHref,
    bg: "#26b04c",
    icon: <BrandIcon name="phone" className="size-[18px]" />,
  },
  {
    label: "Telegram",
    href: socialHref("Telegram"),
    external: true,
    /* Telegram's own vertical gradient, not a flat approximation. The nudge
       re-centres the plane, which sits low-left inside the full mark's grid. */
    bg: "linear-gradient(180deg, #2aabee 0%, #229ed9 100%)",
    icon: (
      <BrandIcon name="telegramPlane" className="size-[18px] translate-x-[0.5px] -translate-y-px" />
    ),
  },
  {
    label: "Instagram",
    href: socialHref("Instagram"),
    external: true,
    bg: "radial-gradient(circle at 30% 110%, #fdf497 0%, #fd5949 45%, #d6249f 62%, #285aeb 92%)",
    icon: <BrandIcon name="instagram" className="size-[18px]" />,
  },
  {
    label: "TikTok",
    href: socialHref("TikTok"),
    external: true,
    bg: "#0f0f0f",
    icon: tiktokLayered,
  },
];

const PANEL_ID = "quick-contact-channels";

export default function QuickContact({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);

  /* Outside press + Escape both close — a control the user has to hunt down a
     close button for stops being comfortable. */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  const listVariants: Variants = {
    hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
    visible: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
  };

  /* x is positive in the hidden state: the channels start stacked under the
     toggle on the right and travel out to the left into their slots. */
  const itemVariants: Variants = reduce
    ? {
        hidden: { opacity: 0, transition: { duration: DUR.micro } },
        visible: { opacity: 1, transition: { duration: DUR.micro } },
      }
    : {
        hidden: {
          opacity: 0,
          x: 18,
          scale: 0.4,
          transition: { duration: 0.16, ease: EASE_OUT },
        },
        visible: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { type: "spring", bounce: 0.3, duration: 0.5 },
        },
      };

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label={open ? t("chrome.quick.close") : t("chrome.quick.open")}
        className={cn(
          "glass glass-thin btn-3d-glass grid size-11 shrink-0 place-items-center rounded-full text-fg",
          "transition-transform duration-[160ms] ease-out-strong active:scale-[0.97]",
        )}
      >
        <span className="relative block size-5" aria-hidden="true">
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
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>
        </span>
      </button>

      {/* The row. Anchored to this button's right edge and hung below the pill,
          so it opens leftward along the bar and stays on screen at any width. */}
      <AnimatePresence>
        {open && (
          <motion.ul
            key="channels"
            id={PANEL_ID}
            aria-label={t("chrome.quick.title")}
            className="absolute right-0 top-full z-10 mt-3 flex list-none flex-row-reverse items-start gap-2"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {CHANNELS.map((channel) => {
              const label = channel.labelKey ? t(channel.labelKey) : channel.label;
              return (
                <motion.li key={channel.label} variants={itemVariants} className="will-move">
                  <a
                    href={channel.href}
                    aria-label={label}
                    onClick={() => onOpenChange(false)}
                    {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex w-11 flex-col items-center gap-1.5"
                  >
                    <span
                      style={{ background: channel.bg, color: channel.fg ?? "#fff" }}
                      className={cn(
                        /* Culoarea de brand a rețelei vine inline; btn-3d-glass
                           așază volumul (lumină sus, umbră jos) peste ea. */
                        "btn-3d-glass grid size-11 place-items-center rounded-full",
                        "shadow-[0_10px_28px_-10px_rgb(0_0_0/0.55),inset_0_1px_0_0_rgb(255_255_255/0.22)]",
                        "transition-transform duration-[160ms] ease-out-strong",
                        "active:scale-[0.94] hover-fine:group-hover:scale-105",
                      )}
                    >
                      {channel.icon}
                    </span>
                    {/* Label under the bubble — visible on cursor devices only,
                        where there is room and a hover to reveal it. */}
                    <span
                      className={cn(
                        "pointer-events-none hidden max-w-full truncate text-[0.625rem] tracking-tight text-fg-dim",
                        "opacity-0 transition-opacity duration-200 ease-out-strong",
                        "hover-fine:group-hover:opacity-100 sm:block",
                      )}
                    >
                      {label}
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
