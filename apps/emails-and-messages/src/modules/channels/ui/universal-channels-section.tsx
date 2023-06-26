import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, ProductsIcons, Switch, TableEditIcon, Text } from "@saleor/macaw-ui/next";
import { Multiselect } from "@saleor/react-hook-form-macaw";
import { defaultPadding } from "../../../components/ui-defaults";
import { trpcClient } from "../../trpc/trpc-client";
import { Controller, useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssignedChannelsMessage } from "./assigned-channels-message";
import {
  ChannelConfiguration,
  UpdateChannelsInput,
  updateChannelsInputSchema,
} from "../channel-configuration-schema";

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
            <Text variant="bodyStrong">Excluding</Text> - all current channels and new created
            channels will work, excluding selected
          </Text>
          <Text as="p">
            <Text variant="bodyStrong">Including</Text> - only selected channels will work, new
            created channels will not work
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
              <Text variant="heading">Current behaviour</Text>
              <AssignedChannelsMessage
                availableChannels={channels?.map((channel) => channel.slug) || []}
                channelConfiguration={channelConfiguration}
              />
              <Text variant="heading">Settings</Text>
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
                    onValueChange={(e) => onChange(e as "exclude" | "restrict")}
                  >
                    <Switch.Item id="1" value="restrict">
                      <TableEditIcon size="medium" />
                      <Text>Include</Text>
                    </Switch.Item>
                    <Switch.Item id="2" value="exclude">
                      <ProductsIcons size="medium" />
                      <Text>Exclude</Text>
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
