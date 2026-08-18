/** Matches Dashboard ChannelAvailability status types used for icon tinting. */
export type ChannelStatusType = "success" | "hidden" | "warning" | "error" | "scheduled";

/** Dashboard `SUCCESS_ICON_COLOR` — active channel Globe. */
export const CHANNEL_STATUS_SUCCESS_COLOR = "#0ABF53";

export const channelStatusToIconColor = (statusType?: ChannelStatusType): string => {
  if (statusType === "success") {
    return CHANNEL_STATUS_SUCCESS_COLOR;
  }

  return "var(--mu-colors-text-default2)";
};

/** Human-readable status for icon hover (`title` / tooltip). */
export const channelStatusToLabel = (statusType?: ChannelStatusType): string | undefined => {
  switch (statusType) {
    case "success":
      return "Active";
    case "hidden":
      return "Inactive";
    case "warning":
      return "Warning";
    case "error":
      return "Error";
    case "scheduled":
      return "Scheduled";
    default:
      return undefined;
  }
};

/** Map Saleor `Channel.isActive` to icon status. */
export const channelActiveToStatus = (isActive: boolean): ChannelStatusType =>
  isActive ? "success" : "hidden";
