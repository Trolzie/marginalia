interface LayoutEntry {
  host: HTMLElement;
  marker: HTMLElement;
  note: HTMLElement;
}

const containerLayouts = new WeakMap<HTMLElement, ContainerLayout>();

const GAP_PX = 8;

export function registerNote(
  host: HTMLElement,
  marker: HTMLElement,
  note: HTMLElement,
): () => void {
  if (typeof ResizeObserver === "undefined") {
    return () => {};
  }
  const container = host.closest<HTMLElement>(".has-sidenotes");
  if (!container) {
    return () => {};
  }
  let layout = containerLayouts.get(container);
  if (!layout) {
    layout = new ContainerLayout(container);
    containerLayouts.set(container, layout);
  }
  const entry: LayoutEntry = { host, marker, note };
  layout.add(entry);
  const ownLayout = layout;
  return () => ownLayout.remove(entry);
}

class ContainerLayout {
  readonly #container: HTMLElement;
  readonly #entries: Set<LayoutEntry> = new Set();
  readonly #resizeObserver: ResizeObserver;
  #rafHandle: number | null = null;

  constructor(container: HTMLElement) {
    this.#container = container;
    this.#resizeObserver = new ResizeObserver(() => this.schedule());
    this.#resizeObserver.observe(container);
    const doc = container.ownerDocument;
    if (doc?.fonts?.ready) {
      doc.fonts.ready.then(() => this.schedule()).catch(() => {});
    }
  }

  add(entry: LayoutEntry): void {
    this.#entries.add(entry);
    this.schedule();
  }

  remove(entry: LayoutEntry): void {
    this.#entries.delete(entry);
    if (this.#entries.size === 0) {
      this.#resizeObserver.disconnect();
      if (this.#rafHandle !== null && typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(this.#rafHandle);
      }
      this.#rafHandle = null;
      containerLayouts.delete(this.#container);
    } else {
      this.schedule();
    }
  }

  schedule(): void {
    if (this.#rafHandle !== null) return;
    if (typeof requestAnimationFrame === "undefined") {
      this.#layout();
      return;
    }
    this.#rafHandle = requestAnimationFrame(() => {
      this.#rafHandle = null;
      this.#layout();
    });
  }

  #layout(): void {
    const sorted = Array.from(this.#entries).sort((a, b) => {
      const cmp = a.host.compareDocumentPosition(b.host);
      if (cmp & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (cmp & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    const rightEntries: LayoutEntry[] = [];
    const leftEntries: LayoutEntry[] = [];
    for (const entry of sorted) {
      if (entry.host.getAttribute("side") === "left") leftEntries.push(entry);
      else rightEntries.push(entry);
    }

    const containerRect = this.#container.getBoundingClientRect();
    this.#stack(rightEntries, containerRect);
    this.#stack(leftEntries, containerRect);
  }

  #stack(entries: LayoutEntry[], containerRect: DOMRect): void {
    let previousBottom = 0;
    for (const entry of entries) {
      const position = getComputedStyle(entry.note).position;
      if (position !== "absolute") {
        entry.note.style.top = "";
        continue;
      }
      const markerRect = entry.marker.getBoundingClientRect();
      const idealTop = markerRect.top - containerRect.top;
      const actualTop = Math.max(idealTop, previousBottom + GAP_PX);
      entry.note.style.top = `${actualTop}px`;
      const noteRect = entry.note.getBoundingClientRect();
      previousBottom = actualTop + noteRect.height;
    }
  }
}

export const __testing = {
  containerLayouts,
};
