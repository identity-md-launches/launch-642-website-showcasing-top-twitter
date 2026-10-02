# The Swamp design system

## Overview

The Swamp is an independent identity.md reading room for people exploring the AI workforce and its surrounding ideas. The requested green background and “Pepes armed with AI” direction appear in a pale leaf-green canvas, forest-green type, and custom vector agents carrying computing equipment. Editorial cards sit on warm, pale-green surfaces. The design uses a large, quiet hero, a narrow dark manifesto band, and a practical collection below it.

This is one static page. Shared design rules are the palette, spacing, typography, card treatments, and controls; the illustrated two-column hero is specific to this page. Canonical implementation: `src/styles.css`, `src/App.tsx`, `src/icons.tsx`, and `public/images/`.

## Colors

The source uses hex primitives and semantic CSS properties in `src/styles.css:9`. Components use semantic roles for the interface; custom illustration palettes are local to the art.

| Semantic token | Implemented value | Role |
| --- | --- | --- |
| `--color-page` | `--green-200`, `#daedb6` | Entire page canvas |
| `--color-surface` | `--green-50`, `#f1f5e8` | Cards and About dialog |
| `--color-surface-soft` | `--green-100`, `#e5efcf` | Search and empty-state surfaces |
| `--color-text` | `--green-900`, `#183c2b` | Main type and icons |
| `--color-text-muted` | `--green-700`, `#48603c` | Descriptions, handles, dates |
| `--color-border` | `--green-400`, `#b1ca8b` | Dividers and subtle structure |
| `--color-control-border` | `--green-600`, `#577147` | Inputs and outlined controls |
| `--color-action` | `#183c2b` | Filled primary actions and selected filters |
| `--color-on-action` | `#f1f5e8` | Type on filled actions |
| `--color-hover` | `--green-300`, `#c6dfa0` | Hover, saved buttons, bottom callout |
| `--color-focus` | `#183c2b` | 3px focus outlines |

Primary-button hover uses `#2c5038`. Text selection uses the action/on-action pair. The declared `--color-selection` alias is reserved and not applied by `::selection`. No dark theme or status-color ramp exists. Saved state also uses a filled bookmark and `aria-pressed`; it does not depend on color alone.

Measured rendered pairs: muted/page 5.56:1, muted/card 6.29:1, on-action/action 11.03:1. These are sampled solid pairs, not a claim that every decorative image or state was contrast-audited. See `artifacts/validation.md`.

## Typography

`--font-body` is **DM Sans**, then Arial and sans-serif. The local `public/fonts/dm-sans-latin.woff2` supplies upright variable weights 400–800; it is preloaded and uses `font-display: swap`. The browser confirmed the face loaded. `--font-mono` uses SFMono-Regular, Consolas, Liberation Mono, monospace for editorial labels. Georgia appears only in a decorative quote graphic.

| Role | Final implementation |
| --- | --- |
| Display h1 | `--text-display: clamp(3.35rem, 6.3vw, 5.75rem)` at wide sizes; weight 650, line-height 1.03, tracking −0.065em; smaller breakpoint rules end at 2.95rem at ≤355px. |
| Collection h2 | `--text-section: 2.5rem`, line-height 1.15, tracking −0.045em; 2.15rem at ≤960px, 2rem at ≤720px, 1.9rem at ≤480px, 1.75rem at ≤355px. |
| Standard card h3 | `--text-card: 1.5rem`, weight 650, line-height 1.4, tracking −0.04em. Intermediate widths use 1.35rem or 1.25rem where specified. |
| Featured h3 | 2.6rem / 1.15; 2.2rem on intermediate layouts; 2rem on small screens. |
| Reading copy | Card excerpts 0.8125–0.9375rem / 1.65; hero 0.85–1.06rem / 1.65; dialog body 0.9375rem / 1.6. |
| Functional metadata | Final override at `src/styles.css:1976` sets card metadata, handles, dates, search labels, sorting, result counts, and footer text to `--text-label: 0.75rem`. |
| Author names / read actions | `--text-small: 0.8125rem` in the final override. |
| Search input | 0.8125rem desktop; 1rem at ≤720px to avoid mobile input zoom. |

The default body size is the browser's 1rem. `--text-body` is a declared reference token rather than a global body-size override. Display headings use balanced wrapping, prose uses pretty wrapping, and long titles/excerpts may break to avoid overflow. No title or excerpt is line-clamped. Card copy measures are bounded by the grid; dialog text sits in a 590px maximum panel with 32px padding. Counts use tabular numerals. Small brand sublines and decorative art captions deliberately fall below the functional metadata scale.

## Layout

`.container` is capped at 1240px, with 48px side gutters initially, 32px at ≤1150px, 20px at ≤720px, and 16px at ≤355px. The declared `--space-*` reference scale is 4, 8, 12, 16, 24, 32, 48, 64, and 80px. Component rules currently express most dimensions directly in px/rem; use that scale for related additions.

The collection uses `.read-grid`: three equal columns with 24px gaps, two columns with 22px gaps at ≤960px, 18px gaps at ≤720px, and one column with 22px gaps at ≤480px. `.featured-card` spans the grid and has its own two-column layout, stacking at ≤720px. Its thumbnail becomes 255px tall, then 215px, then 195px at the narrower breakpoints. Standard card thumbnails are 180px tall, briefly 155px in the intermediate narrow grid, then 180px in the single-column mobile layout.

At ≤960px, navigation moves to a second row. At ≤720px, the hero stacks with centered text, the search field fills the width, and the manifesto hides two secondary slogans. Filter buttons wrap rather than scroll or clip. At 320px, the final filter can occupy another line. Text remains in DOM reading order. Sorting and result text may wrap separately. The bottom callout adapts to an inset full-width action on mobile.

Screenshots and overflow checks cover 1440, 820, 390, and 320 CSS pixels. A separate 200% root-text enlargement check at 820px passed; this does not establish browser-native zoom behavior.

## Elevation & Depth

The interface is mostly flat. Cards have a `0 0 0 1px #0000000a` ring; hover adds a stronger ring and a small `0 5px 14px #183c2b08` shadow. Dividers organize metadata and navigation. Images have a 1px neutral black outline at 10% opacity, inset by 1px. The modal uses the native top layer, a `#122c20a6` backdrop, and 4px backdrop blur. The skip link uses z-index 20 when focused.

## Shapes

`--radius-card` is 12px and `--radius-control` is 6px. Avatars and the callout mark are circular. Bookmark buttons use a 5px radius; the modal uses 16px. The declared pill-radius reference is not applied to a UI component. Cards clip their thumbnail corners, while focus rings belong to actual links and buttons inside the content area. Custom SVG and CSS illustrations use their own geometric shapes.

## Components

| Pattern / source | API and behavior |
| --- | --- |
| `ReadCard`, `src/App.tsx:142` | Internal component taking `read`, `saved`, and `onSave`; renders exact-source links, content metadata, author, and bookmark. `read.featured` changes the layout. All link targets remain normal anchors, so browser open-in-new-tab behavior works. |
| `Avatar`, `src/App.tsx:33` | Internal component taking `read`; local image when available, initial fallback otherwise or after decode failure. Decorative beside the author's visible name. |
| `Cover`, `src/App.tsx` | Selects factory art, sourced covers, or custom CSS/SVG concept art from `read.art`. Covers are decorative; all article information is available as text. |
| `Icon` / `FrogMark`, `src/icons.tsx` | Shared vector icons. `Icon` accepts `name` and optional `className`; 24-unit viewBox, 1.7px stroke, `currentColor`, decorative to assistive technology. |
| `.primary-button` / `.secondary-button` | Filled primary and outlined secondary actions. Native anchor or button semantics; minimum 48–50px primary height. |
| `.filter-group` | Native buttons in a labeled group, `aria-pressed`, visible counts, filled selected state. Not an ARIA tablist because it filters one shared list. |
| `.search-field` / `.sort-control` | Explicit visible labels, native search input and select. Search clear returns focus to the input. Results have a polite live region. |
| `.save-button` / `.nav-saved` | Browser-local storage key `the-swamp:saved:v1`; filled bookmark plus pressed state. Reload persistence, invalid-data recovery, and blocked-storage messaging. Removing the last saved read moves focus to the recovery action. |
| `.empty-state` | Separate wording for an empty saved library and unmatched filters; one “Browse all reads” reset action. |
| `.about-dialog` | Native modal, internal Tab/Shift+Tab wrap, Escape dismissal, backdrop dismissal, and return focus to the opener. Max-height `calc(100dvh - 48px)` with contained overscroll. |

Focus uses `:focus-visible` with 3px outlines and 4px offset; search has a 2px focus-within ring. Forced colors retains a system `Highlight` outline. Hover rules are gated by `(hover: hover)`. The only interaction motion is 150ms background/shadow feedback and a 0.96 press scale, enabled only under `prefers-reduced-motion: no-preference`; smooth scrolling shares that guard. There is no autoplay or animated entrance. There is no remote loading state because all collection data ships with the page.

## Do's and Don'ts

- Start new sections inside `.container`; reuse the semantic color roles and existing card/field/action patterns.
- Keep source titles and excerpts attributable. Add a `Read` in `src/data.ts`, its local art if needed, and verify the source URL. Update the intentionally fixed seven-read copy, snapshots, and validation expectations if the collection changes.
- Use normal anchors for destinations and buttons for actions. Preserve visible labels, pressed states, focus return, and empty-state recovery.
- Keep illustrations locally bundled and decorative text out of the reading hierarchy. Reuse `Icon` and `FrogMark` rather than mixing icon libraries.
- A new static page should reuse the font, tokens, `.container`, and shared patterns. Prefer a same-page section or hash navigation unless a separate HTML entry is actually exported. Rebuild and check `dist/` at a subpath.
- Do not add live-looking engagement figures, remote X widgets, wallet flows, or an extra theme without a corresponding product requirement. Do not replace the established pale green canvas with white.

Design review followed Jakub Krehel's Better Interface and Paul Bakaus's Impeccable documentation method; attribution and their retained licenses are in `artifacts/SOURCES.md` and `artifacts/licenses/design-guides.txt`.
