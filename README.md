# `<side-note>`

A custom HTML element for sidenotes: write notes inline in your prose, and they render in the page margin alongside the paragraph that anchors them — the convention popularised by Edward Tufte and revived by [Tufte CSS](https://edwardtufte.github.io/tufte-css/). One tag, no framework, no runtime dependencies.

**Live demo:** [trolzie.github.io/marginalia](https://trolzie.github.io/marginalia/)

```html
<article class="has-sidenotes">
  <p>
    The marginalia tradition predates the printing press
    <side-note>
      The earliest known examples appear in 8th-century Irish gospel books,
      with both scribal corrections and devotional commentary in the margins.
    </side-note>
    by several centuries.
  </p>
</article>
```

What that renders as (at wide viewports):

```
┌──────────────────────────────────────────┬──────────────────────┐
│ The marginalia tradition predates the    │  ¹  The earliest     │
│ printing press¹ by several centuries…    │     known examples   │
│                                          │     appear in 8th-   │
│ Tufte's Visual Display² revived          │     century Irish…   │
│ sidenotes for a new generation of        │                      │
│ designers and writers…                   │  ²  Edward Tufte,    │
│                                          │     The Visual…      │
└──────────────────────────────────────────┴──────────────────────┘
        content column                            margin column
```

## Why?

- **Hand-coded HTML + CSS** (Tufte CSS et al.) works, but every note needs the same triple of `<label>` + `<input>` + `<span>` plus a stylesheet you maintain. Easy to typo.
- **JS libraries** usually need a framework, a build step, or both. Few are zero-deps; fewer drop into a hand-coded HTML page.
- **`<details>` / `<dialog>`** are designed for disclosure, not marginalia. The visual model is wrong.

`<side-note>` is one tag, no setup beyond a wrapper class, zero runtime deps, framework-free. Works in any HTML page, with or without a build step.

## What's in v0.3.0

All four roadmap milestones are complete. Working today:

- Inline authoring (`<side-note>` anywhere in flow content)
- Auto-incremented numbering, with `label` override
- `side="left"` / `"right"` (logical sides — `dir="rtl"` flips automatically)
- **Wide viewport (> 60rem): notes display in the margin** (when wrapped in `.has-sidenotes`)
- **Narrow viewport (≤ 60rem): notes flow inline as italic parentheticals — pure CSS, no JavaScript needed**
- **Drop-in without the wrapper class**: a `<side-note>` outside any `.has-sidenotes` ancestor renders as an inline italic parenthetical with no number — zero setup required
- **Print stylesheet**: under `@media print`, notes flow inline at full opacity, gutter padding collapses, max-width is lifted
- **Collision-aware stacking at wide viewports**: when two markers sit close together, the second note stacks below the first instead of overlapping. Pure presentation; if JavaScript fails to load, notes fall back to anchor-only positioning and content stays fully accessible
- **`inline` attribute to force inline display at any viewport**
- Shadow-DOM encapsulation with `::part(marker)` / `::part(note)` for theming
- Generated IDs and DPUB-ARIA wiring (`role="doc-noteref"` on marker, `role="doc-footnote"` on note, `aria-describedby` linking them)
- Hover and `:focus-within` cue that links marker ↔ note bidirectionally
- [Integration recipes](./recipes) for plain HTML, Eleventy, Astro, and Hugo
- CI runs typecheck, lint, Vitest, and Playwright (Chromium/Firefox/WebKit) on every PR; tagged pushes auto-publish to npm with provenance

## Install

```sh
npm i side-note     # or: pnpm add side-note  /  bun add side-note
```

Or, with no build step, from a CDN:

```html
<script type="module" src="https://unpkg.com/side-note"></script>
```

### From source (for contributors)

```sh
git clone https://github.com/Trolzie/marginalia.git
cd marginalia
npm install
npm run build
```

Then drop `dist/index.js` into your project and load it:

```html
<script type="module" src="./path/to/index.js"></script>
```

## Quickstart

1. Drop `<side-note>` inline wherever you want a note.
2. *(Optional)* For Tufte-style margin display at wide viewports, wrap the prose container in `class="has-sidenotes"`. Without the wrapper, notes render inline as italic parentheticals.

```html
<!doctype html>
<html>
  <head>
    <script type="module" src="https://unpkg.com/side-note"></script>
  </head>
  <body>
    <article class="has-sidenotes">
      <p>
        Some prose here
        <side-note>And a note in the margin.</side-note>
        continues on.
      </p>
    </article>
  </body>
</html>
```

For framework-specific setup, see [Integration recipes](#integration-recipes).

## Integration recipes

Setup notes for the most common stacks live in [`recipes/`](./recipes):

- [Plain HTML](./recipes/plain-html.md) — drop-in via CDN, no build step
- [Eleventy](./recipes/eleventy.md) — passthrough copy + base layout, optional paired shortcode
- [Astro](./recipes/astro.md) — `import "side-note"` in a base layout
- [Hugo](./recipes/hugo.md) — vendored bundle + optional shortcode

## Attributes

| Attribute | Values | Default | Description |
|---|---|---|---|
| `side` | `"right"` \| `"left"` | `"right"` | Which margin the note floats into. Treated as logical sides — `dir="rtl"` flips automatically. |
| `label` | any string | — | Overrides the auto-incremented number. Use for `*`, `†`, or to reuse a number across two related notes. |
| `id` | any string | auto-generated | Standard. If absent, a stable id is generated so `aria-describedby` always resolves. |
| `inline` | boolean | — | When present, the note always renders inline (as an italic parenthetical) regardless of viewport width. |

## CSS custom properties

Set on the host or any ancestor.

| Property | Default | Purpose |
|---|---|---|
| `--side-note-color` | `currentColor` | Marker and note text color |
| `--side-note-marker-size` | `0.75em` | Superscript marker scale |
| `--side-note-width` | `14rem` | Width of the margin column |
| `--side-note-gap` | `2rem` | Gap between content and notes |
| `--side-note-font` | `inherit` | Font for note bodies (smaller faces work well) |
| `--side-note-label` | unset | Programmatic override of marker text |
| `--side-note-hover-color` | `currentColor` | Marker color on hover (and on focus, if a consumer makes the marker focusable) |
| `--side-note-hover-bg` | `color-mix(in srgb, currentColor 6%, transparent)` | Note background tint on hover |
| `--side-note-hover-weight` | `600` | Marker font-weight on hover |

Authors who want deeper styling can target the shadow parts:

```css
side-note::part(marker) { /* style the inline marker */ }
side-note::part(note)   { /* style the margin note */ }
```

## Browser support

Works in modern evergreen browsers. The minimum versions are bounded by the `:has()` selector in the container stylesheet:

| Browser        | Minimum version    | Released   |
|---|---|---|
| Chrome / Edge  | 105                | Sep 2022   |
| Safari         | 15.4               | Mar 2022   |
| Firefox        | 121                | Dec 2023   |

No legacy / Internet Explorer support — web components and `:has()` are out of reach there.

## Roadmap

1. ✅ **Milestone 1** — bare element, shadow DOM, attributes, CSS-counter numbering, wide-viewport margin display.
2. ✅ **Milestone 2** — responsive inline display on narrow viewports (notes flow inline as italic parentheticals after their markers), `inline` attribute for force-inline, sharper DPUB-ARIA semantics, collision-aware stacking at wide viewports via a minimal `ResizeObserver`-driven layout pass. Playwright tests cover real-browser layout.
3. ✅ **Milestone 3** — drop-in fallback when no `.has-sidenotes` ancestor is present (notes render as inline italic parentheticals), `@media print` stylesheet, CI workflow running typecheck/lint/Vitest/Playwright on every PR.
4. ✅ **Milestone 4** — npm publish at v0.3.0 (with provenance), integration recipes for plain HTML / Eleventy / Astro / Hugo, [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE) © Troels Lauritz Reese Christensen

## Acknowledgments

Inspired by [Tufte CSS](https://edwardtufte.github.io/tufte-css/) and Edward Tufte's work on the marginalia tradition. The narrow-viewport inline-parenthetical treatment follows the convention Tufte CSS established.

## Contributing

Issues and PRs welcome. See [`CLAUDE.md`](./CLAUDE.md) for project conventions (TypeScript strict, zero runtime deps, no copyleft licenses).
