import { Box, Text, Tooltip } from "@saleor/macaw-ui";
import clsx from "clsx";
import { type ReactNode } from "react";

import { StatusDot } from "../status-dot/status-dot";
import { type StatusTone } from "../status-dot/status-tone";
import { TooltipBody } from "../tooltip/tooltip-body";
import styles from "./status-label.module.css";

export interface StatusLabelProps {
  /** One or two words that name the state: Ready, Running, Failed. */
  children: ReactNode;
  tone: StatusTone;
  /** Pulses the dot while something is in flight (building, deploying). */
  live?: boolean;
  /**
   * The full explanation, on hover and on focus. What the state means — not the label itself.
   */
  tooltip?: ReactNode;
  "data-test-id"?: string;
}

/**
 * Health as a colored dot plus a label — not a pill.
 *
 * Dashboard uses this for Active / Scheduled / Ended on a detail title
 * (`ProductAvailabilityStatusLabel`). Vercel uses it for Ready / Building / Error. The capsule
 * (`Pill`, `StatusChip`) is a different token: a category or a fact, not whether the thing is
 * healthy.
 */
export const StatusLabel = ({
  children,
  tone,
  live = false,
  tooltip,
  "data-test-id": dataTestId,
}: StatusLabelProps): JSX.Element => {
  const body = (
    <>
      <StatusDot tone={tone} live={live} />
      <Text as="span" size={2} className={styles.label}>
        {children}
      </Text>
    </>
  );

  if (!tooltip) {
    return (
      <Box as="span" className={styles.root} data-test-id={dataTestId}>
        {body}
      </Box>
    );
  }

  return (
    <Tooltip>
      <Tooltip.Trigger>
        <button
          type="button"
          className={clsx(styles.root, styles.interactive)}
          data-test-id={dataTestId}
        >
          {body}
        </button>
      </Tooltip.Trigger>
      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

StatusLabel.displayName = "StatusLabel";
