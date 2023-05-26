import { NextPage } from "next";
import React from "react";

import { useChannelsExistenceChecking } from "../modules/channels/use-channels-existence-checking";
import { Box, Text } from "@saleor/macaw-ui/next";
import { AppSection } from "../modules/ui/app-section";
import { Paragraph } from "../modules/ui/paragraph";
import { TextLink } from "@saleor/apps-ui";
import {
  ConnectedS3ConfigurationForm,
  S3ConfigurationForm,
} from "../modules/app-configuration/ui/s3-configuration-form";

// todo extract instructions to component, move descriptions to columns
const ConfigurationPage: NextPage = () => {
  useChannelsExistenceChecking();

  return (
    <Box>
      <Box __marginBottom="100px">
        <Text variant={"hero"} size={"medium"} as={"h1"} marginBottom={8}>
          Configuration
        </Text>
        <Text as={"p"}>
          Configure app to enable Product Feed, that{" "}
          <TextLink
            newTab
            href={"https://www.google.com/intl/en_en/retail/solutions/merchant-center/"}
          >
            Google Merchant Center
          </TextLink>{" "}
          can consume
        </Text>
        <Text as={"h2"} variant={"heading"} marginTop={4}>
          Storefront URL
        </Text>
        <Text as={"p"}>
          Provide your storefront homepage URL and product template. Use{" "}
          <code>{"{productSlug}"}</code> string to mark product in the URL
        </Text>
      </Box>
      <AppSection
        __marginBottom="100px"
        includePadding
        heading={"AWS S3 Bucket"}
        mainContent={<ConnectedS3ConfigurationForm />}
        sideContent={
          <Box>
            <Paragraph size={"small"}>
              Your product database can be quite large. To generate a big XML file, we need to put
              it somewhere so Google can consume it. You need to generate an S3 bucket with public
              read access and provide its credentials to the app.
            </Paragraph>
            <Paragraph size={"small"}>
              Please use this bucket only for XMLs. They meant to be public - but other files may
              leak if you put them to the same bucket.
            </Paragraph>
          </Box>
        }
      />
      <AppSection
        __marginBottom="100px"
        includePadding
        heading={"Channels configuration"}
        mainContent={<Box>Channels list</Box>}
        sideContent={
          <Box>
            <Paragraph size={"small"}>App will generate separate feed for each channel</Paragraph>
          </Box>
        }
      />
      <AppSection
        __marginBottom="100px"
        includePadding
        heading={"Categories mapping"}
        mainContent={<Box>Categories form</Box>}
        sideContent={
          <Box>
            <Paragraph size={"small"}>
              Map Saleor categories to pre-defined Google categories
            </Paragraph>
          </Box>
        }
      />
    </Box>
  );
};

export default ConfigurationPage;
