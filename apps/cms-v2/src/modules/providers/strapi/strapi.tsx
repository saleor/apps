import { Box, Text } from "@saleor/macaw-ui";

import logo from "./strapi-logo.svg";
import { CMSProviderMeta } from "../cms-provider-meta";

export const Strapi = {
  formSideInfo: (
    <Box>
      <Text as="p" marginBottom={2}>
        App will use Saleor Product Variant as a unique identifier. It will be saved as one of the
        fields. Please ensure you map Variant ID to field that is UNIQUE in Strapi.
      </Text>
      <Text>Otherwise, products may be duplicated</Text>
    </Box>
  ),
  type: "strapi" as const,
  logoUrl: logo.src as string,
  displayName: "Strapi",
  description:
    "Strapi is the leading open-source headless CMS. 100% JavaScript and fully customizable.",
} satisfies CMSProviderMeta;
