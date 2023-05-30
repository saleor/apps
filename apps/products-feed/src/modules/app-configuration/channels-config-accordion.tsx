import { Accordion, Box, Button, PropsWithBox, Text } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import { trpcClient } from "../trpc/trpc-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppConfigSchema } from "./app-config";
import { z } from "zod";
import { FeedPreviewCard } from "./feed-preview-card";

type UrlConfig = z.infer<typeof AppConfigSchema.channelUrls>;

const ChannelConfigForm = ({ ...props }: PropsWithBox<{}>) => {
  const { control, handleSubmit } = useForm<UrlConfig>({
    resolver: zodResolver(AppConfigSchema.channelUrls),
  });

  return (
    <Box
      onSubmit={handleSubmit((data) => {
        // todo call mutation
      })}
      as={"form"}
      display={"grid"}
      gap={6}
      {...props}
    >
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
      <Button __width={"fit-content"}>Save channel settings</Button>
    </Box>
  );
};

export const ChannelsConfigAccordion = () => {
  const { data, isLoading } = trpcClient.channels.fetch.useQuery();

  if (isLoading) {
    return null; // todo loading
  }

  return (
    <Accordion display={"grid"} gap={8}>
      {data?.map((channel) => (
        <Accordion.Item
          value={channel.id}
          borderColor={"neutralHighlight"}
          borderWidth={1}
          borderBottomStyle={"solid"}
          paddingBottom={8}
        >
          <Accordion.Trigger>
            <Text>{channel.name}</Text>
          </Accordion.Trigger>
          <Accordion.Content>
            <ChannelConfigForm margin={8} />
            <FeedPreviewCard channelSlug={channel.slug} margin={8} marginTop={12} />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};
