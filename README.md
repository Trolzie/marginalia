# `<side-note>`

A custom HTML element for sidenotes: write notes inline in your prose, and they render in the page margin alongside the paragraph that anchors them — the convention popularised by Edward Tufte and revived by [Tufte CSS](https://edwardtufte.github.io/tufte-css/). One tag, no framework, no runtime dependencies.

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

## What's in v0.1

Milestone 1 of 4 — the bare element with wide-viewport margin display. Working today:

- Inline authoring (`<side-note>` anywhere in flow content)
- Auto-incremented numbering, with `label` override
- `side="left"` / `"right"` (logical sides — `dir="rtl"` flips automatically)
- Shadow-DOM encapsulation with `::part(marker)` / `::part(note)` for theming
- Generated IDs and ARIA wiring (`role="doc-noteref"`, `aria-describedby`)

Not yet — landing in later milestones (see [Roadmap](#roadmap)):

- Popover mode on narrow viewports (milestone 2)
- Collision detection between vertically-adjacent notes (milestone 3)
- Print-mode endnote stylesheet (milestone 3)

## Install

> **Not yet published to npm.** The package name is reserved but unpublished pending milestone-1 review. Use the from-source path below until v0.1.0 lands.

### From source (works today)

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

### From npm (once v0.1.0 ships)

```sh
npm i side-note     # or: pnpm add side-note  /  bun add side-note
```

Or from a CDN with no build step:

```html
<script type="module" src="https://unpkg.com/side-note"></script>
```

## Quickstart

1. Wrap any prose container in `class="has-sidenotes"`.
2. Drop `<side-note>` inline wherever you want a note.

```html
<!doctype html>
<html>
  <head>
    <script type="module" src="./path/to/index.js"></script>
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

## Attributes

| Attribute | Values | Default | Description |
|---|---|---|---|
| `side` | `"right"` \| `"left"` | `"right"` | Which margin the note floats into. Treated as logical sides — `dir="rtl"` flips automatically. |
| `label` | any string | — | Overrides the auto-incremented number. Use for `*`, `†`, or to reuse a number across two related notes. |
| `id` | any string | auto-generated | Standard. If absent, a stable id is generated so `aria-describedby` always resolves. |
| `inline` | boolean | — | Reserved for milestone 2 (force popover behaviour). No-op in v0.1. |

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
2. **Milestone 2** — responsive popover mode using the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), `matchMedia` breakpoint switching, full ARIA wiring, Playwright tests.
3. **Milestone 3** — collision detection, fallback positioning when no `.has-sidenotes` container exists, `@media print` endnote stylesheet, `MutationObserver` for dynamic content.
4. **Milestone 4** — documentation site, integration recipes for Eleventy / Astro / Hugo.

## License

[MIT](./LICENSE) © Troels Lauritz Reese Christensen

## Acknowledgments

Inspired by [Tufte CSS](https://edwardtufte.github.io/tufte-css/) and Edward Tufte's work on the marginalia tradition. The native [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) and CSS Anchor Positioning landing in browsers makes milestones 2 and 3 easier than they would have been a year ago.

## Contributing

Issues and PRs welcome. See [`CLAUDE.md`](./CLAUDE.md) for project conventions (TypeScript strict, zero runtime deps, no copyleft licenses).
