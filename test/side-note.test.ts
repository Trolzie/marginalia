import { beforeEach, describe, expect, it } from "vitest";
import { SideNote } from "../src/index";

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

  it("reflects the side attribute to data-side", () => {
    const article = makeArticle();
    const right = addNote(article);
    const left = addNote(article);
    left.setAttribute("side", "left");

    expect(right.dataset.side).toBe("right");
    expect(left.dataset.side).toBe("left");
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

  it("numbers data-number per sibling within the same .has-sidenotes container", () => {
    const article = makeArticle();
    const a = addNote(article);
    const b = addNote(article);
    const c = addNote(article);

    expect(a.dataset.number).toBe("1");
    expect(b.dataset.number).toBe("2");
    expect(c.dataset.number).toBe("3");
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

  it("reflects inline attribute presence to data-inline", () => {
    const article = makeArticle();
    const note = document.createElement("side-note") as SideNote;
    note.setAttribute("inline", "");
    article.appendChild(note);

    expect(note.dataset.inline).toBe("");
  });
});
