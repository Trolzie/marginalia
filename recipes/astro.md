# Astro

[Astro](https://astro.build/) bundles custom elements automatically. Integration is a single side-effect import in your base layout.

## Install

```sh
npm i side-note
```

## Import in your base layout

```astro
---
// src/layouts/BaseLayout.astro
import "side-note";

const { title } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
  </head>
  <body>
    <article class="has-sidenotes">
      <slot />
    </article>
  </body>
</html>
```

The `import "side-note"` line is a side-effect import — it executes the module, which calls `customElements.define("side-note", ...)`. Astro bundles the result into the client JS for any page using this layout. No named exports needed.

## Use in `.astro` pages

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout title="My post">
  <p>
    The marginalia tradition predates the printing press
    <side-note>
      The earliest known examples appear in 8th-century Irish gospel books.
    </side-note>
    by several centuries.
  </p>
</BaseLayout>
```

## Use in `.md` / `.mdx` pages

In `.md` files, inline HTML works:

```md
---
layout: ../layouts/BaseLayout.astro
title: My post
---

The marginalia tradition predates the printing press <side-note>The earliest known examples appear in 8th-century Irish gospel books.</side-note> by several centuries.
```

For `.mdx`, use the tag directly the same way.

## Notes

- No `<SideNote>` Astro component wrapper is required. The package registers `<side-note>` as a native browser-level custom element.
- Astro server-renders the markup as static HTML; the custom element's shadow DOM and collision-detection JS hydrate in the browser.
- If you only need the component on some pages, import it inside those pages' frontmatter instead of the global layout.

## See also

- [Full API reference](../README.md#attributes)
- [Astro client directives](https://docs.astro.build/en/reference/directives-reference/#client-directives) — usually not needed; this component self-registers
