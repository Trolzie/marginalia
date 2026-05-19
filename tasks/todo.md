# v0.2 — milestone 2 (responsive display + collision detection)

Two pieces shipped together as v0.2:

1. **M2 base**: responsive margin / inline rendering via pure CSS
2. **M2.5**: collision-aware stacking via a minimal JS layout pass

## What landed

### M2 — pure-CSS responsive display

- Container CSS: `@media (max-width: 60rem)` zeroes the gutter padding; selectors read `[side="left"]` directly off the attribute (no JS reflection)
- Shadow CSS: same media query switches the note to italic parenthetical inline display; `:host([inline])` does the same at any viewport
- Marker: dropped gratuitous `tabindex="0"` (was focusable for nothing in M1)
- Note aside: gained `role="doc-footnote"`
- Removed M1's `#applySide()`, `#applyInline()` and `data-number` reflection — CSS reads attributes directly

### M2.5 — collision-aware stacking via JS layout enhancement

- New `src/layout.ts` — module-level `WeakMap<HTMLElement, ContainerLayout>` keyed by `.has-sidenotes` container
- Per-container layout manager owns one `ResizeObserver` and one `requestAnimationFrame`-batched layout pass shared across all notes in the container
- Layout algorithm reads marker rects relative to container, computes `actualTop = max(idealTop, previousBottom + 8)` per side, applies via `style.top`
- Skip-and-clear: reads `getComputedStyle(note).position` — if not `absolute` (narrow inline mode or `[inline]`), clears any stale `style.top` and skips. Keeps JS breakpoint-agnostic
- Graceful degradation: if `ResizeObserver` is undefined or no `.has-sidenotes` ancestor, `registerNote` returns a no-op. Content fully accessible without JS

### Playwright real-browser tests

- `playwright.config.ts` — Chromium, Firefox, WebKit; webServer runs `vite --config vite.site.config.ts` on port 5180
- `e2e/sidenote.spec.ts` — 5 specs targeting the demo site:
  - Stacking: colliding right-margin notes don't overlap
  - Anchor preserved when no collision (first note close to its marker)
  - `[inline]` notes are skipped by JS (no inline `style.top`)
  - Narrow viewport clears `style.top` (CSS inline mode takes over)
  - Resize wide → narrow → wide: tops cleared, then re-applied
- 5 specs × 3 browsers = 15 test cases

### Demo site fix

- The script tag `<script src="../src/index.ts">` in `site/index.html` was broken in Vite dev mode (browser normalized `..` away, Vite served HTML 404 fallback in place of the JS module — silently breaking the dev demo since the site was added)
- Fix: tiny entry file `site/main.ts` with `import "../src/index";` and updated script tag to `./main.ts`. Both dev and build now work

### Documentation

- README: v0.2 features section updated, M3 roadmap trimmed
- CLAUDE.md: test split mentions Playwright as shipping
- This file

## Files modified

- `src/side-note.ts` — CSS overhaul, role changes, register/unregister wiring
- `src/layout.ts` (new) — ContainerLayout + registerNote
- `test/side-note.test.ts` — new Vitest specs for layout registration lifecycle
- `playwright.config.ts` (new)
- `e2e/sidenote.spec.ts` (new)
- `site/main.ts` (new) — Vite dev entry shim
- `site/index.html` — updated script tag, added responsive/inline example paragraph
- `package.json` — `@playwright/test` devDep, `test:e2e` + `test:e2e:install` scripts
- `.gitignore` — Playwright outputs
- `README.md`, `CLAUDE.md`

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm test` — 16 Vitest specs pass
- [x] `npm run test:e2e` — 15 Playwright cases pass on Chromium, Firefox, WebKit
- [x] `npm run build` — ESM, UMD, types
- [x] `npm run build:site` — demo builds
- [ ] **User-run smoke test:** `npm run dev` and confirm:
  - Wide viewport: paragraph with three close-together notes now stacks cleanly with no overlap
  - Single notes still anchor near their markers (no unnecessary drift)
  - Narrow viewport: notes inline as italic parentheticals
  - `<side-note inline>` example: always inline regardless of viewport

## Out of scope (deferred to milestone 3)

- Fallback positioning when no `.has-sidenotes` container exists (currently `registerNote` no-ops)
- `@media print` endnote stylesheet
- `MutationObserver` for content edits that don't change container size
- CI workflow that runs Vitest + Playwright on PRs
- Scroll-following / sticky behaviour
