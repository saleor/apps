import { afterEach, describe, expect, it } from "vitest";

import { getDetailContentScrollRoot, readDetailContentScrollport } from "./detail-content-scroll";

/** jsdom does no layout, so scroll geometry has to be stated per element. */
const setScrollGeometry = (
  element: HTMLElement,
  { clientHeight, scrollHeight }: { clientHeight: number; scrollHeight: number },
) => {
  Object.defineProperty(element, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(element, "scrollHeight", { value: scrollHeight, configurable: true });
};

const renderContentPane = ({
  clientHeight,
  scrollHeight,
}: {
  clientHeight: number;
  scrollHeight: number;
}) => {
  const pane = document.createElement("div");

  pane.dataset.detailContentScroll = "true";
  setScrollGeometry(pane, { clientHeight, scrollHeight });

  const section = document.createElement("section");

  pane.appendChild(section);
  document.body.appendChild(pane);

  return { pane, section };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("getDetailContentScrollRoot", () => {
  it("returns the content pane when it overflows", () => {
    const { pane, section } = renderContentPane({ clientHeight: 600, scrollHeight: 2000 });

    expect(getDetailContentScrollRoot(section)).toBe(pane);
  });

  /**
   * The pane marks itself but only scrolls when its height is definite, which in an app depends on
   * whether the page reserves a Savebar. Trusting the marker regardless would report
   * `scrollHeight === clientHeight`, which reads as "scrolled to the bottom".
   */
  it("falls back to the document when the content pane does not overflow", () => {
    const { section } = renderContentPane({ clientHeight: 600, scrollHeight: 600 });

    expect(getDetailContentScrollRoot(section)).toBeNull();
  });

  it("returns the document for a detached element", () => {
    expect(getDetailContentScrollRoot(null)).toBeNull();
  });
});

describe("readDetailContentScrollport", () => {
  it("reports the document scrollport as starting at the viewport top", () => {
    window.scrollY = 120;

    const scrollport = readDetailContentScrollport(null);

    expect(scrollport.top).toBe(0);
    expect(scrollport.scrollTop).toBe(120);
    expect(scrollport.height).toBe(window.innerHeight);
  });

  it("reports an element scrollport from the element itself", () => {
    const { pane } = renderContentPane({ clientHeight: 600, scrollHeight: 2000 });

    pane.scrollTop = 240;

    const scrollport = readDetailContentScrollport(pane);

    expect(scrollport).toMatchObject({ height: 600, scrollHeight: 2000, scrollTop: 240 });
  });
});
