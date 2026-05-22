# Plain HTML

The simplest path: a single `<script>` tag from a CDN.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My page</title>
    <script type="module" src="https://unpkg.com/side-note"></script>
  </head>
  <body>
    <article class="has-sidenotes">
      <p>
        The marginalia tradition predates the printing press
        <side-note>
          The earliest known examples appear in 8th-century Irish gospel
          books, with scribal corrections and devotional commentary.
        </side-note>
        by several centuries.
      </p>
    </article>
  </body>
</html>
```

That's it. The element registers itself on import — no setup code, no event listeners, no framework.

## What's happening

- The CDN URL `https://unpkg.com/side-note` resolves to the package's ESM bundle, served with `Content-Type: application/javascript` and a `Cache-Control` header suitable for production use. jsDelivr works too: `https://cdn.jsdelivr.net/npm/side-note`.
- The wrapping `class="has-sidenotes"` tells the component "this container can host margin notes" at wide viewports. Without the class, notes still render — as inline italic parentheticals — so the component works in any HTML page.
- At viewport widths > 60rem (≈ 960px), notes float into a right-margin gutter. At narrower widths, they flow inline as parentheticals. Print is treated as inline.

## Pinning a version

Unpkg supports semver in the URL:

```html
<script type="module" src="https://unpkg.com/side-note@0.3"></script>
```

Pin to a major or minor range for stability across browser refreshes.

## Self-hosted (no CDN)

Install locally:

```sh
npm i side-note
```

Then reference the bundle from your site:

```html
<script type="module" src="/node_modules/side-note/dist/index.js"></script>
```

Or copy `node_modules/side-note/dist/index.js` to your static assets folder.

## See also

- [Full API reference](../README.md#attributes) — attributes, CSS custom properties, browser support
- [Live demo](https://trolzie.github.io/marginalia/)
