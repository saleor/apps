import { Box, useTheme } from "@saleor/macaw-ui";
import clsx from "clsx";

import styles from "./status-dot.module.css";
import { type StatusTone } from "./status-tone";

export interface StatusDotProps {
  tone: StatusTone;
  /** Pulses while something is in flight (building, deploying). */
  live?: boolean;
}

const toneClassName: Record<StatusTone, string> = {
  success: styles.success,
  info: styles.info,
  warning: styles.warning,
  error: styles.error,
  neutral: styles.neutral,
};

/**
 * Dashboard `StatusDot`: an 8px circle whose color is the status.
 *
 * Pair with a label via `StatusLabel`. Alone it is a glyph — product tiles, availability rows.
 */
export const StatusDot = ({ tone, live = false }: StatusDotProps): JSX.Element => {
  const { theme } = useTheme();

  return (
    <Box
      as="span"
      className={clsx(
        styles.dot,
        toneClassName[tone],
        theme === "defaultDark" && styles.dark,
        live && styles.live,
      )}
      data-tone={tone}
      aria-hidden
    />
  );
};

StatusDot.displayName = "StatusDot";
