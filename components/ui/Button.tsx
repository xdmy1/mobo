"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "ghost" | "invert";
type Size = "sm" | "md" | "lg";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  withArrow?: boolean;
  external?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const VARIANTS: Record<Variant, string> = {
  /* The brand lime. Reserved for the single primary action in a viewport.
     No glow: a coloured halo behind a button is decoration pretending to be
     depth, and it is one of the clearest tells of a generated interface. */
  primary: "bg-lime-brand text-lime-ink hover:bg-lime-hi",
  glass: "glass glass-thin text-fg hover:bg-white/12",
  ghost: "text-fg-dim hover:text-fg",
  invert: "bg-ink-850 text-fg hover:bg-ink-800",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-[3.25rem] px-7 text-[0.9375rem] gap-2.5",
};

/**
 * Press feedback is the whole point of this component.
 *
 * `active:scale-[0.97]` fires on pointer-*down*, not on release, so the button
 * acknowledges the press at the exact moment the user is watching for it.
 * Waiting for click to show feedback is what makes an interface feel dead.
 *
 * Transitions name their properties explicitly — `transition-all` would drag
 * layout properties onto the compositor path for no reason.
 */
export const Button = forwardRef<HTMLButtonElement & HTMLAnchorElement, Props>(function Button(
  { children, href, variant = "primary", size = "md", className, withArrow, external, ...rest },
  ref,
) {
  const classes = cn(
    "group relative inline-flex items-center justify-center rounded-pill font-medium",
    "transition-[transform,background-color,color,box-shadow] duration-[160ms] ease-[var(--ease-out-strong)]",
    "active:scale-[0.97] select-none whitespace-nowrap",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {children}
      {withArrow && (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0",
            /* Gated behind a fine pointer — on touch, tap fires hover. */
            "transition-transform duration-[200ms] ease-[var(--ease-out-strong)]",
            "hover-fine:group-hover:translate-x-[3px]",
          )}
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button ref={ref} className={classes} {...rest}>
      {content}
    </button>
  );
});
