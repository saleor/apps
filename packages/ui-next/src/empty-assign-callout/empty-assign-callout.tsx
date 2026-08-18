import { Box, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import styles from "./empty-assign-callout.module.css";

export interface EmptyAssignCalloutProps {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  /** Primary action inside the callout (e.g. Assign button). */
  action?: ReactNode;
  "data-test-id"?: string;
}

/**
 * Dashed empty-state callout for assignable lists inside bordered cards
 * (Dashboard AssignListCard empty pattern).
 */
export const EmptyAssignCallout = ({
  icon,
  title,
  description,
  action,
  "data-test-id": dataTestId = "empty-assign-callout",
}: EmptyAssignCalloutProps): JSX.Element => (
  <Box className={styles.emptyState} data-test-id={dataTestId} role="status">
    <Box className={styles.emptyLeading}>
      <Box className={styles.emptyIcon} aria-hidden>
        {icon}
      </Box>
      <Box className={styles.emptyCopy}>
        <Text size={3} fontWeight="medium">
          {title}
        </Text>
        <Text size={2} color="default2">
          {description}
        </Text>
      </Box>
    </Box>
    {action ? <Box className={styles.emptyAction}>{action}</Box> : null}
  </Box>
);

EmptyAssignCallout.displayName = "EmptyAssignCallout";
