# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] — 2026-05-22

### Added
- **Drop-in fallback** when no `.has-sidenotes` ancestor is present. Notes outside a wrapper render as inline italic parentheticals automatically — the component is now usable in any HTML page without setup.
- **`@media print` stylesheet.** At print, notes flow inline as parentheticals at full opacity; the container drops its gutter padding and max-width so prose uses the page width.
- **Hover and `:focus-within` cue** linking marker ↔ note bidirectionally (pure CSS). Three new theming hooks: `--side-note-hover-color`, `--side-note-hover-bg`, `--side-note-hover-weight`. Transitions gated by `prefers-reduced-motion`.
- **CI workflow** (`.github/workflows/test.yml`) running typecheck, lint, Vitest, and Playwright (Chromium, Firefox, WebKit) on every PR and push to main.
- **Integration recipes** for plain HTML, Eleventy, Astro, and Hugo, in [`recipes/`](./recipes).
- **CHANGELOG.md** (this file).
- **Publish workflow** (`.github/workflows/publish.yml`) — tag-triggered npm publish with provenance attestation.

### Changed
- README Quickstart now treats the `.has-sidenotes` wrapper as optional (recommended for margin display; not required for the component to function).
- README Install section promotes npm and CDN paths to primary; from-source is documented for contributors.

## [0.2.1] — 2026-05-20

### Added
- Bidirectional hover linking between marker and note via `:host(:hover)`. Pure CSS — no JavaScript.

## [0.2.0] — 2026-05-19

### Added
- Responsive inline display at narrow viewports (≤ 60rem): notes flow inline as italic parentheticals after their markers. Pure CSS.
- `inline` attribute (was reserved in 0.1.0) now forces inline display at any viewport.
- Collision-aware stacking at wide viewports via `ResizeObserver` and one `requestAnimationFrame`-batched layout pass per container. Two markers close together no longer overlap their notes.
- `role="doc-footnote"` on the note `<aside>`.
- Playwright real-browser test suite covering collision, narrow-mode clearing, inline-attribute skipping, and resize lifecycle. Runs on Chromium, Firefox, and WebKit.

### Changed
- Marker is no longer focusable by default. `tabindex="0"` (a no-op holdover from 0.1.0) is removed. Future focus support is wired via dormant `:host(:focus-within)` selectors.
- `side` and `inline` attributes are read directly via CSS attribute selectors (`[side="left"]`, `[inline]`) instead of being JS-reflected to `data-*` attributes.

### Fixed
- Dev-mode demo: latent Vite resolution bug where `<script src="../src/index.ts">` in `site/index.html` was normalized to `/src/index.ts` by the browser and silently 404'd under `vite dev`. Build mode was unaffected. New `site/main.ts` entry shim now imports via Vite's `fs.allow` mechanism.

## [0.1.0] — 2026-05-15

### Added
- Initial release of the `<side-note>` custom element.
- Shadow DOM with `::part(marker)` and `::part(note)` for theming.
- Attributes: `side` (`"left"` / `"right"`), `label`, `id`, `inline` (reserved).
- CSS-counter-based auto-numbering scoped to `.has-sidenotes`.
- ARIA wiring: `role="doc-noteref"` on the marker, `aria-describedby` linking marker to note.
- CSS custom properties: `--side-note-color`, `--side-note-marker-size`, `--side-note-width`, `--side-note-gap`, `--side-note-font`, `--side-note-label`.
- Vite-based ESM + UMD build with TypeScript declaration files.
- Vitest unit tests (happy-dom).
- Public demo deployed via GitHub Pages.
