import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { DeleteConfigurationModalContent } from "@saleor/apps-ui";
import { channelActiveToStatus, ChannelListItem, DetailGroupBox } from "@saleor/apps-ui-next";
import { Box, Modal, Text } from "@saleor/macaw-ui";
import { useMemo, useState } from "react";

import { type ConfigChannelFragment } from "@/generated/graphql";
import { type StripeFrontendConfigSerializedFields } from "@/modules/app-config/domain/stripe-config";
import { trpcClient } from "@/modules/trpc/trpc-client";

import { AssignChannelSelect } from "./assign-channel-select";
import {
  type ChannelAssignmentUpdate,
  type ChannelMapping,
} from "./build-channel-assignment-updates";
import { StripeConfigCard } from "./stripe-config-card";
import styles from "./stripe-config-cards.module.css";

type Props = {
  configs: StripeFrontendConfigSerializedFields[];
  channels: ConfigChannelFragment[];
  mapping: ChannelMapping;
};

export const StripeConfigsList = ({ configs, channels, mapping }: Props) => {
  const { notifyError, notifySuccess } = useDashboardNotification();
  const configsList = trpcClient.appConfig.getStripeConfigsList.useQuery();
  const mappingsQuery = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const [configIdToDelete, setConfigIdToDelete] = useState<string | null>(null);

  const { mutate: removeStripeConfig, isLoading: isDeleting } =
    trpcClient.appConfig.removeStripeConfig.useMutation({
      onSuccess() {
        notifySuccess("Configuration deleted");
      },
      onError(err) {
        notifyError("Error deleting config", err.message);
      },
      onSettled() {
        void mappingsQuery.refetch();
        void configsList.refetch();
      },
    });

  const mappingUpdate = trpcClient.appConfig.updateMapping.useMutation();

  const channelsByConfigId = useMemo(() => {
    const result: Record<string, ConfigChannelFragment[]> = {};

    for (const config of configs) {
      result[config.id] = [];
    }

    for (const channel of channels) {
      const assigned = mapping[channel.id];

      if (assigned && result[assigned.id]) {
        result[assigned.id].push(channel);
      }
    }

    return result;
  }, [configs, channels, mapping]);

  const unassignedChannels = useMemo(
    () => channels.filter((channel) => mapping[channel.id] === undefined),
    [channels, mapping],
  );

  const closeDeleteModal = () => setConfigIdToDelete(null);

  const handleAssignSave = async (updates: ChannelAssignmentUpdate[]) => {
    if (updates.length === 0) {
      return;
    }

    try {
      await Promise.all(
        updates.map((update) =>
          mappingUpdate.mutateAsync({
            channelId: update.channelId,
            configId: update.configId,
          }),
        ),
      );
      notifySuccess("Channel assignment updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      notifyError("Error updating channel assignment", message);
      throw err;
    } finally {
      /** Updates are per channel, so a failure in the middle still leaves some of them applied. */
      await mappingsQuery.refetch();
    }
  };

  /** Single-channel path from the unassigned fold: no other configuration loses a channel. */
  const handleAssignSingleChannel = async (channelId: string, configId: string) => {
    try {
      await mappingUpdate.mutateAsync({ channelId, configId });
      notifySuccess("Channel assigned");
      await mappingsQuery.refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      notifyError("Error assigning channel", message);
    }
  };

  const handleDisconnectChannel = async (channelId: string) => {
    try {
      await mappingUpdate.mutateAsync({
        channelId,
        configId: null,
      });
      notifySuccess("Channel disconnected");
      await mappingsQuery.refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      notifyError("Error disconnecting channel", message);
    }
  };

  return (
    <>
      {/* Padded body — sibling of flush fold so SettingsSection draws one top rule. */}
      <Box className={styles.listBody}>
        <Modal open={Boolean(configIdToDelete)} onChange={closeDeleteModal}>
          <DeleteConfigurationModalContent
            onDeleteClick={() => {
              if (!configIdToDelete) {
                throw new Error(
                  "Invariant, modal should be open only when configIdToDelete is set",
                );
              }

              removeStripeConfig({ configId: configIdToDelete });
              closeDeleteModal();
            }}
          />
        </Modal>

        <Box className={styles.grid} data-test-id="stripe-config-cards-grid">
          {configs.map((config) => (
            <StripeConfigCard
              key={config.id}
              config={config}
              channels={channels}
              mapping={mapping}
              assignedChannels={channelsByConfigId[config.id] ?? []}
              isSaving={mappingUpdate.isLoading}
              isDeleting={isDeleting}
              onDelete={() => setConfigIdToDelete(config.id)}
              onSaveAssignments={handleAssignSave}
              onDisconnectChannel={handleDisconnectChannel}
            />
          ))}
        </Box>
      </Box>

      {unassignedChannels.length > 0 ? (
        <DetailGroupBox
          groupId="unassigned-channels"
          variant="flush"
          marginTop={0}
          dataTestId="unassigned-channels-callout"
          triggerButtonTestId="unassigned-channels-toggle"
          headerStart={
            <Text size={2}>
              {unassignedChannels.length === 1
                ? "1 channel not assigned"
                : `${unassignedChannels.length} channels not assigned`}
            </Text>
          }
        >
          <Box className={styles.unassignedList}>
            {unassignedChannels.map((channel, index) => (
              <ChannelListItem
                key={channel.id}
                name={channel.name}
                currencyCode={channel.currencyCode}
                statusType={channelActiveToStatus(channel.isActive)}
                showDivider={index < unassignedChannels.length - 1}
                endAdornment={
                  configs.length > 0 ? (
                    <AssignChannelSelect
                      channelName={channel.name}
                      configs={configs}
                      disabled={mappingUpdate.isLoading}
                      onAssign={(configId) => void handleAssignSingleChannel(channel.id, configId)}
                    />
                  ) : undefined
                }
              />
            ))}
          </Box>
        </DetailGroupBox>
      ) : null}
    </>
  );
};
