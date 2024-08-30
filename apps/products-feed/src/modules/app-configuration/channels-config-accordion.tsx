import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Accordion, Box, Button, Divider, PropsWithBox, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useForm } from "react-hook-form";

import { trpcClient } from "../trpc/trpc-client";
import { AppConfigSchema, ChannelUrlsConfig } from "./app-config";
import { FeedPreviewCard } from "./feed-preview-card";

const ChannelConfigForm = ({ channelSlug, ...props }: PropsWithBox<{ channelSlug: string }>) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { data: appConfig } = trpcClient.appConfiguration.fetch.useQuery();

  const channelConfig = appConfig?.channelConfig[channelSlug];

  const { mutate } = trpcClient.appConfiguration.setChannelsUrls.useMutation({
    onSuccess() {
      notifySuccess("Success");
    },
    onError() {
      notifyError("Failed saving configuration.", "Refresh the page and try again");
    },
  });

  const { control, handleSubmit } = useForm<ChannelUrlsConfig>({
    resolver: zodResolver(AppConfigSchema.channelUrls),
    defaultValues: {
      productStorefrontUrl: channelConfig?.storefrontUrls.productStorefrontUrl ?? "",
      storefrontUrl: channelConfig?.storefrontUrls.storefrontUrl ?? "",
    },
  });

  return (
    <Box
      onSubmit={handleSubmit((data) => {
        mutate({
          urls: data,
          channelSlug,
        });
      })}
      as={"form"}
      display={"grid"}
      gap={3}
      {...props}
    >
      <Text size={5} fontWeight="bold" as={"h2"} marginBottom={1.5}>
        Configure channel URLs
      </Text>
      <Input
        label={"Storefront URL"}
        placeholder={"https://myshop.com"}
        helperText={"Public address of your storefront"}
        name={"storefrontUrl"}
        control={control}
      />
      <Input
        label={"Storefront product URL"}
        placeholder={"https://myshop.com/product/{productSlug}"}
        name={"productStorefrontUrl"}
        control={control}
        helperText={
          "Public address of your storefront product page. Use placeholder tags to inject dynamic product data"
        }
      />
      <Box display={"flex"} justifyContent={"flex-end"}>
        <Button type={"submit"} __width={"fit-content"}>
          Save channel settings
        </Button>
      </Box>
    </Box>
  );
};

export const ChannelsConfigAccordion = () => {
  const { data, isLoading } = trpcClient.channels.fetch.useQuery();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Accordion display={"grid"} gap={5}>
      {data?.map((channel) => (
        <Accordion.Item
          key={channel.id}
          value={channel.id}
          borderColor={"default1"}
          borderWidth={1}
          borderBottomStyle={"solid"}
          paddingBottom={5}
        >
          <Accordion.Trigger>
            <Text>{channel.name}</Text>
            <Accordion.TriggerButton />
          </Accordion.Trigger>
          <Accordion.Content>
            <ChannelConfigForm margin={5} channelSlug={channel.slug} />
            <Divider />
            <FeedPreviewCard channelSlug={channel.slug} margin={5} marginTop={9} />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};
