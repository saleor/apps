import { Box, Text } from "@saleor/macaw-ui";
import clsx from "clsx";
import { type ReactNode } from "react";

import styles from "./detail-section-nav.module.css";

export interface DetailSectionNavItem {
  /** Id of the section this jumps to. */
  id: string;
  label: ReactNode;
  /** Optional leading glyph. Hidden from the accessible name — `label` stays the name. */
  icon?: ReactNode;
  /** Trailing control on the row (e.g. reset). Not inside the select button. */
  end?: ReactNode;
}

export interface DetailSectionNavProps {
  items: DetailSectionNavItem[];
  activeId?: string;
  onSelect: (sectionId: string) => void;
  /**
   * Submenu of the active row — filters or jumps that belong to that section, not another
   * top-level item. Renders after the rail so it does not inherit the section mark.
   */
  nested?: ReactNode;
  /** Names the nav for screen readers, e.g. "Email settings sections". */
  ariaLabel?: string;
  "data-test-id"?: string;
}

/**
 * In-page map of a long detail or settings page: one row per section, the one in view marked.
 *
 * Pair it with `useDetailSectionScrollSpy`, which supplies `activeId` and the scrolling side of
 * `onSelect`.
 */
export const DetailSectionNav = ({
  items,
  activeId,
  onSelect,
  nested,
  ariaLabel = "Sections",
  "data-test-id": dataTestId = "detail-section-nav",
}: DetailSectionNavProps): JSX.Element => (
  <Box as="nav" className={styles.nav} aria-label={ariaLabel} data-test-id={dataTestId}>
    <Box as="ul" className={styles.list}>
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <Box as="li" key={item.id} className={clsx(styles.item, isActive && styles.active)}>
            <button
              type="button"
              className={styles.button}
              aria-current={isActive ? "true" : undefined}
              data-test-id={`${dataTestId}-${item.id}`}
              onClick={() => onSelect(item.id)}
            >
              {item.icon ? (
                <Box className={styles.icon} aria-hidden>
                  {item.icon}
                </Box>
              ) : null}
              <Text as="span" size={3}>
                {item.label}
              </Text>
            </button>
            {item.end ? <Box className={styles.end}>{item.end}</Box> : null}
          </Box>
        );
      })}
    </Box>
    {nested ? (
      <Box className={styles.nested} data-test-id={`${dataTestId}-nested`}>
        {nested}
      </Box>
    ) : null}
  </Box>
);

DetailSectionNav.displayName = "DetailSectionNav";
