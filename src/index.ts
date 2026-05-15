import { SideNote } from "./side-note";

if (typeof customElements !== "undefined" && !customElements.get("side-note")) {
  customElements.define("side-note", SideNote);
}

export { SideNote };

declare global {
  interface HTMLElementTagNameMap {
    "side-note": SideNote;
  }
}
