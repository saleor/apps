import { Box, Text, Tooltip } from "@saleor/macaw-ui";
import clsx from "clsx";
import { type ReactNode } from "react";

import { TooltipBody } from "../tooltip/tooltip-body";
import styles from "./status-chip.module.css";

export interface StatusChipProps {
  /** Two or three words. A chip that needs a sentence is a `Callout`. */
  children: ReactNode;
  /**
   * The full explanation, on hover and on focus. Everything the merchant does not need in front of
   * them all the time — what the state means, and what changes it — belongs here.
   */
  tooltip?: ReactNode;
  "data-test-id"?: string;
}

/**
 * Compact statement of a steady state: what the thing on screen currently is.
 *
 * The counterpart to `Callout`, which is for something wrong or something to do — a page that
 * reports every unchanging fact in a stack of callouts trains merchants to skip the ones that
 * matter. A chip states the fact in a line and keeps its reasoning in the tooltip.
 */
export const StatusChip = ({
  children,
  tooltip,
  "data-test-id": dataTestId,
}: StatusChipProps): JSX.Element => {
  const label = (
    <Text as="span" size={2} className={styles.label}>
      {children}
    </Text>
  );

  if (!tooltip) {
    return (
      <Box as="span" className={styles.chip} data-test-id={dataTestId}>
        {label}
      </Box>
    );
  }

  return (
    <Tooltip>
      <Tooltip.Trigger>
        {/* A button so the explanation is reachable by keyboard, not only by hover. */}
        <button
          type="button"
          className={clsx(styles.chip, styles.interactive)}
          data-test-id={dataTestId}
        >
          {label}
        </button>
      </Tooltip.Trigger>
      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

StatusChip.displayName = "StatusChip";
