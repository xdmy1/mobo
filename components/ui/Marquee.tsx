import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Infinite marquee.
 *
 * Deliberately CSS, not JS. Constant looping motion runs for the entire time
 * the section is on screen, and a CSS animation runs off the main thread — so
 * it keeps its frames while the browser is busy decoding the page's photos.
 * A requestAnimationFrame loop would drop frames at exactly that moment.
 *
 * Content is duplicated once and the track travels -50%, which is what makes
 * the loop seamless. The duplicate is aria-hidden so it isn't read twice.
 */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  className,
  fade = true,
}: {
  children: ReactNode;
  /** Seconds for one full cycle. Longer = slower. */
  duration?: number;
  reverse?: boolean;
  className?: string;
  fade?: boolean;
}) {
  return (
    <div
      className={cn("marquee-root relative w-full overflow-hidden", className)}
      style={
        fade
          ? {
              /* Wide, soft edges. At 8% the cards were still near-opaque as they
                 hit the viewport edge and read as being cut off; carrying the
                 fade to ~18% makes the row read as continuing past the screen.
                 The extra stop keeps the falloff gradual rather than linear. */
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 7%, #000 18%, #000 82%, rgba(0,0,0,0.55) 93%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 7%, #000 18%, #000 82%, rgba(0,0,0,0.55) 93%, transparent 100%)",
            }
          : undefined
      }
    >
      <div
        className="marquee-track flex w-max"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
