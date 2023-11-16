import { Box, Text } from "@saleor/macaw-ui";

import { CMSProviderMeta } from "../cms-provider-meta";
import logo from "./logo.png";
import { TextLink } from "@saleor/apps-ui";

export const PayloadCMS = {
  formSideInfo: (
    <Box>
      <Text as="p" marginBottom={2}>
        Configure the Payload CMS integration by providing required information.
      </Text>
      <Text as="p" marginBottom={2}>
        Fields are not validated - ensure you enter correct values.
      </Text>
      <Text as="p" marginBottom={2}>
        Consult{" "}
        <TextLink newTab href="https://docs.saleor.io/docs/3.x/developer/app-store/apps/cms">
          docs
        </TextLink>{" "}
        for more information how to set up Payload CMS.
      </Text>
    </Box>
  ),
  type: "payloadcms" as const,
  logoUrl: logo.src,
  displayName: "Payload",
  description: "Open source, typescript first headless CMS. GraphQL included.",
} satisfies CMSProviderMeta;
