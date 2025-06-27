import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { TextLink } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { ConnectedAttributeMappingForm } from "../modules/app-configuration/attribute-mapping-form";
import { useChannelsExistenceChecking } from "../modules/app-configuration/channels/use-channels-existence-checking";
import { ChannelsConfigAccordion } from "../modules/app-configuration/channels-config-accordion";
import { ConnectedImageConfigurationForm } from "../modules/app-configuration/image-configuration-form";
import { ConnectedS3ConfigurationForm } from "../modules/app-configuration/s3-configuration-form";
import { ConnectedTitleFormattingForm } from "../modules/app-configuration/title-formatting-form";
import { CategoryMappingPreview } from "../modules/category-mapping/ui/category-mapping-preview";
import { AppSection } from "../modules/ui/app-section";
import { Paragraph } from "../modules/ui/paragraph";

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
        mainContent={<Box>Asd</Box>}
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
