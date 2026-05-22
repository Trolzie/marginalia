import { registerNote } from "./layout";

const CONTAINER_STYLESHEET_ID = "side-note-container-styles";

const CONTAINER_CSS = `
.has-sidenotes {
  position: relative;
  max-width: 40rem;
  margin-inline: auto;
  counter-reset: sidenote;
  padding-inline-end: calc(var(--side-note-width, 14rem) + var(--side-note-gap, 2rem));
}
.has-sidenotes:has(side-note[side="left"]) {
  padding-inline-start: calc(var(--side-note-width, 14rem) + var(--side-note-gap, 2rem));
}
.has-sidenotes side-note {
  counter-increment: sidenote;
}
@media (max-width: 60rem) {
  .has-sidenotes,
  .has-sidenotes:has(side-note[side="left"]) {
    padding-inline-end: 0;
    padding-inline-start: 0;
  }
}
@media print {
  .has-sidenotes,
  .has-sidenotes:has(side-note[side="left"]) {
    padding-inline-end: 0;
    padding-inline-start: 0;
    max-width: none;
  }
}
`;

const SHADOW_HTML = `
<style>
  :host {
    display: inline;
    font: inherit;
    color: var(--side-note-color, currentColor);
  }
  .marker {
    font-size: var(--side-note-marker-size, 0.75em);
    vertical-align: super;
    line-height: 1;
  }
  .marker::before {
    content: var(--side-note-label, counter(sidenote));
  }
  .note {
    position: absolute;
    inset-inline-end: 0;
    width: var(--side-note-width, 14rem);
    font: var(--side-note-font, inherit);
    font-size: 0.85em;
    line-height: 1.4;
    margin: 0;
  }
  :host([side="left"]) .note {
    inset-inline-end: auto;
    inset-inline-start: 0;
  }
  .note::before {
    content: var(--side-note-label, counter(sidenote)) ". ";
    font-weight: 600;
    margin-inline-end: 0.25em;
  }
  @media (max-width: 60rem) {
    .note {
      position: static;
      display: inline;
      width: auto;
      font-size: 0.92em;
      font-style: italic;
      opacity: 0.75;
    }
    .note::before {
      content: " (";
      font-weight: normal;
      margin-inline-end: 0;
    }
    .note::after {
      content: ")";
    }
    :host(:hover) .note,
    :host(:focus-within) .note {
      opacity: 1;
    }
  }
  :host([inline]) .note,
  :host([data-no-container]) .note {
    position: static;
    display: inline;
    width: auto;
    font-size: 0.92em;
    font-style: italic;
    opacity: 0.75;
  }
  :host([inline]) .note::before,
  :host([data-no-container]) .note::before {
    content: " (";
    font-weight: normal;
    margin-inline-end: 0;
  }
  :host([inline]) .note::after,
  :host([data-no-container]) .note::after {
    content: ")";
  }
  :host([data-no-container]) .marker::before {
    content: var(--side-note-label, "");
  }
  @media print {
    .note {
      position: static;
      display: inline;
      width: auto;
      font-size: 0.92em;
      font-style: italic;
      opacity: 1;
    }
    .note::before {
      content: " (";
      font-weight: normal;
      margin-inline-end: 0;
    }
    .note::after {
      content: ")";
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    .marker {
      transition: color 120ms ease, font-weight 120ms ease;
    }
    .note {
      transition: background 120ms ease, opacity 120ms ease;
    }
  }
  :host(:hover) .marker,
  :host(:focus-within) .marker {
    color: var(--side-note-hover-color, currentColor);
    font-weight: var(--side-note-hover-weight, 600);
  }
  :host(:hover) .note,
  :host(:focus-within) .note {
    background: var(--side-note-hover-bg, color-mix(in srgb, currentColor 6%, transparent));
    border-radius: 3px;
  }
  :host([inline]:hover) .note,
  :host([inline]:focus-within) .note,
  :host([data-no-container]:hover) .note,
  :host([data-no-container]:focus-within) .note {
    opacity: 1;
  }
</style>
<span class="marker" part="marker" role="doc-noteref"></span>
<aside class="note" part="note" role="doc-footnote">
  <slot></slot>
</aside>
`;

let fallbackIdCounter = 0;

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `side-note-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `side-note-${++fallbackIdCounter}`;
}

function ensureContainerStylesheet(doc: Document): void {
  if (doc.getElementById(CONTAINER_STYLESHEET_ID)) return;
  const style = doc.createElement("style");
  style.id = CONTAINER_STYLESHEET_ID;
  style.textContent = CONTAINER_CSS;
  doc.head.appendChild(style);
}

function escapeForCssString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export class SideNote extends HTMLElement {
  static readonly observedAttributes = ["label"] as const;

  readonly #marker: HTMLSpanElement;
  readonly #note: HTMLElement;
  #unregister?: () => void;

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = SHADOW_HTML;
    this.#marker = root.querySelector(".marker") as HTMLSpanElement;
    this.#note = root.querySelector(".note") as HTMLElement;
  }

  connectedCallback(): void {
    ensureContainerStylesheet(this.ownerDocument);

    if (!this.id) {
      this.id = generateId();
    }
    const noteId = `${this.id}-note`;
    this.#note.id = noteId;
    this.#marker.setAttribute("aria-describedby", noteId);

    if (this.closest(".has-sidenotes")) {
      this.removeAttribute("data-no-container");
    } else {
      this.setAttribute("data-no-container", "");
    }

    this.#applyLabel();
    this.#unregister = registerNote(this, this.#marker, this.#note);
  }

  disconnectedCallback(): void {
    this.#unregister?.();
    this.#unregister = undefined;
  }

  attributeChangedCallback(name: string): void {
    if (!this.isConnected) return;
    if (name === "label") this.#applyLabel();
  }

  #applyLabel(): void {
    const label = this.getAttribute("label");
    if (label != null && label !== "") {
      this.style.setProperty(
        "--side-note-label",
        `"${escapeForCssString(label)}"`,
      );
    } else {
      this.style.removeProperty("--side-note-label");
    }
  }
}
