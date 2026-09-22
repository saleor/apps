import { Box, Tooltip } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import styles from "./tooltip-body.module.css";

export interface TooltipBodyProps {
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

/**
 * Tooltip content that holds a sentence rather than a label.
 *
 * Internal to the package: every trigger that explains itself — a chip, an info glyph — needs the
 * same width cap, and a cap set per component drifts.
 */
export const TooltipBody = ({
  children,
  side = "bottom",
  align = "start",
}: TooltipBodyProps): JSX.Element => (
  <Tooltip.Content side={side} align={align}>
    <Tooltip.Arrow />
    <Box className={styles.body}>{children}</Box>
  </Tooltip.Content>
);

TooltipBody.displayName = "TooltipBody";
