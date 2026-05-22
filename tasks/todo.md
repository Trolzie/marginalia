# v0.3.0 — milestone 4 (recipes, npm publish, CHANGELOG)

The final M4 bundle. No source/behaviour changes — entirely docs and distribution.

## What landed

### CHANGELOG.md (new)
Keep-a-Changelog format with entries for v0.1.0, v0.2.0, v0.2.1, v0.3.0. Each entry has Added/Changed/Fixed sections as relevant. This is now the canonical record for what shipped when.

### Package version bumped to 0.3.0
`package.json` was still at 0.1.0 — the milestone label in docs had drifted ahead of the package version. Now aligned. The next `npm publish` ships as 0.3.0.

### Integration recipes (4 new Markdown files)
- `recipes/plain-html.md` — CDN drop-in, version pinning, self-hosted alternative
- `recipes/eleventy.md` — passthrough copy + base layout, optional paired shortcode
- `recipes/astro.md` — side-effect `import "side-note"` in a layout, works in `.astro` and `.md`
- `recipes/hugo.md` — vendored bundle in `static/`, optional `{{< sidenote >}}` shortcode

Each recipe is ≈ 30–80 lines: install + reference + usage example + framework-specific gotchas, with a link back to the README for full API reference. Cross-linked from a new "Integration recipes" section in the README between Quickstart and Attributes.

### Tag-triggered publish workflow
`.github/workflows/publish.yml` runs on any tag matching `v*`. Sequence: checkout, Node 22 setup with npm registry, `npm ci`, typecheck, lint, Vitest, build, `npm publish --provenance --access public`. Uses `NODE_AUTH_TOKEN` from a `NPM_TOKEN` repo secret. `--provenance` adds attestation pointing back to the GitHub Action that built it (signs the published bundle).

### README rewrites
- **Install section**: drops the "Not yet published" disclaimer. Promotes npm + CDN to primary; from-source is a "for contributors" section.
- **Quickstart**: code example now uses the CDN script tag (was a `./path/to/index.js` placeholder).
- **New "Integration recipes" section** between Quickstart and Attributes.
- **What's in v0.3** → **What's in v0.3.0**, with recipes added to the feature list and the "Not yet — landing in the next milestone" footnote removed since the roadmap is complete.
- **Roadmap**: M4 marked ✅.

### Other small updates
- `CLAUDE.md` — reflects that all four milestones are complete
- `site/index.html` footer — `v0.3, milestone 3 of 4` → `v0.3.0`

## User action required (one-time)
Publishing requires npm credentials, which the workflow can't fabricate. Two options:

**Option A (manual, simplest):**
```sh
git tag v0.3.0
git push --tags
# Set up NPM_TOKEN in repo secrets first, OR
npm publish --access public  # locally, if logged in to npm
```

**Option B (workflow-driven, recommended for future):**
1. Generate a granular npm token at https://www.npmjs.com/settings/<user>/tokens (publish scope, `side-note` package)
2. Add it as `NPM_TOKEN` in repo secrets (Settings → Secrets → Actions)
3. `git tag v0.3.0 && git push --tags` — the workflow picks up the tag and publishes

After publish, verify at https://www.npmjs.com/package/side-note.

## Files modified
- `CHANGELOG.md` (new)
- `package.json` — version 0.1.0 → 0.3.0
- `recipes/plain-html.md`, `recipes/eleventy.md`, `recipes/astro.md`, `recipes/hugo.md` (new)
- `.github/workflows/publish.yml` (new)
- `README.md` — install/quickstart/recipes/roadmap/what's-in sections
- `CLAUDE.md` — milestone summary
- `site/index.html` — footer
- This file

## Verification
- [x] `npm run typecheck` / `lint` / `test` (19 specs) / `build` / `build:site`
- [ ] User-run: publish v0.3.0 to npm (see "User action required" above)
- [ ] After publish: `npm i side-note` in a throwaway project, confirm import + usage works
- [ ] Manual: open each recipe in GitHub's Markdown viewer, verify code fences and links

## Out of scope (deferred)
- Multi-page docs site (skipped — README + demo is enough for a one-component project)
- Recipes for React, Vue, Next.js, SvelteKit (open issue if requested)
- CONTRIBUTING.md (CLAUDE.md covers conventions already)
- Playground / live editor on the demo

# v0.3 — milestone 3 (fallback mode, print stylesheet, CI)

Three small adds plus a CI workflow. All consistent with the project's non-invasive principle.

## What landed

### Fallback mode (no `.has-sidenotes` container required)

`<side-note>` outside a `.has-sidenotes` ancestor now renders as an inline italic parenthetical instead of breaking silently. Detection happens in `connectedCallback` via `this.closest('.has-sidenotes')`; if no match, sets `data-no-container` attribute on host. Shadow CSS gains `:host([data-no-container])` selectors that mirror the inline-mode rules (`position: static`, `display: inline`, italic, opacity 0.75, parenthesis prefix/suffix). The marker's counter is suppressed via a `:host([data-no-container]) .marker::before { content: var(--side-note-label, "") }` rule — so authors who pass `label="*"` still see their label, but the default is no number (per user direction: "ok with no number"). `registerNote` already no-ops without a container so layout JS sits out cleanly.

### `@media print` stylesheet

Container CSS in print: gutter padding zeroed, max-width lifted, so prose uses the page width. Shadow CSS in print: notes render inline as parentheticals at full opacity (no italic dimming for print — paper reading deserves max legibility).

### CI workflow (`.github/workflows/test.yml`)

Runs on push to main and on PRs. Sequence: typecheck → lint → Vitest → Playwright (Chromium + Firefox + WebKit) → `npm run build` → `npm run build:site`. Caches npm and Playwright browsers between runs. Uploads the Playwright HTML report as an artifact on failure for debugging.

### Vitest specs added (3)

- Stray host (no `.has-sidenotes` ancestor) gets `data-no-container` set on connect
- Host wrapped in `.has-sidenotes` does *not* get the attribute
- Moving a stray host into `.has-sidenotes` (via re-append) clears the attribute on re-connect

### Playwright specs added (2)

- **Fallback mode**: insert a stray `<side-note>` into the demo page, verify `data-no-container` set, computed `position: static`, `display: inline`, no inline `style.top` written
- **Print emulation**: `page.emulateMedia({ media: 'print' })` → notes computed `position: static`, `display: inline`, `opacity ≈ 1`

## Files modified
- `src/side-note.ts` — `[data-no-container]` shadow CSS, fallback marker rule, `@media print` rules in both container CSS and shadow CSS, `connectedCallback` detection
- `test/side-note.test.ts` — 3 new fallback specs
- `e2e/sidenote.spec.ts` — 2 new describe blocks (fallback, print)
- `.github/workflows/test.yml` (new) — CI workflow
- `README.md` — v0.3 features section, M3 marked ✅ in roadmap, Quickstart updated to note wrapper is optional
- `CLAUDE.md` — milestone counter
- This file

## Decisions captured
- **Dropped `MutationObserver`** from the original M3 scope — real edits trigger `ResizeObserver` via line reflow; same-width word swaps don't shift markers; not worth the observer cost
- **CI bundled with M3** rather than held separately — improves PR safety for an open-source repo where external contributions matter
- **Fallback mode hides the counter** by default — user explicitly approved "no number"; labels still show if author provides one

## Verification
- [x] `npm run typecheck` / `lint` / `test` (19 specs) / `test:e2e` (21 cases × 3 browsers) / `build` / `build:site`
- [ ] User-run smoke test:
  - Drop a stray `<side-note>` in any page without `.has-sidenotes` → should render inline as italic parenthetical with no number
  - Print preview the demo (Cmd+P) → notes should appear inline as parentheticals at full opacity, gutter padding gone
  - CI: on next push or PR, the Test workflow should run and pass

## Out of scope (deferred to milestone 4)
- Documentation site
- Integration recipes for Eleventy / Astro / Hugo
- "Collected endnotes" treatment in print (single inline parenthetical is the v0.3 approach)
- Scroll-following / sticky behaviour
- `MutationObserver` for text edits without size change (dropped — over-engineering)

# v0.2.1 — hover / focus cue

Pure CSS, ~22 lines added to the shadow stylesheet. Bidirectional hover linking via `:host(:hover)` — pointer over marker or note (either side) highlights both. Margin mode: marker shifts colour + weight, note gets a subtle background tint with rounded corners. Inline mode (narrow viewport or `[inline]`): same marker shift; note opacity bumps from 0.75 → 1 so the hovered parenthetical pops out of the prose. Transitions gated by `@media (prefers-reduced-motion: no-preference)`. `:host(:focus-within)` mirrors `:host(:hover)` everywhere so keyboard users get the cue for free if any future milestone (or downstream consumer) makes the marker focusable.

Three new theming hooks: `--side-note-hover-color`, `--side-note-hover-bg`, `--side-note-hover-weight`. All have working defaults — no configuration needed.

## Files modified
- `src/side-note.ts` — appended hover/focus rules to shadow stylesheet
- `README.md` — three rows added to CSS custom properties table

## Verification
- [x] `npm run typecheck` / `lint` / `test` / `build` / `build:site`
- [ ] User-run smoke test: hover a marker → both marker bolds and note tints; hover a margin note → marker bolds; at narrow viewport, hover a parenthetical → opacity goes to full; toggle "Reduce motion" → state changes become instant

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
