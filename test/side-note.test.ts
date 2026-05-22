import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SideNote } from "../src/index";
import { __testing, registerNote } from "../src/layout";

function makeArticle(): HTMLElement {
  const article = document.createElement("article");
  article.className = "has-sidenotes";
  document.body.appendChild(article);
  return article;
}

function addNote(parent: HTMLElement, content = "note body"): SideNote {
  const note = document.createElement("side-note") as SideNote;
  note.textContent = content;
  parent.appendChild(note);
  return note;
}

describe("<side-note>", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    const stylesheet = document.getElementById("side-note-container-styles");
    if (stylesheet) stylesheet.remove();
  });

  it("registers the element on import", () => {
    expect(customElements.get("side-note")).toBe(SideNote);
  });

  it("attaches an open shadow root with marker and note parts", () => {
    const article = makeArticle();
    const note = addNote(article);

    expect(note.shadowRoot).not.toBeNull();
    const marker = note.shadowRoot!.querySelector("[part='marker']");
    const aside = note.shadowRoot!.querySelector("[part='note']");
    expect(marker).toBeInstanceOf(HTMLElement);
    expect(aside).toBeInstanceOf(HTMLElement);
  });

  it("injects the container stylesheet exactly once", () => {
    const article = makeArticle();
    addNote(article);
    addNote(article);
    addNote(article);

    const sheets = document.querySelectorAll("#side-note-container-styles");
    expect(sheets.length).toBe(1);
  });

  it("generates a side-note-prefixed id when none is set", () => {
    const article = makeArticle();
    const note = addNote(article);

    expect(note.id).toMatch(/^side-note-[a-z0-9-]+$/i);
  });

  it("preserves an author-supplied id", () => {
    const article = makeArticle();
    const note = document.createElement("side-note") as SideNote;
    note.id = "my-explicit-id";
    note.textContent = "x";
    article.appendChild(note);

    expect(note.id).toBe("my-explicit-id");
  });

  it("links marker aria-describedby to the inner aside id", () => {
    const article = makeArticle();
    const note = addNote(article);

    const marker = note.shadowRoot!.querySelector("[part='marker']")!;
    const aside = note.shadowRoot!.querySelector("[part='note']")!;
    expect(marker.getAttribute("aria-describedby")).toBe(aside.id);
    expect(aside.id).toBe(`${note.id}-note`);
  });

  it("gives the marker role=doc-noteref and leaves it non-focusable", () => {
    const article = makeArticle();
    const note = addNote(article);

    const marker = note.shadowRoot!.querySelector("[part='marker']")!;
    expect(marker.getAttribute("role")).toBe("doc-noteref");
    expect(marker.hasAttribute("tabindex")).toBe(false);
  });

  it("gives the note aside role=doc-footnote", () => {
    const article = makeArticle();
    const note = addNote(article);

    const aside = note.shadowRoot!.querySelector("[part='note']")!;
    expect(aside.getAttribute("role")).toBe("doc-footnote");
    expect(aside.tagName).toBe("ASIDE");
  });

  it("sets --side-note-label inline style when label attribute is present", () => {
    const article = makeArticle();
    const note = document.createElement("side-note") as SideNote;
    note.setAttribute("label", "*");
    note.textContent = "x";
    article.appendChild(note);

    expect(note.style.getPropertyValue("--side-note-label")).toBe('"*"');
  });

  it("clears --side-note-label when label attribute is removed", () => {
    const article = makeArticle();
    const note = document.createElement("side-note") as SideNote;
    note.setAttribute("label", "*");
    note.textContent = "x";
    article.appendChild(note);
    note.removeAttribute("label");

    expect(note.style.getPropertyValue("--side-note-label")).toBe("");
  });

  it("does not observe side or inline attributes (CSS handles them directly)", () => {
    expect(SideNote.observedAttributes).toEqual(["label"]);
  });
});

describe("collision layout", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    const stylesheet = document.getElementById("side-note-container-styles");
    if (stylesheet) stylesheet.remove();
  });

  it("creates exactly one ContainerLayout per .has-sidenotes container", () => {
    const article = makeArticle();
    addNote(article);
    addNote(article);
    addNote(article);

    expect(__testing.containerLayouts.has(article)).toBe(true);
  });

  it("removes the ContainerLayout from the registry when the last note disconnects", () => {
    const article = makeArticle();
    const a = addNote(article);
    const b = addNote(article);

    expect(__testing.containerLayouts.has(article)).toBe(true);
    a.remove();
    expect(__testing.containerLayouts.has(article)).toBe(true);
    b.remove();
    expect(__testing.containerLayouts.has(article)).toBe(false);
  });

  it("no-ops cleanly for a note outside any .has-sidenotes ancestor", () => {
    const stray = document.createElement("side-note") as SideNote;
    stray.textContent = "no container";
    expect(() => document.body.appendChild(stray)).not.toThrow();
    expect(__testing.containerLayouts.has(document.body)).toBe(false);
  });

  it("coalesces multiple notes connecting in the same frame into one rAF", () => {
    const rafSpy = vi.spyOn(globalThis, "requestAnimationFrame");
    rafSpy.mockClear();

    const article = makeArticle();
    addNote(article);
    addNote(article);
    addNote(article);

    expect(rafSpy.mock.calls.length).toBeLessThanOrEqual(1);
    rafSpy.mockRestore();
  });
});

describe("fallback mode (no .has-sidenotes container)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    const stylesheet = document.getElementById("side-note-container-styles");
    if (stylesheet) stylesheet.remove();
  });

  it("sets data-no-container on hosts without a .has-sidenotes ancestor", () => {
    const stray = document.createElement("side-note") as SideNote;
    stray.textContent = "no container here";
    document.body.appendChild(stray);

    expect(stray.hasAttribute("data-no-container")).toBe(true);
  });

  it("does not set data-no-container when wrapped in .has-sidenotes", () => {
    const article = makeArticle();
    const note = addNote(article);

    expect(note.hasAttribute("data-no-container")).toBe(false);
  });

  it("clears data-no-container when moved into a .has-sidenotes container", () => {
    const stray = document.createElement("side-note") as SideNote;
    stray.textContent = "starts loose";
    document.body.appendChild(stray);
    expect(stray.hasAttribute("data-no-container")).toBe(true);

    const article = makeArticle();
    article.appendChild(stray);

    expect(stray.hasAttribute("data-no-container")).toBe(false);
  });
});

describe("registerNote SSR guard", () => {
  const originalRO = globalThis.ResizeObserver;
  afterEach(() => {
    globalThis.ResizeObserver = originalRO;
  });

  it("returns a no-op unregister when ResizeObserver is unavailable", () => {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = undefined;
    const host = document.createElement("div");
    const marker = document.createElement("span");
    const note = document.createElement("aside");
    const unregister = registerNote(host, marker, note);
    expect(typeof unregister).toBe("function");
    expect(() => unregister()).not.toThrow();
  });
});
