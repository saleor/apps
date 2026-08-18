import { Box, Text } from "@saleor/macaw-ui";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { type ReactNode } from "react";

import { iconSize, iconStrokeWidthBySize } from "../icons";
import styles from "./parked-setup-checklist.module.css";
import { type SetupChecklistProgress } from "./types";

export interface ParkedSetupChecklistProps {
  /** Checklist title, e.g. "Finish Stripe setup". */
  title: ReactNode;
  progress: SetupChecklistProgress;
  /** Optional muted line under the title (next incomplete task). */
  nextUp?: ReactNode;
  /** Reveals the full checklist (typically clears a dismiss preference). */
  onReveal: () => void;
  "data-test-id"?: string;
}

/**
 * Compact “parked” affordance for a dismissed setup checklist.
 * Lives in the main settings column (under the left-rail intro) — click restores the full card.
 * Prefer this over page-header restore buttons (no cog / chrome clutter).
 */
export const ParkedSetupChecklist = ({
  title,
  progress,
  nextUp,
  onReveal,
  "data-test-id": dataTestId = "parked-setup-checklist",
}: ParkedSetupChecklistProps): JSX.Element => {
  const complete = progress.total > 0 && progress.done >= progress.total;

  return (
    <Box
      as="button"
      type="button"
      className={styles.parked}
      onClick={onReveal}
      data-test-id={dataTestId}
      aria-label={
        typeof title === "string" ? `Show setup checklist: ${title}` : "Show setup checklist"
      }
    >
      <Box
        as="span"
        className={clsx(styles.progress, complete && styles.progressComplete)}
        data-test-id={`${dataTestId}-progress`}
      >
        {progress.done}/{progress.total}
      </Box>
      <Box className={styles.copy}>
        <Box className={styles.titleRow}>
          <Text size={3} fontWeight="medium">
            {title}
          </Text>
        </Box>
        {nextUp ? (
          <Text size={1} color="default2">
            {nextUp}
          </Text>
        ) : null}
      </Box>
      <Box className={styles.chevron} aria-hidden>
        <ChevronRight size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} />
      </Box>
    </Box>
  );
};

ParkedSetupChecklist.displayName = "ParkedSetupChecklist";
