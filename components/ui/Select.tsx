"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { DUR, EASE_DRAWER, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Custom select — a real listbox, not a styled illusion.
 *
 * Native <select> renders as an OS widget and breaks the page's visual language
 * at the exact moment a visitor is committing to a lead. This replaces it with
 * the APG "select-only combobox" pattern:
 *
 *   - DOM focus NEVER leaves the trigger. The active option is only pointed at
 *     via aria-activedescendant, so "focus returns to the trigger on close" is
 *     structurally guaranteed rather than patched with focus() calls.
 *   - ≥ 640px: a popover anchored in-flow under the field. Because it is
 *     absolutely positioned inside the trigger's own stacking context (no
 *     portal), scrolling can never detach it — it moves with the field.
 *   - < 640px: a bottom sheet in a portal. A popover pinned to a field in the
 *     lower half of a phone screen has nowhere to open; a sheet always does.
 *
 * Motion: the popover scales from the edge it is anchored to (origin-aware),
 * enters 200ms on the house EASE_OUT and leaves in 130ms — a dismissed panel is
 * no longer information. Options cascade in from the trigger edge, ~24ms apart,
 * capped at 120ms so a long list never feels slow. The sheet travels on
 * EASE_DRAWER, the curve reserved in lib/motion.ts for exactly this surface.
 * Only transform and opacity are ever animated.
 */

type Placement = "down" | "up";

export type SelectProps<T extends string> = {
  /** The focusable trigger's id — <label htmlFor> and error-focus both target it. */
  id: string;
  /** Mirrored into a hidden input so the field stays form-serialisable. */
  name?: string;
  /** Repeated as the heading of the mobile sheet. Pass the visible label text. */
  label?: string;
  placeholder: string;
  options: readonly T[];
  value: string;
  onChange: (value: T) => void;
  /** Fires when focus genuinely leaves the field — same contract as a native select. */
  onBlur?: () => void;
  /** Extra trigger classes — the caller passes its error border here. */
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/* Geometry used to decide whether the popover flips upward. Kept in sync with
   the classes below: min-h-11 rows (44px — the touch minimum), p-1 chrome,
   max-h-80 cap, mt-1.5 gap. */
const OPTION_H = 44;
const PANEL_CHROME = 8;
const PANEL_MAX_H = 320;
const PANEL_GAP = 6;

/* Popover: enter 200ms, exit 130ms — dismissal must always be the faster of
   the two. Sheet: longer, because it travels the full height of itself; 380ms
   on the drawer curve reads as weight, 260ms out reads as obedience. */
const PANEL_EXIT = 0.13;
const SHEET_ENTER = 0.38;
const SHEET_EXIT = 0.26;

/* Type-ahead folds diacritics — ș/ț/ă/â/î decompose to base letter + combining
   mark, so typing "i" also reaches "Încă nu știu". */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Matches Tailwind's sm breakpoint: below it the popover becomes a sheet. */
function useIsPhone(): boolean {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return phone;
}

const TRIGGER = cn(
  /* Mirrors the form's CONTROL surface: sober radius, quiet 1px border, 16px
     type so iOS Safari does not zoom the viewport on focus. */
  "flex h-11 w-full items-center justify-between gap-3 rounded-md border border-white/10 bg-transparent px-3.5 text-left text-base",
  "transition-[border-color,background-color,transform] duration-150 ease-out-strong",
  "hover-fine:hover:bg-white/[0.03]",
  "active:scale-[0.97]",
);

const OPTION = cn(
  "flex w-full cursor-pointer select-none items-center justify-between gap-3 rounded-[5px]",
  "text-fg active:bg-white/[0.08]",
);

function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-4 shrink-0 text-lime-brand"
    >
      <path
        d="m3.5 8.5 2.9 2.9 6.1-6.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Select<T extends string>({
  id,
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: SelectProps<T>) {
  const reduce = useReducedMotion();
  const isPhone = useIsPhone();
  const dragControls = useDragControls();

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [placement, setPlacement] = useState<Placement>("down");
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  /* True after the first open — gates the value-commit animation so the trigger
     text does not animate on initial page render. */
  const interacted = useRef(false);
  const searchBuffer = useRef("");
  const searchTimer = useRef<number | undefined>(undefined);

  const listboxId = `${id}-listbox`;
  const sheetLabelId = `${id}-sheet-label`;
  const optionId = (index: number) => `${id}-option-${index}`;
  const selectedIndex = (options as readonly string[]).indexOf(value);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => () => window.clearTimeout(searchTimer.current), []);

  /* Crossing the breakpoint while open would teleport a popover into a sheet
     mid-flight — close instead. Runs harmlessly on mount. */
  useEffect(() => {
    setOpen(false);
  }, [isPhone]);

  /* Outside interaction closes. pointerdown, not click, so it feels immediate
     and wins the race against whatever the press lands on. */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (sheetRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  /* The popover is anchored in-flow, so scrolling keeps it attached for free.
     Resize can invalidate the flip decision — close rather than drift. Escape
     is also caught here so it works even if focus was lost to the sheet. */
  useEffect(() => {
    if (!open) return;
    const onResize = () => setOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* The sheet floats over the page — the page must not scroll underneath it. */
  useEffect(() => {
    if (!(open && isPhone)) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isPhone]);

  const close = (focusBack: boolean) => {
    setOpen(false);
    if (focusBack) triggerRef.current?.focus();
  };

  const openList = (initialActive: number) => {
    interacted.current = true;
    const trigger = triggerRef.current;
    if (trigger && !isPhone) {
      /* Flip up only when the panel cannot fit below AND there is more room
         above. Height is deterministic (fixed row height, capped), so this is
         decided once, before paint — no flicker. */
      const rect = trigger.getBoundingClientRect();
      const panelH = Math.min(options.length * OPTION_H + PANEL_CHROME, PANEL_MAX_H) + PANEL_GAP;
      const below = window.innerHeight - rect.bottom;
      setPlacement(below < panelH && rect.top > below ? "up" : "down");
    }
    setActive(initialActive);
    setOpen(true);
    if (initialActive >= 0) scrollToOption(initialActive);
  };

  const commit = (index: number) => {
    const option = options[index];
    if (option !== undefined) onChange(option);
    close(true);
  };

  /* rAF: the option node exists only after React commits the open state. */
  const scrollToOption = (index: number) => {
    requestAnimationFrame(() => {
      document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" });
    });
  };

  const setActiveByKeyboard = (index: number) => {
    setActive(index);
    scrollToOption(index);
  };

  /**
   * APG type-ahead: the buffer matches option prefixes; repeating one letter
   * cycles through everything starting with it, exactly like a native select.
   */
  const typeahead = (char: string, current: number = active) => {
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      searchBuffer.current = "";
    }, 600);

    const grown = searchBuffer.current + char.toLowerCase();
    searchBuffer.current = grown;

    const repeated = grown.length > 1 && grown.split("").every((c) => c === grown[0]);
    const query = fold(repeated ? grown[0] : grown);
    const start = current < 0 ? 0 : repeated || grown.length === 1 ? current + 1 : current;

    for (let step = 0; step <= options.length; step++) {
      const index = (start + step) % options.length;
      if (fold(options[index]).startsWith(query)) {
        setActiveByKeyboard(index);
        return;
      }
    }
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event;
    const printable = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (!open) {
      if (key === "Enter" || key === " " || key === "ArrowDown") {
        event.preventDefault();
        openList(selectedIndex >= 0 ? selectedIndex : 0);
      } else if (key === "ArrowUp") {
        event.preventDefault();
        openList(selectedIndex >= 0 ? selectedIndex : options.length - 1);
      } else if (key === "Home") {
        event.preventDefault();
        openList(0);
      } else if (key === "End") {
        event.preventDefault();
        openList(options.length - 1);
      } else if (printable) {
        openList(selectedIndex >= 0 ? selectedIndex : -1);
        typeahead(key, -1);
      }
      return;
    }

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveByKeyboard(active < 0 ? 0 : Math.min(options.length - 1, active + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveByKeyboard(active < 0 ? options.length - 1 : Math.max(0, active - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveByKeyboard(0);
        break;
      case "End":
        event.preventDefault();
        setActiveByKeyboard(options.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        /* No preventDefault — the point is that focus moves on. Close without
           committing, matching platform listboxes. */
        setOpen(false);
        break;
      case "Enter":
        event.preventDefault();
        if (active >= 0) commit(active);
        else close(true);
        break;
      case " ":
        event.preventDefault();
        /* Mid-type-ahead, space is a character ("toată casa"); otherwise it commits. */
        if (searchBuffer.current) typeahead(" ");
        else if (active >= 0) commit(active);
        else close(true);
        break;
      default:
        if (printable) typeahead(key);
    }
  };

  const onSheetDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.y > 64 || info.velocity.y > 500) close(true);
  };

  /* ------------------------------------------------------------ rendering -- */

  const renderOption = (option: T, index: number, sheet: boolean) => {
    const isSelected = option === value;
    const isActive = index === active;
    /* When the panel opens upward the cascade starts at the bottom — options
       always emanate from the trigger edge. Delay capped so item 6+ of a long
       list arrives with item 6, never later. */
    const staggerIndex = placement === "down" ? index : options.length - 1 - index;

    const shared = {
      id: optionId(index),
      role: "option" as const,
      "aria-selected": isSelected,
      onClick: () => commit(index),
      onPointerMove: () => {
        if (!sheet && active !== index) setActive(index);
      },
    };

    const classes = cn(
      OPTION,
      sheet ? "min-h-12 px-3 text-base" : "min-h-11 px-2.5 text-[0.9375rem]",
      isActive && "bg-white/[0.06]",
    );

    const content = (
      <>
        <span className="truncate">{option}</span>
        {isSelected ? <Check /> : null}
      </>
    );

    if (sheet) {
      /* The sheet's own travel carries its content — staggering inside a moving
         surface would double the motion. */
      return (
        <li key={option} {...shared} className={classes}>
          {content}
        </li>
      );
    }

    return (
      <motion.li
        key={option}
        {...shared}
        initial={reduce ? false : { opacity: 0, y: placement === "down" ? -5 : 5 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: reduce
            ? { duration: 0 }
            : {
                duration: DUR.micro,
                ease: EASE_OUT,
                delay: 0.02 + Math.min(staggerIndex * 0.024, 0.12),
              },
        }}
        className={classes}
      >
        {content}
      </motion.li>
    );
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onClick={() => {
          if (open) close(true);
          else openList(selectedIndex >= 0 ? selectedIndex : 0);
        }}
        onKeyDown={onTriggerKeyDown}
        onBlur={onBlur}
        className={cn(TRIGGER, open && "bg-white/[0.03]", className)}
      >
        {/* Keyed on value: a fresh commit rises 4px into place — a restrained
            acknowledgement, gated so initial render stays still. */}
        <motion.span
          key={value || "placeholder"}
          initial={interacted.current && !reduce ? { opacity: 0, y: 4 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.micro, ease: EASE_OUT }}
          className={cn("truncate", value ? "text-fg" : "text-fg-faint")}
        >
          {value || placeholder}
        </motion.span>
        <motion.svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : DUR.micro, ease: EASE_OUT }}
          className="size-4 shrink-0 text-fg-faint"
        >
          <path
            d="m4 6.5 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      {name ? <input type="hidden" name={name} value={value} /> : null}

      {/* --------------------------------------------- popover (≥ 640px) -- */}
      <AnimatePresence>
        {open && !isPhone ? (
          <motion.ul
            key="panel"
            id={listboxId}
            role="listbox"
            /* Focus must never leave the trigger — swallowing mousedown keeps
               option clicks (and scrollbar grabs) from blurring it. */
            onMouseDown={(event) => event.preventDefault()}
            style={{ transformOrigin: placement === "down" ? "top" : "bottom" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: placement === "down" ? -6 : 6 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: reduce ? 0.15 : DUR.micro, ease: EASE_OUT },
            }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } }
                : {
                    opacity: 0,
                    scale: 0.98,
                    y: placement === "down" ? -4 : 4,
                    transition: { duration: PANEL_EXIT, ease: EASE_OUT },
                  }
            }
            className={cn(
              "will-move absolute inset-x-0 z-50 max-h-80 overflow-y-auto overscroll-contain",
              "rounded-md border border-white/10 bg-ink-800 p-1",
              "shadow-[0_16px_40px_-16px_rgb(0_0_0_/_55%)]",
              placement === "down" ? "top-full mt-1.5" : "bottom-full mb-1.5",
            )}
          >
            {options.map((option, index) => renderOption(option, index, false))}
          </motion.ul>
        ) : null}
      </AnimatePresence>

      {/* ----------------------------------------------- sheet (< 640px) -- */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open && isPhone ? (
                <motion.div
                  key="scrim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: DUR.ui, ease: EASE_OUT } }}
                  exit={{ opacity: 0, transition: { duration: DUR.micro, ease: EASE_OUT } }}
                  onClick={() => close(false)}
                  className="fixed inset-0 z-[110] bg-ink-950/70"
                />
              ) : null}
              {open && isPhone ? (
                <motion.div
                  key="sheet"
                  ref={sheetRef}
                  drag={reduce ? false : "y"}
                  dragListener={false}
                  dragControls={dragControls}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.7 }}
                  onDragEnd={onSheetDragEnd}
                  onMouseDown={(event) => event.preventDefault()}
                  initial={reduce ? { opacity: 0 } : { y: "100%" }}
                  animate={
                    reduce
                      ? { opacity: 1, transition: { duration: 0.15, ease: EASE_OUT } }
                      : { y: 0, transition: { duration: SHEET_ENTER, ease: EASE_DRAWER } }
                  }
                  exit={
                    reduce
                      ? { opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } }
                      : { y: "100%", transition: { duration: SHEET_EXIT, ease: EASE_DRAWER } }
                  }
                  className={cn(
                    "will-move fixed inset-x-0 bottom-0 z-[120]",
                    "rounded-t-3xl border-t border-white/10 bg-ink-800",
                    "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
                  )}
                >
                  {/* Grab zone — dragging starts here only, so the option list
                      underneath keeps its native touch scrolling. */}
                  <div
                    onPointerDown={(event) => {
                      if (!reduce) dragControls.start(event);
                    }}
                    className="touch-none pb-1 pt-2.5"
                  >
                    <div className="mx-auto h-1 w-9 rounded-full bg-white/20" />
                  </div>
                  {label ? (
                    <p id={sheetLabelId} className="px-4 pb-1 pt-0.5 text-[0.8125rem] text-fg-dim">
                      {label}
                    </p>
                  ) : null}
                  <ul
                    id={listboxId}
                    role="listbox"
                    aria-labelledby={label ? sheetLabelId : undefined}
                    className="max-h-[60vh] list-none overflow-y-auto overscroll-contain p-2"
                  >
                    {options.map((option, index) => renderOption(option, index, true))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
