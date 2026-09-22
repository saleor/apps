import { useCallback, useEffect, useRef, useState } from "react";

import {
  getDetailContentScrollRoot,
  readDetailContentScrollport,
  scrollToDetailSection,
  subscribeToDetailContentScroll,
} from "../detail-page-layout/detail-content-scroll";
import { resolveActiveSectionIndex } from "./resolve-active-section-index";

/** Offset from the scrollport top used as the "current section" line. */
const SECTION_MARKER_OFFSET_PX = 48;

/** How long a click keeps its selection while the smooth scroll runs. */
const SELECTION_LOCK_MS = 900;

const resolveActiveSectionId = (
  root: HTMLElement | null,
  elements: HTMLElement[],
): string | undefined => {
  const scrollport = readDetailContentScrollport(root);
  const index = resolveActiveSectionIndex({
    sectionTops: elements.map((element) => element.getBoundingClientRect().top),
    markerY: scrollport.top + SECTION_MARKER_OFFSET_PX,
    nearBottom: scrollport.scrollTop + scrollport.height >= scrollport.scrollHeight - 4,
  });

  return index < 0 ? undefined : elements[index]?.id;
};

/**
 * Track which section is in view from scroll position, and scroll to one on demand.
 *
 * Scroll position rather than `IntersectionObserver`: sections here are cards of wildly different
 * heights, and thresholds on those flip the highlight back and forth mid-scroll.
 *
 * @param sectionIds ids of the sections, in document order
 * @param enabled pass false while the sections are not mounted, e.g. during the first load
 */
export const useDetailSectionScrollSpy = ({
  sectionIds,
  enabled = true,
}: {
  sectionIds: string[];
  enabled?: boolean;
}): { activeId: string | undefined; selectSection: (sectionId: string) => void } => {
  const [activeId, setActiveId] = useState<string | undefined>(sectionIds[0]);
  const activeIdRef = useRef(activeId);
  const lockedUntilRef = useRef(0);

  useEffect(
    function syncActiveIdRef() {
      activeIdRef.current = activeId;
    },
    [activeId],
  );

  /**
   * `sectionIds` is a new array on every render, so the effect keys on its contents. Sections come
   * and go with configuration state (an empty store has no Advanced section), which is exactly when
   * the element list has to be rebuilt.
   */
  const sectionIdsKey = sectionIds.join(",");

  useEffect(
    function syncActiveSectionOnScroll() {
      if (!enabled || sectionIdsKey.length === 0) {
        return;
      }

      const elements = sectionIdsKey
        .split(",")
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null);

      if (elements.length === 0) {
        return;
      }

      const root = getDetailContentScrollRoot(elements[0]);

      let frameId = 0;

      const updateActiveSection = (): void => {
        if (Date.now() < lockedUntilRef.current) {
          return;
        }

        const nextId = resolveActiveSectionId(root, elements);

        if (nextId && nextId !== activeIdRef.current) {
          activeIdRef.current = nextId;
          setActiveId(nextId);
        }
      };

      const onScroll = (): void => {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(updateActiveSection);
      };

      updateActiveSection();

      const unsubscribe = subscribeToDetailContentScroll(root, onScroll);

      return function stopTrackingActiveSection(): void {
        cancelAnimationFrame(frameId);
        unsubscribe();
      };
    },
    [enabled, sectionIdsKey],
  );

  const selectSection = useCallback((sectionId: string) => {
    activeIdRef.current = sectionId;
    setActiveId(sectionId);
    // Without the lock the scroll it triggers would re-highlight every section it passes through.
    lockedUntilRef.current = Date.now() + SELECTION_LOCK_MS;
    scrollToDetailSection(sectionId);
  }, []);

  return { activeId, selectSection };
};
