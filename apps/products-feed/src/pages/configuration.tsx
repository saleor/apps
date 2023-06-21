import { NextPage } from "next";
import React from "react";

import { useChannelsExistenceChecking } from "../modules/app-configuration/channels/use-channels-existence-checking";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { AppSection } from "../modules/ui/app-section";
import { Paragraph } from "../modules/ui/paragraph";
import { TextLink } from "@saleor/apps-ui";
import { ConnectedS3ConfigurationForm } from "../modules/app-configuration/s3-configuration-form";
import { ChannelsConfigAccordion } from "../modules/app-configuration/channels-config-accordion";
import { useRouter } from "next/router";
import { CategoryMappingPreview } from "../modules/category-mapping/ui/category-mapping-preview";

const ConfigurationPage: NextPage = () => {
  useChannelsExistenceChecking();
  const { push } = useRouter();

  return (
    <Box>
      <Box __marginBottom="100px">
        <Text
          variant={"hero"}
          size={"medium"}
          as={"h1"}
          marginBottom={5}
          data-testid={"root-heading"}
        >
          Configuration
        </Text>
        <Paragraph>
          Configure app to enable Product Feed, that{" "}
          <TextLink
            newTab
            href={"https://www.google.com/intl/en_en/retail/solutions/merchant-center/"}
          >
            Google Merchant Center
          </TextLink>{" "}
          can consume
        </Paragraph>
        <Text>
          Check{" "}
          <TextLink href={"https://support.google.com/merchants/answer/1219255"} newTab>
            this article how to configure feed
          </TextLink>
        </Text>
      </Box>
      <AppSection
        data-testid={"s3-configuration-section"}
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
            <Paragraph size={"small"}>
              Read about generating AWS credentials{" "}
              <TextLink
                href={
                  "https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html"
                }
                newTab
              >
                here
              </TextLink>
            </Paragraph>
          </Box>
        }
      />
      <AppSection
        data-testid={"channels-configuration-section"}
        __marginBottom="100px"
        includePadding
        heading={"Channels configuration"}
        mainContent={
          <Box>
            <ChannelsConfigAccordion />
          </Box>
        }
        sideContent={
          <Box>
            <Paragraph size={"small"}>App will generate separate feed for each channel</Paragraph>
            <Paragraph size={"small"}>
              Provide your storefront homepage URL and product template. Use following placeholders:
            </Paragraph>
            <ul>
              <li>
                <Text size={"small"}>
                  <code>{"{productSlug}"}</code> - to inject slug of the product
                </Text>
              </li>
              <li>
                <Text size={"small"}>
                  <code>{"{variantId}"}</code> - to inject id of the variant
                </Text>
              </li>
              <li>
                <Text size={"small"}>
                  <code>{"{productId}"}</code> - to inject id of the product
                </Text>
              </li>
            </ul>
            <Paragraph size={"small"}>For example following pattern:</Paragraph>
            <Paragraph size={"small"}>
              <code>{"https://my-shop.com/p/{productSlug}/{variantId}"}</code>
            </Paragraph>
            <Paragraph size={"small"}>Will produce:</Paragraph>
            <Paragraph size={"small"}>
              <code>{"https://my-shop.com/p/t-shirt/Xyp2asZ"}</code>
            </Paragraph>
          </Box>
        }
      />
      <AppSection
        data-testid={"categories-mapping-section"}
        __marginBottom="100px"
        includePadding
        heading={"Categories mapping"}
        mainContent={
          <Box>
            <CategoryMappingPreview />
            <Box display={"flex"} justifyContent={"flex-end"}>
              <Button marginTop={5} onClick={() => push("/categories")}>
                Map categories
              </Button>
            </Box>
          </Box>
        }
        sideContent={
          <Box>
            <Paragraph size={"small"}>
              Map Saleor categories to pre-defined Google categories. It is not required.{" "}
              <TextLink newTab href={"https://support.google.com/merchants/answer/6324436?hl=en"}>
                Read more
              </TextLink>
            </Paragraph>
          </Box>
        }
      />
    </Box>
  );
};

export default ConfigurationPage;
