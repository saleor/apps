/**
 * Scrolling inside `DetailPageLayout.Content`.
 *
 * In the Dashboard the content pane is always the scrollport. An app is an iframe: whether the
 * pane scrolls or the document does depends on whether the page reserves a `Savebar`, so every
 * helper here treats `null` as "the document scrolls" and normalizes the geometry over both.
 */

const SCROLL_EPSILON_PX = 1;

const canScroll = (element: HTMLElement): boolean =>
  element.scrollHeight - element.clientHeight > SCROLL_EPSILON_PX;

const isDocumentRoot = (element: HTMLElement): boolean =>
  element === document.documentElement || element === document.body;

/**
 * The element that scrolls `element`, or `null` when that is the document.
 *
 * `DetailPageLayout.Content` marks itself, but it only becomes a scrollport when its height is
 * definite, so the marker is trusted only while it actually overflows.
 */
export const getDetailContentScrollRoot = (element: HTMLElement | null): HTMLElement | null => {
  if (!element) {
    return null;
  }

  const marked = element.closest<HTMLElement>("[data-detail-content-scroll]");

  if (marked && canScroll(marked)) {
    return marked;
  }

  let parent = element.parentElement;

  while (parent && !isDocumentRoot(parent)) {
    const { overflowY } = getComputedStyle(parent);

    if (
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      canScroll(parent)
    ) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
};

export interface DetailContentScrollport {
  /** Viewport Y of the scrollport's top edge. */
  top: number;
  height: number;
  scrollTop: number;
  scrollHeight: number;
}

/** Geometry of the scrollport, in the same shape whether it is an element or the document. */
export const readDetailContentScrollport = (root: HTMLElement | null): DetailContentScrollport => {
  if (root) {
    return {
      top: root.getBoundingClientRect().top,
      height: root.clientHeight,
      scrollTop: root.scrollTop,
      scrollHeight: root.scrollHeight,
    };
  }

  const documentElement = document.documentElement;

  return {
    // The document's scrollport starts at the viewport top; its rect does not (it moves with scroll).
    top: 0,
    height: window.innerHeight,
    scrollTop: window.scrollY,
    scrollHeight: documentElement.scrollHeight,
  };
};

/** Listen for scrolling of the given scrollport. Returns the unsubscribe function. */
export const subscribeToDetailContentScroll = (
  root: HTMLElement | null,
  onScroll: () => void,
): (() => void) => {
  const target: HTMLElement | Window = root ?? window;

  target.addEventListener("scroll", onScroll, { passive: true });

  return () => target.removeEventListener("scroll", onScroll);
};

/**
 * Scroll a node to the top of the detail content.
 *
 * `scrollIntoView` is avoided because it also scrolls ancestors — in an app iframe that shifts the
 * whole frame inside the Dashboard's own scroll position.
 */
export const scrollElementIntoDetailContent = (element: HTMLElement): void => {
  const root = getDetailContentScrollRoot(element);
  const scrollport = readDetailContentScrollport(root);
  const scrollMarginTop = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const top = Math.max(
    0,
    scrollport.scrollTop + (element.getBoundingClientRect().top - scrollport.top) - scrollMarginTop,
  );

  if (root) {
    root.scrollTo({ top, behavior: "smooth" });

    return;
  }

  window.scrollTo({ top, behavior: "smooth" });
};

/** Returns false when no node with this id is mounted. */
export const scrollToDetailSection = (sectionId: string): boolean => {
  const element = document.getElementById(sectionId);

  if (!element) {
    return false;
  }

  scrollElementIntoDetailContent(element);

  return true;
};
