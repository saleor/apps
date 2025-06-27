import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { TextLink } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ConnectedAttributeMappingForm } from "../modules/app-configuration/attribute-mapping-form";
import { useChannelsExistenceChecking } from "../modules/app-configuration/channels/use-channels-existence-checking";
import { ChannelsConfigAccordion } from "../modules/app-configuration/channels-config-accordion";
import { ConnectedImageConfigurationForm } from "../modules/app-configuration/image-configuration-form";
import { ConnectedS3ConfigurationForm } from "../modules/app-configuration/s3-configuration-form";
import { ConnectedTitleFormattingForm } from "../modules/app-configuration/title-formatting-form";
import { CategoryMappingPreview } from "../modules/category-mapping/ui/category-mapping-preview";
import { createS3ClientFromConfiguration } from "../modules/file-storage/s3/create-s3-client-from-configuration";
import { getFileName } from "../modules/file-storage/s3/urls-and-names";
import { fetchProductData } from "../modules/google-feed/fetch-product-data";
import { fetchShopData } from "../modules/google-feed/fetch-shop-data";
import { generateGoogleXmlFeed } from "../modules/google-feed/generate-google-xml-feed";
import { trpcClient } from "../modules/trpc/trpc-client";
import { AppSection } from "../modules/ui/app-section";
import { Paragraph } from "../modules/ui/paragraph";

const CreateFeedUi = ({ channelSlug }: { channelSlug: string }) => {
  const { appBridgeState, appBridge } = useAppBridge();
  const [started, setStarted] = useState<boolean>(false);
  const { data: appConfig } = trpcClient.appConfiguration.fetch.useQuery(undefined, {
    enabled: started,
  });
  const { notifySuccess } = useDashboardNotification();

  const { mutate: generateAndUploadFeed, data: feedResultData } =
    trpcClient.feed.generateAndUploadFeed.useMutation({
      onSuccess() {
        notifySuccess("Successfully generated feed");
        setStarted(false);
      },
    });

  useEffect(() => {
    if (!started) {
      return;
    }

    if (!appConfig) {
      return;
    }

    const channelConfig = appConfig.channelConfig[channelSlug];

    if (!channelConfig) {
      return;
    }

    // TODO: It's possible that token will expire during operation, so likely we need a server-side proxy and app token
    if (!appBridgeState?.saleorApiUrl || !appBridgeState?.token) {
      return;
    }

    const client = createGraphQLClient({
      token: appBridgeState?.token,
      saleorApiUrl: appBridgeState?.saleorApiUrl,
    });

    const process = async () => {
      const variants = await fetchProductData({
        client,
        channel: channelSlug,
        imageSize: appConfig.imageSize,
      });

      generateAndUploadFeed({
        productVariants: variants,
        channelSlug: channelSlug,
      });
    };

    void process();
  }, [started, appBridgeState, appConfig]);

  if (feedResultData?.downloadUrl) {
    return (
      <Box>
        <Text>Feed generated</Text>
        <a
          href={feedResultData.downloadUrl}
          onClick={() => {
            appBridge?.dispatch(
              actions.Redirect({
                newContext: true,
                to: feedResultData?.downloadUrl,
              }),
            );
          }}
          rel="noreferrer"
        >
          Open file
        </a>
      </Box>
    );
  }

  if (!started) {
    return (
      <Box>
        <Paragraph>Generate feed</Paragraph>
        <Paragraph>Do not close this page</Paragraph>
        <Button onClick={() => setStarted(true)}>Start creating feed</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Paragraph>Generating feed...</Paragraph>
    </Box>
  );
};

const GenerateInitialFeedPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const router = useRouter();

  useChannelsExistenceChecking();

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  const channelSlug = router.query["channelSlug"];

  if (!channelSlug) {
    router.push("/configuration");

    return null;
  }

  return (
    <Box>
      <AppSection
        __marginBottom="100px"
        includePadding
        heading={"Initial feed generation"}
        mainContent={<CreateFeedUi channelSlug={channelSlug as string} />}
        sideContent={
          <Box>
            <Paragraph size={3}>
              The product feed can be quite large. To ensure its created properly, you should create
              an initial generation after you first install the app, or when you create a new
              channel.
            </Paragraph>
            <Paragraph size={3}>
              Further product variant updates will be marked and updated in the feed every 3 hours
            </Paragraph>
          </Box>
        }
      />
    </Box>
  );
};

export default GenerateInitialFeedPage;
