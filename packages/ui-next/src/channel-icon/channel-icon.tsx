import { Box } from "@saleor/macaw-ui";
import clsx from "clsx";
import { Globe } from "lucide-react";

import styles from "./channel-icon.module.css";
import { channelStatusToLabel, type ChannelStatusType } from "./types";

export interface ChannelIconProps {
  /** When `success`, globe is green — otherwise muted gray. */
  statusType?: ChannelStatusType;
  /**
   * Hover label. Defaults from `statusType` (Active / Inactive / …).
   * Pass `null` to suppress.
   */
  title?: string | null;
  /** Draw the globe in the text line instead of as a flex sibling. */
  inline?: boolean;
  className?: string;
  "data-test-id"?: string;
}

/**
 * Lucide Globe tinted by channel status — same chrome as Dashboard ChannelAvailability.
 * Color lives on the wrapper (`currentColor`) so a global `svg { stroke }` rule cannot mute it.
 * Native `title` shows status on hover (Active / Inactive).
 */
export const ChannelIcon = ({
  statusType,
  title,
  inline = false,
  className,
  "data-test-id": dataTestId = "channel-icon",
}: ChannelIconProps): JSX.Element => {
  const resolvedTitle = title === null ? undefined : title ?? channelStatusToLabel(statusType);

  return (
    <Box
      className={clsx(styles.icon, inline && styles.iconInline, className)}
      title={resolvedTitle}
      data-status={statusType ?? "unknown"}
      data-test-id={dataTestId}
    >
      <Globe size={14} aria-hidden strokeWidth={2} />
    </Box>
  );
};

ChannelIcon.displayName = "ChannelIcon";
