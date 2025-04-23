import { Layout } from "@saleor/apps-ui";
import { Box, Select, Text } from "@saleor/macaw-ui";
import React from "react";

import { ChannelFragment } from "@/generated/graphql";
import { StripeFrontendConfigSerializedFields } from "@/modules/app-config/stripe-config";

type Props = {
  channels: ChannelFragment[];
  configs: StripeFrontendConfigSerializedFields[];
  mapping: Record<string, StripeFrontendConfigSerializedFields>;
  onMappingChange(data: { channelId: string; configId: string }): void;
  isLoading: boolean;
};

const emptyValue = { value: "", label: "Not assigned" };

export const ChannelsConfigMapping = ({
  channels,
  configs,
  mapping,
  onMappingChange,
  isLoading,
}: Props) => {
  return (
    <Layout.AppSectionCard>
      <Box>
        {channels.map((channel) => {
          const isNotSelected = mapping[channel.id] === undefined;

          const options = configs.map((item) => ({
            value: item.id,
            label: item.name,
          }));

          if (isNotSelected) {
            options.unshift(emptyValue);
          }

          return (
            <Box paddingY={2} key={channel.id} display="flex" justifyContent="space-between">
              <Text>{channel.slug}</Text>
              <Box __minWidth="200px">
                <Select
                  disabled={isLoading}
                  value={mapping[channel.id]?.id ?? ""}
                  onChange={(value) => {
                    onMappingChange({
                      configId: value,
                      channelId: channel.id,
                    });
                  }}
                  options={options}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Layout.AppSectionCard>
  );
};
