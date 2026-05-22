# Eleventy

[Eleventy (11ty)](https://www.11ty.dev/) is a Node-based static site generator. The integration is two steps: copy the bundle into your output directory, then reference it from your base layout.

## Install

```sh
npm i side-note
```

## Pass through the bundle

In your Eleventy config, add a passthrough copy so the JS bundle ends up in `_site/js/`:

```js
// eleventy.config.js
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "node_modules/side-note/dist/index.js": "js/side-note.js",
  });
  // ...your other config
}
```

## Reference in a layout

In `_includes/layouts/base.njk` (or your equivalent):

```njk
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{ title }}</title>
    <script type="module" src="/js/side-note.js"></script>
  </head>
  <body>
    <article class="has-sidenotes">
      {{ content | safe }}
    </article>
  </body>
</html>
```

## Use in Markdown

Eleventy's default Markdown engine, `markdown-it`, allows inline HTML by default — so you can drop `<side-note>` straight into your `.md` files:

```md
---
layout: layouts/base.njk
title: My post
---

The marginalia tradition predates the printing press <side-note>The earliest known examples appear in 8th-century Irish gospel books.</side-note> by several centuries.
```

If you've disabled inline HTML (`html: false` in your markdown-it config), re-enable it for sidenotes to work, or restrict the change to a custom shortcode if you prefer.

## Optional shortcode (cleaner Markdown)

Define a paired shortcode in your config:

```js
eleventyConfig.addPairedShortcode("sidenote", function (content, side, label) {
  const attrs = [
    side ? `side="${side}"` : "",
    label ? `label="${label}"` : "",
  ].filter(Boolean).join(" ");
  return `<side-note ${attrs}>${content}</side-note>`;
});
```

Then use in `.md` files:

```md
The marginalia tradition predates the printing press {% sidenote %}The earliest known examples appear in 8th-century Irish gospel books.{% endsidenote %} by several centuries.
```

## See also

- [Full API reference](../README.md#attributes)
- [Eleventy passthrough copy docs](https://www.11ty.dev/docs/copy/)
- [Eleventy shortcodes docs](https://www.11ty.dev/docs/shortcodes/)
