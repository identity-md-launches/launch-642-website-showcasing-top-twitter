# The Swamp

A green, Pepe-inspired reading room for identity.md: seven original X links, four articles, two posts, and one thread. The site includes custom vector illustrations, format filters, author/topic search, chronological sorting, browser-local bookmarks, and an accessible About & sources dialog.

The ready-to-publish site is **`dist/`**. Source, lockfile, local images, fonts, and validation evidence are included. No API keys, backend, wallet connection, or external runtime scripts are required.

## Install and develop

Use Node.js 22.12+ (validated with Node 24.9.0 and npm 11.6.0).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The source uses React, TypeScript, and plain CSS. Content lives in `src/data.ts`; the interface is in `src/App.tsx`; tokens and responsive rules are in `src/styles.css`.

## Check, rebuild, and preview

```sh
npm run typecheck
npm run build
npm run preview
```

`build` replaces `dist/`. Preview serves the production export, normally at `http://localhost:4173`. Serve it over HTTP; opening the HTML directly with `file://` is not a supported preview method.

To run the repeatable browser validation:

```sh
npx playwright install chromium
npm run validate
```

The validator starts its own temporary HTTP server, serves the actual export under `/preview/`, runs interactions and accessibility checks, saves evidence into `artifacts/`, then closes the browser and server. An existing Chromium executable can be selected with `SWAMP_CHROMIUM=/absolute/path/to/chrome npm run validate`.

## Publish

Upload **the complete contents of `dist/`** to any static host. Set the publish/output directory to `dist` if your host asks. The export is already built; the publisher does not need to install dependencies or rebuild. Keep `assets/`, `fonts/`, `images/`, and `favicon.svg` alongside `index.html`.

Vite's `base` is `./`. Assets and the font preload use relative URLs, and navigation uses same-page hash anchors. The site works at a domain root or a gateway subpath with no route-rewrite rules. An IPFS/ENS publisher can upload the `dist` directory as its static site root.

Retain `dist/` alongside the source and lockfile in the submission. Do not include installed dependencies, package-manager caches, browser binaries, or temporary archives. No ignore files or Git configuration were changed in this assignment. Dependencies and scratch work were kept in `/tmp/` to honor the repository restrictions.

## Actual validation results

Final production source was checked on October 2, 2026:

| Command/check | Actual result |
| --- | --- |
| `npm run typecheck --prefix /tmp/imd-web-build` | Passed; TypeScript reported no errors. |
| `npm run build --prefix /tmp/imd-web-build` | Passed; Vite transformed 31 modules and emitted the production export. |
| `SWAMP_CHROMIUM=/opt/ms-playwright/chromium-1246/chrome-linux64/chrome npm run validate --prefix /tmp/imd-web-build` | Passed all 22 recorded check groups. Chromium 154.0.8037.0. |
| Desktop, tablet, and mobile | Inspected screenshots at 1440×1000, 820×1000, 390×844, and 320×740; no horizontal overflow, all local images and the font loaded. |
| Interaction checks | Original links; navigation; format filters; case-insensitive search; empty-state recovery; sort order; saved-state reload persistence; keyboard focus; modal handling; storage failures; mobile interactions. |
| Accessibility | axe reported zero violations in desktop, 320px, and modal states; 28 passing rules on each default page view. Sampled rendered text contrast: 5.56:1–11.03:1. |
| Runtime | No console/page errors, failed requests, or HTTP errors in the main test session. |

The `/tmp/imd-web-build` directory was an isolated copy of the exact source, with dependencies installed there. Its completed export was copied to the repository, and the copies were compared. The provided browser connector could not launch because it expected Chrome in a missing cache path; the direct Playwright test used the installed `/opt/ms-playwright` Chromium instead, with its own bounded preview server.

Read [the six-domain design review](artifacts/validation.md), [the machine-readable browser results](artifacts/browser-results.json), and [DESIGN.md](DESIGN.md). Screenshots: [desktop](artifacts/desktop.jpg), [tablet](artifacts/tablet.jpg), [mobile](artifacts/mobile.jpg), [320px](artifacts/mobile-320.jpg), [About dialog](artifacts/about.jpg), and [keyboard focus](artifacts/keyboard-focus.jpg).

## Content and limitations

The collection is a static editorial selection, not a live ranking or social feed. Original titles and short, exact excerpts were retrieved from the supplied X status URLs through FxTwitter on October 2, 2026. Short posts have editorial titles. Reading times are estimates at 220 words per minute. Joseph Chalom's article is labeled as broader AI/finance context, not an identity.md endorsement. Source quotes can contain historical prices or opinions; these are the authors' words, not live figures.

All content and art needed to render the page is bundled locally. Reading the full originals requires X and may require sign-in. Bookmarks belong to the current browser/origin and do not sync. When storage is blocked, bookmarks remain usable for the current visit with an explanatory message.

No physical-device, screen-reader, Safari/Firefox, browser-native zoom, or exhaustive focus-background audit was performed. The tested 200% root text enlargement is separate from native browser zoom. The source site's continued availability and full external X navigation were not independently tested. Automated checks are worker evidence, not independent certification.

See [content and asset credits](artifacts/SOURCES.md). Better Interface and Impeccable attribution and licenses are preserved under `artifacts/licenses/`; DM Sans's SIL OFL is in `public/fonts/OFL.txt` and the export.
