import { IconButton, iconSize, iconStrokeWidthBySize } from "@saleor/apps-ui-next";
import { Box, Button, Multiselect, Text } from "@saleor/macaw-ui";
import { Plug, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { type ConfigChannelFragment } from "@/generated/graphql";
import {
  StripeFrontendConfig,
  type StripeFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/stripe-config";

import {
  buildChannelAssignmentUpdates,
  type ChannelAssignmentUpdate,
  type ChannelMapping,
} from "./build-channel-assignment-updates";
import { ConfigCardChannelList } from "./config-card-channel-list";
import styles from "./stripe-config-cards.module.css";
import { StripeEnvBadge } from "./stripe-env-badge";

type ChannelOption = { label: string; value: string };

type Props = {
  config: StripeFrontendConfigSerializedFields;
  channels: ConfigChannelFragment[];
  mapping: ChannelMapping;
  assignedChannels: ConfigChannelFragment[];
  isSaving: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onSaveAssignments: (updates: ChannelAssignmentUpdate[]) => Promise<void>;
  onDisconnectChannel: (channelId: string) => Promise<void>;
};

const toOptions = (
  channels: ConfigChannelFragment[],
  mapping: ChannelMapping,
  configId: string,
): ChannelOption[] =>
  channels.map((channel) => {
    const other = mapping[channel.id];
    const assignedElsewhere = other !== undefined && other.id !== configId;
    const suffix = assignedElsewhere ? ` (on ${other.name})` : "";

    return {
      value: channel.id,
      label: `${channel.name}${suffix}`,
    };
  });

export const StripeConfigCard = ({
  config,
  channels,
  mapping,
  assignedChannels,
  isSaving,
  isDeleting,
  onDelete,
  onSaveAssignments,
  onDisconnectChannel,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const configInstance = StripeFrontendConfig.createFromSerializedFields(config);
  const envValue = configInstance.getStripeEnvValue();

  const options = useMemo(
    () => toOptions(channels, mapping, config.id),
    [channels, mapping, config.id],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const value = useMemo(
    () => options.filter((option) => selectedIds.includes(option.value)),
    [options, selectedIds],
  );

  const webhookStatusInfo =
    configInstance.webhookStatus === "disabled" ? (
      <Text size={1} color="warning1">
        Webhook disabled, app will not work properly
      </Text>
    ) : configInstance.webhookStatus === "missing" ? (
      <Text size={1} color="critical1">
        Webhook missing, create config again
      </Text>
    ) : null;

  /**
   * Seeded only on entering edit mode — a mapping refetch triggered by another card
   * must not discard the selection in progress here.
   */
  const startEditing = () => {
    setSelectedIds(assignedChannels.map((channel) => channel.id));
    setEditing(true);
  };
  const cancelEditing = () => setEditing(false);

  const handleSave = async () => {
    const updates = buildChannelAssignmentUpdates({
      channels,
      mapping,
      configId: config.id,
      selectedChannelIds: new Set(selectedIds),
    });

    await onSaveAssignments(updates);
    setEditing(false);
  };

  return (
    <Box className={styles.card} data-test-id={`stripe-config-card-${configInstance.id}`}>
      <Box className={styles.cardHeader}>
        <Box
          className={styles.cardTitle}
          display="flex"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
        >
          <Text size={4} fontWeight="medium">
            {configInstance.name}
          </Text>
          <StripeEnvBadge env={envValue} />
        </Box>

        <Box className={styles.cardHeaderActions}>
          {editing ? (
            <>
              <Button variant="tertiary" size="small" disabled={isSaving} onClick={cancelEditing}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                disabled={isSaving || channels.length === 0}
                onClick={() => void handleSave()}
              >
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <>
              <IconButton
                aria-label={`Assign channels to ${configInstance.name}`}
                title={`Assign channels to ${configInstance.name}`}
                disabled={isSaving}
                onClick={startEditing}
                data-test-id={`assign-channels-${configInstance.id}`}
                icon={
                  <Plug
                    size={iconSize.small}
                    strokeWidth={iconStrokeWidthBySize.small}
                    aria-hidden
                  />
                }
              />
              <IconButton
                aria-label={`Delete ${configInstance.name}`}
                title={`Delete ${configInstance.name}`}
                disabled={isDeleting}
                onClick={onDelete}
                icon={
                  <Trash2
                    size={iconSize.small}
                    strokeWidth={iconStrokeWidthBySize.small}
                    aria-hidden
                  />
                }
              />
            </>
          )}
        </Box>
      </Box>

      {webhookStatusInfo ? <Box className={styles.cardAlerts}>{webhookStatusInfo}</Box> : null}

      {editing ? (
        <Box
          className={styles.cardBodyPadded}
          data-test-id={`assign-channels-editor-${configInstance.id}`}
        >
          {channels.length === 0 ? (
            <Text size={2} color="default2">
              No channels found in your Saleor store.
            </Text>
          ) : (
            <Box display="flex" flexDirection="column" gap={3}>
              <Text size={1} color="default2">
                Select channels for this configuration. Channels already on another configuration
                will move here.
              </Text>
              <Multiselect
                label="Channels"
                placeholder="Add channels…"
                options={options}
                value={value}
                disabled={isSaving}
                onChange={(next) => {
                  const optionsNext = next as ChannelOption[];

                  setSelectedIds(optionsNext.map((option) => option.value));
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        <>
          <Box className={styles.cardBody}>
            <ConfigCardChannelList
              channels={assignedChannels}
              configName={configInstance.name}
              disconnectDisabled={isSaving}
              assignDisabled={isSaving}
              onAssign={startEditing}
              onDisconnect={(channelId) => {
                void onDisconnectChannel(channelId);
              }}
            />
          </Box>
          <Box
            className={styles.cardFooter}
            data-test-id={`config-card-channel-count-${config.id}`}
          >
            <Text size={1} color="default2">
              {assignedChannels.length === 0
                ? "No channels connected"
                : assignedChannels.length === 1
                ? "1 channel connected"
                : `${assignedChannels.length} channels connected`}
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
};
