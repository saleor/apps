import { Layout } from "@saleor/apps-ui";
import { Box, Select, Text } from "@saleor/macaw-ui";
import React from "react";

import { ChannelFragment } from "@/generated/graphql";
import { StripeFrontendConfigSerializedFields } from "@/modules/app-config/stripe-config";

type Props = {
  channels: ChannelFragment[];
  configs: StripeFrontendConfigSerializedFields[];
};

export const ChannelsConfigMapping = ({ channels, configs }: Props) => {
  return (
    <Layout.AppSectionCard>
      <Box>
        {channels.map((channel) => {
          return (
            <Box paddingY={2} key={channel.id} display="flex" justifyContent="space-between">
              <Text>{channel.slug}</Text>
              <Box>
                <Select
                  value={""}
                  onChange={(value) => {}}
                  options={[
                    { value: "", label: "Not assigned" },
                    ...configs.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })),
                  ]}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Layout.AppSectionCard>
  );
};
