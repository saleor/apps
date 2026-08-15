import { Box, Text } from "@saleor/macaw-ui";
import { Unplug } from "lucide-react";
import { type ReactNode } from "react";

import { IconButton } from "../icon-button";
import { iconSize, iconStrokeWidthBySize } from "../icons";
import { ChannelIcon } from "./channel-icon";
import styles from "./channel-list-item.module.css";
import { type ChannelStatusType } from "./types";

export interface ChannelListItemProps {
  name: string;
  statusType?: ChannelStatusType;
  currencyCode?: string;
  /** When false, omits the bottom border (last row). Default true. */
  showDivider?: boolean;
  /**
   * When set, shows a hover-revealed disconnect control (Unplug).
   * Use for unassigning — reserve trash icons for destructive delete of the parent entity.
   */
  onDisconnect?: () => void;
  disconnectLabel?: string;
  disconnectDisabled?: boolean;
  endAdornment?: ReactNode;
  "data-test-id"?: string;
}

/**
 * Full-bleed channel row for lists inside bordered cards:
 * status-colored Globe + name + optional currency + optional hover disconnect.
 */
export const ChannelListItem = ({
  name,
  statusType,
  currencyCode,
  showDivider = true,
  onDisconnect,
  disconnectLabel = "Disconnect channel",
  disconnectDisabled = false,
  endAdornment,
  "data-test-id": dataTestId = "channel-list-item",
}: ChannelListItemProps): JSX.Element => (
  <Box
    className={styles.row}
    data-show-divider={showDivider ? "true" : "false"}
    data-test-id={dataTestId}
  >
    <Box className={styles.start}>
      <ChannelIcon statusType={statusType} />
      <Text size={3} fontWeight="medium" className={styles.name} title={name}>
        {name}
      </Text>
    </Box>
    {currencyCode ? (
      <Box className={styles.currency}>
        <Text size={1} color="default2" fontWeight="medium">
          {currencyCode}
        </Text>
      </Box>
    ) : null}
    {endAdornment}
    {/* Always reserve action slot width when disconnect exists; opacity handles hover. */}
    {onDisconnect ? (
      <Box className={styles.rowAction}>
        <IconButton
          aria-label={disconnectLabel}
          title={disconnectLabel}
          disabled={disconnectDisabled}
          onClick={onDisconnect}
          data-test-id={dataTestId ? `${dataTestId}-disconnect` : undefined}
          icon={
            <Unplug size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} aria-hidden />
          }
        />
      </Box>
    ) : null}
  </Box>
);

ChannelListItem.displayName = "ChannelListItem";
