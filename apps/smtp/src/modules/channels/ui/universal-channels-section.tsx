import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, ProductsIcons, Switch, TableEditIcon, Text } from "@saleor/macaw-ui";
import { Multiselect } from "@saleor/react-hook-form-macaw";
import { Controller, useForm } from "react-hook-form";

import { BoxFooter } from "../../../components/box-footer";
import { BoxWithBorder } from "../../../components/box-with-border";
import { SectionWithDescription } from "../../../components/section-with-description";
import { defaultPadding } from "../../../components/ui-defaults";
import { trpcClient } from "../../trpc/trpc-client";
import {
  ChannelConfiguration,
  UpdateChannelsInput,
  updateChannelsInputSchema,
} from "../channel-configuration-schema";
import { AssignedChannelsMessage } from "./assigned-channels-message";

interface UniversalChannelsSectionProps {
  configurationId: string;
  channelConfiguration: ChannelConfiguration;
  onSubmit: (formData: UpdateChannelsInput) => void;
}

export const UniversalChannelsSection = ({
  configurationId,
  channelConfiguration,
  onSubmit,
}: UniversalChannelsSectionProps) => {
  const { handleSubmit, control, register } = useForm<UpdateChannelsInput>({
    defaultValues: {
      id: configurationId,
      ...channelConfiguration,
    },
    resolver: zodResolver(updateChannelsInputSchema),
  });

  const { data: channels } = trpcClient.channels.fetch.useQuery();

  return (
    <SectionWithDescription
      title="Channels"
      description={
        <>
          <Text as="p">
            By default, provider will work for every channel. You can change this behavior with
            excluding or including strategy.
          </Text>
          <Text as="p">
            <Text size={4} fontWeight="bold">
              Excluding
            </Text>{" "}
            - all current channels and new created channels will work, excluding selected
          </Text>
          <Text as="p">
            <Text size={4} fontWeight="bold">
              Including
            </Text>{" "}
            - only selected channels will work, new created channels will not work
          </Text>
        </>
      }
    >
      <form
        onSubmit={handleSubmit((data, event) => {
          onSubmit(data);
        })}
      >
        <BoxWithBorder>
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={defaultPadding}>
            <Box display="flex" flexDirection="column" gap={defaultPadding}>
              <Text size={5} fontWeight="bold">
                Current behavior
              </Text>
              <AssignedChannelsMessage
                availableChannels={channels?.map((channel) => channel.slug) || []}
                channelConfiguration={channelConfiguration}
              />
              <Text size={5} fontWeight="bold">
                Settings
              </Text>
              <label>
                <input type="checkbox" {...register("override")} />
                <Text paddingLeft={defaultPadding}>Override channels</Text>
              </label>

              <Controller
                name="mode"
                control={control}
                render={({ field: { onChange } }) => (
                  <Switch
                    defaultValue={channelConfiguration.mode}
                    __maxWidth="max-content"
                    onValueChange={onChange}
                  >
                    <Switch.Item id="1" value="restrict">
                      <Box display="flex" alignItems="center" gap={1}>
                        <TableEditIcon size="medium" />
                        <Text>Include</Text>
                      </Box>
                    </Switch.Item>
                    <Switch.Item id="2" value="exclude">
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProductsIcons size="medium" />
                        <Text>Exclude</Text>
                      </Box>
                    </Switch.Item>
                  </Switch>
                )}
              />
              <Multiselect
                control={control}
                label="Channels"
                size="large"
                name="channels"
                options={
                  channels?.map((channel) => ({
                    label: channel.name,
                    value: channel.slug,
                  })) || []
                }
              />
            </Box>
          </Box>
          <BoxFooter>
            <Button type="submit">Save provider</Button>
          </BoxFooter>
        </BoxWithBorder>
      </form>
    </SectionWithDescription>
  );
};
