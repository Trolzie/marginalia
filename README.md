# `<side-note>`

A custom HTML element for Tufte-style sidenotes — write notes inline in your prose, and they render in the page margin alongside the paragraph that anchors them. Framework-agnostic, zero runtime dependencies.

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

## Status

**v0.1 — milestone 1 of 4.** Wide-viewport margin display only. Popover behaviour on narrow viewports, collision detection between adjacent notes, and a print-mode endnote stylesheet all land in subsequent milestones — see [Roadmap](#roadmap).

## Install

```sh
npm i side-note
# or
pnpm add side-note
# or
bun add side-note
```

Or load it from a CDN with no build step:

```html
<script type="module" src="https://unpkg.com/side-note"></script>
```

Either way, importing the module registers `<side-note>` as a custom element on the page.

## Quickstart

1. Wrap any prose container in `class="has-sidenotes"`.
2. Drop `<side-note>` inline wherever you want a note.

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

## Known limitations (v0.1)

- **No collision detection.** Two notes anchored close together vertically may overlap. Fixed in milestone 3.
- **No popover on narrow viewports.** At small widths, notes overflow the viewport. Fixed in milestone 2.
- **No print stylesheet.** Margin notes don't reflow to bottom-of-page endnotes when printed. Fixed in milestone 3.

## Roadmap

1. ✅ **Milestone 1** — bare element, shadow DOM, attributes, CSS-counter numbering, wide-viewport margin display.
2. **Milestone 2** — responsive popover mode using the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), `matchMedia` breakpoint switching, full ARIA wiring, Playwright tests.
3. **Milestone 3** — collision detection, fallback positioning when no `.has-sidenotes` container exists, `@media print` endnote stylesheet, `MutationObserver` for dynamic content.
4. **Milestone 4** — documentation site, integration recipes for Eleventy / Astro / Hugo.

## License

[MIT](./LICENSE) © Troels Lauritz Reese Christensen

## Contributing

Issues and PRs welcome. See [`CLAUDE.md`](./CLAUDE.md) for project conventions (TypeScript strict, zero runtime deps, no copyleft licenses).
