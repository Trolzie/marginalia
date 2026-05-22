import { test, expect } from "@playwright/test";

async function waitForLayout(page: import("@playwright/test").Page): Promise<void> {
  await page.waitForFunction(() => customElements.get("side-note") !== undefined);
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
}

interface NoteRect {
  top: number;
  bottom: number;
  side: string;
  inline: boolean;
  inlineTop: string;
}

async function readNoteRects(page: import("@playwright/test").Page): Promise<NoteRect[]> {
  return page.evaluate(() => {
    const hosts = Array.from(document.querySelectorAll("side-note"));
    return hosts.map((host) => {
      const aside = host.shadowRoot?.querySelector("aside.note") as HTMLElement | null;
      const rect = aside?.getBoundingClientRect();
      return {
        top: rect?.top ?? 0,
        bottom: rect?.bottom ?? 0,
        side: host.getAttribute("side") ?? "right",
        inline: host.hasAttribute("inline"),
        inlineTop: aside?.style.top ?? "",
      };
    });
  });
}

test.describe("<side-note> at wide viewport", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");
    await waitForLayout(page);
  });

  test("stacks colliding notes in the right margin without overlap", async ({ page }) => {
    const rects = await readNoteRects(page);
    const rightNotes = rects.filter((r) => r.side === "right" && !r.inline);
    expect(rightNotes.length, "demo should have multiple right-side notes").toBeGreaterThan(2);

    for (let i = 1; i < rightNotes.length; i++) {
      const prev = rightNotes[i - 1]!;
      const curr = rightNotes[i]!;
      expect(curr.top, `right note ${i} should sit at or below previous bottom`).toBeGreaterThanOrEqual(prev.bottom - 1);
    }
  });

  test("anchors the first note near its marker (no over-correction)", async ({ page }) => {
    const alignment = await page.evaluate(() => {
      const host = document.querySelector("side-note");
      const marker = host?.shadowRoot?.querySelector("span.marker");
      const aside = host?.shadowRoot?.querySelector("aside.note");
      const markerRect = marker?.getBoundingClientRect();
      const asideRect = aside?.getBoundingClientRect();
      if (!markerRect || !asideRect) return null;
      return { diff: Math.abs(asideRect.top - markerRect.top) };
    });
    expect(alignment).not.toBeNull();
    expect(alignment!.diff, "first note should be vertically close to its marker").toBeLessThan(32);
  });

  test("does not set inline top on a <side-note inline> note", async ({ page }) => {
    const inlineTop = await page.evaluate(() => {
      const inlineHost = document.querySelector("side-note[inline]");
      const aside = inlineHost?.shadowRoot?.querySelector("aside.note") as HTMLElement | null;
      return aside?.style.top ?? "";
    });
    expect(inlineTop, "[inline] notes are static-positioned by CSS, JS should leave style.top empty").toBe("");
  });
});

test.describe("<side-note> at narrow viewport", () => {
  test("clears any JS-set style.top so CSS inline mode takes over", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");
    await waitForLayout(page);

    await page.setViewportSize({ width: 500, height: 900 });
    await page.evaluate(
      () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
    );

    const tops = await page.evaluate(() => {
      const hosts = Array.from(document.querySelectorAll("side-note"));
      return hosts.map((host) => {
        const aside = host.shadowRoot?.querySelector("aside.note") as HTMLElement | null;
        return aside?.style.top ?? "";
      });
    });

    for (const top of tops) {
      expect(top, "narrow viewport should have empty style.top on every note").toBe("");
    }
  });
});

test.describe("fallback mode (no .has-sidenotes container)", () => {
  test("renders inline when no wrapper class is present", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");
    await waitForLayout(page);

    await page.evaluate(() => {
      const wrapper = document.createElement("div");
      wrapper.id = "fallback-wrapper";
      wrapper.innerHTML = `<p>Prose with a stray <side-note id="stray">unwrapped note body</side-note> in it.</p>`;
      document.body.appendChild(wrapper);
    });

    await page.evaluate(
      () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
    );

    const result = await page.evaluate(() => {
      const host = document.getElementById("stray") as HTMLElement | null;
      if (!host) return null;
      const aside = host.shadowRoot?.querySelector("aside.note") as HTMLElement | null;
      const computed = aside ? getComputedStyle(aside) : null;
      return {
        dataNoContainer: host.hasAttribute("data-no-container"),
        position: computed?.position,
        display: computed?.display,
        inlineStyleTop: aside?.style.top ?? "",
      };
    });

    expect(result).not.toBeNull();
    expect(result!.dataNoContainer, "fallback hosts get the data-no-container marker").toBe(true);
    expect(result!.position, "fallback note should be statically positioned").toBe("static");
    expect(result!.display, "fallback note should be inline").toBe("inline");
    expect(result!.inlineStyleTop, "layout JS should not set style.top on fallback notes").toBe("");
  });
});

test.describe("print media", () => {
  test("notes render inline at full opacity under print emulation", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");
    await waitForLayout(page);

    await page.emulateMedia({ media: "print" });
    await page.evaluate(
      () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
    );

    const result = await page.evaluate(() => {
      const host = document.querySelector("side-note") as HTMLElement | null;
      if (!host) return null;
      const aside = host.shadowRoot?.querySelector("aside.note") as HTMLElement | null;
      const computed = aside ? getComputedStyle(aside) : null;
      return {
        position: computed?.position,
        display: computed?.display,
        opacity: computed?.opacity,
      };
    });

    expect(result).not.toBeNull();
    expect(result!.position, "print should override to static").toBe("static");
    expect(result!.display, "print should override to inline").toBe("inline");
    expect(parseFloat(result!.opacity ?? "0"), "print should restore full opacity").toBeGreaterThan(0.99);
  });
});

test.describe("resize lifecycle", () => {
  test("recomputes tops when growing back from narrow to wide", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");
    await waitForLayout(page);

    const wideTopsBefore = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("side-note")).map((h) => {
        const a = h.shadowRoot?.querySelector("aside.note") as HTMLElement | null;
        return a?.style.top ?? "";
      });
    });
    expect(wideTopsBefore.some((t) => t !== ""), "wide viewport should set tops on at least one note").toBe(true);

    await page.setViewportSize({ width: 500, height: 900 });
    await page.evaluate(
      () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
    );

    await page.setViewportSize({ width: 1400, height: 900 });
    await page.evaluate(
      () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
    );

    const wideTopsAfter = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("side-note")).map((h) => {
        const a = h.shadowRoot?.querySelector("aside.note") as HTMLElement | null;
        return a?.style.top ?? "";
      });
    });
    expect(wideTopsAfter.some((t) => t !== ""), "tops should be re-applied after returning to wide").toBe(true);
  });
});
