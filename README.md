# MOBO Kitchens & Home — homepage redesign

A redesign of the **mobo.md** homepage only, built as a live preview for approval.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · Motion v12 · Lenis · TypeScript

```bash
npm install
npm run dev     # http://localhost:3000
```

---

## Design direction

The reference was **navarro.ro** — dark, premium, heavy liquid glass, Lenis smooth scroll.
Two findings shaped the result:

**1. The brand is already lime.** Sampling mobo.md's own logo returns `#CCDF10` across 38.5%
of its opaque pixels. navarro's accent is `#c6ff69`. The reference aesthetic and MOBO's
existing identity already agree — the accent here is the brand's own colour, not an import.

**2. "Not too black."** navarro sits on `#0d0d0d`, near-pure black. This sits on `#20211b`,
a warm graphite with an olive cast that ties into the lime, and alternates dark bands with
warm-ivory (`#f6f5ee`) bands so the page reads editorial rather than as one dark tunnel:

| Section | Band |
| --- | --- |
| Hero, Categories | dark |
| **Projects, Process** | **light** |
| WhyMobo, Testimonials | dark |
| **About** | **light** |
| LeadForm, Footer | dark |

---

## Liquid glass

Built as a real material, not a translucent rectangle. Four stacked layers (`app/globals.css`):

1. `backdrop-filter: blur(30px) saturate(180%)` — the content behind
2. a tinted body, so the surface has substance
3. a bright inner top edge — light catching the leading edge
4. a specular sheen gradient on `::before`

Variants: `.glass` · `.glass-thick` (larger surfaces read as thicker) · `.glass-thin`
(small chips use a lighter material) · `.glass-invert` (**required** on the light bands —
light-on-light glass destroys legibility) · `.glass-lime`.

The base values (`--glass-blur: 30px`, `--glass-opacity: .08`, `--glass-refraction: .05`)
are navarro.ro's own custom properties, read from its compiled CSS.

---

## Motion

Tokens live in `lib/motion.ts` and are mirrored as CSS variables in `globals.css`.

- Springs for anything a user can grab; curves for anything scripted.
- Default spring is **critically damped** (`bounce: 0`). Bounce is only added where a
  gesture carried momentum into the motion.
- Interactive transitions stay **under 300ms**; scroll reveals run to 800ms.
- Only `transform` and `opacity` animate — both skip layout and paint.
- The marquee is CSS, not JS, so it keeps its frames while the browser decodes photos.
- Every hover effect is gated behind `@media (hover: hover) and (pointer: fine)` — on touch,
  a tap fires hover and leaves the element stuck.

**Accessibility preferences are handled as three independent signals:**
`prefers-reduced-motion` (travel and overshoot removed, cross-fades kept),
`prefers-reduced-transparency` (glass becomes frosted and solid),
`prefers-contrast` (near-solid backgrounds with defined borders).

---

## CRM readiness

The lead form is wired to a provider adapter, so the CRM destination is a one-file change.
Full guide: **[`docs/CRM-INTEGRATION.md`](docs/CRM-INTEGRATION.md)**.

```
components  →  POST /api/lead  →  submitLead()  →  provider (WordPress | HubSpot | …)
                                       └────────→  notifiers (Telegram)
```

No component ever imports a provider. `app/api/lead/route.ts` re-validates everything
server-side and layers three invisible spam defences: honeypot field, dwell-time check,
and per-IP rate limiting.

---

## Preview caveats

These are deliberate, and all are single-file fixes on approval:

- **Images are hot-linked from the live mobo.md WordPress media library.** On approval they
  become local files in `/public`; only `lib/data.ts` and the `remotePatterns` block in
  `next.config.ts` change.
- **Only the homepage exists.** Nav and footer links point at real mobo.md URLs or on-page
  anchors.
- **Rate limiting is in-memory** — correct for a single Node instance, not for multi-region
  serverless. Swap for Upstash Redis before scaling out. Flagged in the route file.
- Copy, project names, reviews and contact details are the **real** content from mobo.md, so
  the design is judged on design rather than on lorem ipsum.
