import { TextLink } from "@saleor/apps-ui";
import { IconButton, iconSize, iconStrokeWidthBySize } from "@saleor/apps-ui-next";
import { Box, Button, Multiselect, Text, useTheme } from "@saleor/macaw-ui";
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
import { buildChannelMovePlan } from "./build-channel-move-plan";
import { ConfigCardChannelList } from "./config-card-channel-list";
import { ConfirmChannelMoveModal } from "./confirm-channel-move-modal";
import styles from "./stripe-config-cards.module.css";
import { StripeEnvBadge } from "./stripe-env-badge";
import { stripeEnvLabel } from "./stripe-env-label";

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
  const { theme } = useTheme();
  const configInstance = StripeFrontendConfig.createFromSerializedFields(config);
  const envValue = configInstance.getStripeEnvValue();

  const cardClassName = [
    styles.card,
    styles.cardElevated,
    theme === "defaultDark" && styles.cardElevatedDark,
  ]
    .filter(Boolean)
    .join(" ");

  const options = useMemo(
    () => toOptions(channels, mapping, config.id),
    [channels, mapping, config.id],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMoveConfirmOpen, setIsMoveConfirmOpen] = useState(false);

  const value = useMemo(
    () => options.filter((option) => selectedIds.includes(option.value)),
    [options, selectedIds],
  );

  /** Channels the selection would take away from another configuration. */
  const moves = useMemo(
    () =>
      buildChannelMovePlan({
        channels,
        mapping,
        targetConfig: config,
        selectedChannelIds: new Set(selectedIds),
      }),
    [channels, mapping, config, selectedIds],
  );

  const envChangingMoves = useMemo(() => moves.filter((move) => move.changesEnv), [moves]);

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

  const saveAssignments = async () => {
    const updates = buildChannelAssignmentUpdates({
      channels,
      mapping,
      configId: config.id,
      selectedChannelIds: new Set(selectedIds),
    });

    await onSaveAssignments(updates);
    setIsMoveConfirmOpen(false);
    setEditing(false);
  };

  /**
   * Moving a channel between configurations of the same mode only reroutes it, but moving it
   * across sandbox and live changes whether it takes real money — that one is worth a stop.
   */
  const handleSave = async () => {
    if (envChangingMoves.length > 0) {
      setIsMoveConfirmOpen(true);

      return;
    }

    await saveAssignments();
  };

  return (
    <Box className={cardClassName} data-test-id={`stripe-config-card-${configInstance.id}`}>
      {isMoveConfirmOpen ? (
        <ConfirmChannelMoveModal
          moves={envChangingMoves}
          targetConfigName={configInstance.name}
          targetEnv={envValue}
          isSaving={isSaving}
          onConfirm={() => void saveAssignments()}
          onClose={() => setIsMoveConfirmOpen(false)}
        />
      ) : null}

      <Box className={styles.cardHeader}>
        <Box
          className={styles.cardTitle}
          display="flex"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
        >
          <TextLink
            href={`/config/${configInstance.id}`}
            size={4}
            fontWeight="medium"
            data-test-id={`edit-config-${configInstance.id}`}
          >
            {configInstance.name}
          </TextLink>
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
                Select channels for this configuration.
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
              {moves.length > 0 ? (
                <Box
                  className={styles.moveNotice}
                  data-test-id={`assign-channels-moves-${configInstance.id}`}
                >
                  <Text size={1} color={envChangingMoves.length > 0 ? "warning1" : "default2"}>
                    {moves.length === 1
                      ? "1 channel will leave its current configuration:"
                      : `${moves.length} channels will leave their current configuration:`}
                  </Text>
                  {moves.map((move) => (
                    <Text key={move.channelId} size={1} color="default2">
                      {move.channelName} — now on {move.fromConfigName} (
                      {stripeEnvLabel(move.fromEnv)})
                      {move.changesEnv ? (
                        <Text size={1} color="warning1">
                          {" "}
                          · switches to {stripeEnvLabel(envValue)} keys
                        </Text>
                      ) : null}
                    </Text>
                  ))}
                </Box>
              ) : null}
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
