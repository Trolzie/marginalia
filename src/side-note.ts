const CONTAINER_STYLESHEET_ID = "side-note-container-styles";

const CONTAINER_CSS = `
.has-sidenotes {
  position: relative;
  max-width: 40rem;
  margin-inline: auto;
  padding-inline-end: calc(var(--side-note-width, 14rem) + var(--side-note-gap, 2rem));
  counter-reset: sidenote;
}
.has-sidenotes:has(side-note[data-side="left"]) {
  padding-inline-start: calc(var(--side-note-width, 14rem) + var(--side-note-gap, 2rem));
}
.has-sidenotes side-note {
  counter-increment: sidenote;
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
    cursor: default;
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
  :host([data-side="left"]) .note {
    inset-inline-end: auto;
    inset-inline-start: 0;
  }
  .note::before {
    content: var(--side-note-label, counter(sidenote)) ". ";
    font-weight: 600;
    margin-inline-end: 0.25em;
  }
</style>
<span class="marker" part="marker" role="doc-noteref" tabindex="0"></span>
<aside class="note" part="note">
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
  static readonly observedAttributes = ["side", "label", "inline"] as const;

  readonly #marker: HTMLSpanElement;
  readonly #note: HTMLElement;

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

    const container = this.closest(".has-sidenotes") ?? this.ownerDocument.body;
    const siblings = Array.from(container.querySelectorAll("side-note"));
    const index = siblings.indexOf(this) + 1;
    this.dataset.number = String(index);

    this.#applySide();
    this.#applyLabel();
    this.#applyInline();
  }

  attributeChangedCallback(name: string): void {
    if (!this.isConnected) return;
    if (name === "side") this.#applySide();
    else if (name === "label") this.#applyLabel();
    else if (name === "inline") this.#applyInline();
  }

  #applySide(): void {
    const side = this.getAttribute("side");
    this.dataset.side = side === "left" ? "left" : "right";
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

  #applyInline(): void {
    if (this.hasAttribute("inline")) {
      this.dataset.inline = "";
    } else {
      delete this.dataset.inline;
    }
  }
}
