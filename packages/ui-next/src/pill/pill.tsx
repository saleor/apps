import { Box, Tooltip, useTheme } from "@saleor/macaw-ui";
import clsx from "clsx";
import { type ReactNode } from "react";

import { type StatusTone } from "../status-dot/status-tone";
import { TooltipBody } from "../tooltip/tooltip-body";
import styles from "./pill.module.css";

export interface PillProps {
  /** One or two words. A pill that needs a sentence is a `Callout`. */
  children: ReactNode;
  /**
   * Same tones as `StatusDot` / `StatusLabel`. Default `neutral` — a category (Storefront,
   * Production) rather than a severity.
   */
  tone?: StatusTone;
  /**
   * The full explanation, on hover and on focus. What the token means — not the label itself.
   */
  tooltip?: ReactNode;
  "data-test-id"?: string;
}

const toneClassName: Record<StatusTone, string> = {
  success: styles.success,
  info: styles.info,
  warning: styles.warning,
  error: styles.error,
  neutral: styles.neutral,
};

/**
 * Dashboard status / type capsule: the oklch wash, 12px medium label, 32px radius.
 *
 * Same token as order Payment / Fulfillment status. Health — Ready, Building, Failed — is
 * always `StatusLabel`, including in a dense row. Do not switch tokens because of layout.
 */
export const Pill = ({
  children,
  tone = "neutral",
  tooltip,
  "data-test-id": dataTestId,
}: PillProps): JSX.Element => {
  const { theme } = useTheme();
  const className = clsx(styles.pill, toneClassName[tone], theme === "defaultDark" && styles.dark);
  const label = <span className={styles.label}>{children}</span>;

  if (!tooltip) {
    return (
      <Box as="span" className={className} data-tone={tone} data-test-id={dataTestId}>
        {label}
      </Box>
    );
  }

  return (
    <Tooltip>
      <Tooltip.Trigger>
        <button
          type="button"
          className={clsx(className, styles.interactive)}
          data-tone={tone}
          data-test-id={dataTestId}
        >
          {label}
        </button>
      </Tooltip.Trigger>
      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

Pill.displayName = "Pill";
