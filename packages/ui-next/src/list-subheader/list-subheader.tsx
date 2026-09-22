import { Box, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import { InfoTooltip } from "../info-tooltip/info-tooltip";
import styles from "./list-subheader.module.css";

export interface ListSubheaderProps {
  children: ReactNode;
  /**
   * Decorative glyph before the label, sized `iconSize.small`. Prefer the icon the Dashboard already
   * uses for the same subject so the band is recognizable before it is read.
   */
  icon?: ReactNode;
  /** Right-aligned trailing text, e.g. a count of what the group contains. */
  end?: ReactNode;
  /**
   * A caveat that applies to this group only, shown on an info glyph after the label. In a tooltip
   * rather than a second line because the band's job is to label the rows: a sentence in it pushes
   * every row down and turns the label into a paragraph.
   *
   * Needs `noteLabel`.
   */
  note?: ReactNode;
  /** Names the note for screen readers, e.g. "About order notifications". */
  noteLabel?: string;
  "data-test-id"?: string;
}

/**
 * Tinted band that labels a group of rows inside a card.
 *
 * Same treatment the Dashboard uses for the column headers of the variant pricing table, which is
 * where merchants have already learned to read it: it names what follows without competing with the
 * card's own title.
 */
export const ListSubheader = ({
  children,
  icon,
  end,
  note,
  noteLabel,
  "data-test-id": dataTestId,
}: ListSubheaderProps): JSX.Element => (
  <Box className={styles.subheader} data-test-id={dataTestId}>
    <Box className={styles.start}>
      {icon ? (
        <Box className={styles.icon} aria-hidden>
          {icon}
        </Box>
      ) : null}
      <Text size={2} color="default2" className={styles.label}>
        {children}
      </Text>
      {note && noteLabel ? (
        <InfoTooltip
          label={noteLabel}
          data-test-id={dataTestId ? `${dataTestId}-note` : "list-subheader-note"}
        >
          {note}
        </InfoTooltip>
      ) : null}
    </Box>
    {end ? (
      <Text size={2} color="default2" flexShrink="0">
        {end}
      </Text>
    ) : null}
  </Box>
);

ListSubheader.displayName = "ListSubheader";
