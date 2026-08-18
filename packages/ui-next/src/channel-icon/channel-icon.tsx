import { Box } from "@saleor/macaw-ui";
import { Globe } from "lucide-react";

import { channelStatusToIconColor, channelStatusToLabel, type ChannelStatusType } from "./types";

export interface ChannelIconProps {
  /** When `success`, globe is green — otherwise muted gray. */
  statusType?: ChannelStatusType;
  /**
   * Hover label. Defaults from `statusType` (Active / Inactive / …).
   * Pass `null` to suppress.
   */
  title?: string | null;
  "data-test-id"?: string;
}

/**
 * Lucide Globe tinted by channel status — same chrome as Dashboard ChannelAvailability.
 * Native `title` shows status on hover (Active / Inactive).
 */
export const ChannelIcon = ({
  statusType,
  title,
  "data-test-id": dataTestId = "channel-icon",
}: ChannelIconProps): JSX.Element => {
  const resolvedTitle = title === null ? undefined : title ?? channelStatusToLabel(statusType);

  return (
    <Box
      display="flex"
      alignItems="center"
      flexShrink="0"
      title={resolvedTitle}
      data-test-id={dataTestId}
    >
      <Globe size={14} aria-hidden strokeWidth={2} color={channelStatusToIconColor(statusType)} />
    </Box>
  );
};

ChannelIcon.displayName = "ChannelIcon";
