import { Box, Text } from "@saleor/macaw-ui";

import logo from "./contentful-logo.svg";
import { CMSProviderMeta } from "../cms-provider-meta";

export const Contentful = {
  formSideInfo: (
    <Box>
      <Text as="p" marginBottom={2}>
        App will use Saleor Product Variant as a unique identifier. It will be saved as one of the
        fields. Please ensure you map Variant ID to field that is UNIQUE in Contentful.
      </Text>
      <Text>Otherwise, products may be duplicated</Text>
    </Box>
  ),
  type: "contentful" as const,
  logoUrl: logo.src as string,
  displayName: "Contentful",
  description:
    "More than a headless CMS, Contentful is the API-first composable content platform to create, manage and publish content on any digital channel.",
} satisfies CMSProviderMeta;
