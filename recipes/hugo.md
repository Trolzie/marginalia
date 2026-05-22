# Hugo

[Hugo](https://gohugo.io/) is a Go-based static site generator. It has no Node integration, so the bundle is vendored into your site's `static/` directory.

## Install (vendored)

Pull the bundle from npm or unpkg:

```sh
mkdir -p static/js
curl -L -o static/js/side-note.js https://unpkg.com/side-note
```

Alternatively, `npm i side-note` and copy `node_modules/side-note/dist/index.js` to `static/js/side-note.js`.

## Reference in your head partial

In `layouts/partials/head.html` (or wherever your `<head>` lives):

```html
<head>
  <meta charset="utf-8">
  <title>{{ .Title }}</title>
  <script type="module" src="/js/side-note.js"></script>
</head>
```

And wrap your prose in `<article class="has-sidenotes">`. For example, in `layouts/_default/single.html`:

```html
{{ define "main" }}
<article class="has-sidenotes">
  {{ .Content }}
</article>
{{ end }}
```

## Use in content

Hugo's default Markdown parser (Goldmark) allows raw HTML, so writing `<side-note>` directly in `.md` files works:

```md
The marginalia tradition predates the printing press <side-note>The earliest known examples appear in 8th-century Irish gospel books.</side-note> by several centuries.
```

## Optional shortcode (cleaner Markdown)

Create `layouts/shortcodes/sidenote.html`:

```html
<side-note{{ with .Get "side" }} side="{{ . }}"{{ end }}{{ with .Get "label" }} label="{{ . }}"{{ end }}>{{ .Inner | markdownify }}</side-note>
```

Then in any `.md` post:

```md
The marginalia tradition predates the printing press {{< sidenote >}}The earliest known examples appear in 8th-century Irish gospel books.{{< /sidenote >}} by several centuries.
```

You can pass `side` or `label`:

```md
{{< sidenote side="left" label="*" >}}A marginal aside.{{< /sidenote >}}
```

`markdownify` lets you write Markdown inside the shortcode body — `<em>` and `<a>` in your notes survive the round-trip.

## See also

- [Full API reference](../README.md#attributes)
- [Hugo shortcodes docs](https://gohugo.io/content-management/shortcodes/)
