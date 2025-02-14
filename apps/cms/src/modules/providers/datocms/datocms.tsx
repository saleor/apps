import { Box, Text } from "@saleor/macaw-ui";

import { CMSProviderMeta } from "../cms-provider-meta";
import logo from "./datocms.svg";

export const Datocms = {
  formSideInfo: (
    <Box>
      <Text as="p" marginBottom={2}>
        App will use Saleor Product Variant as a unique identifier. It will be saved as one of the
        fields. Please ensure you map Variant ID to field that is UNIQUE in DatoCMS.
      </Text>
      <Text>Otherwise, products may be duplicated</Text>
    </Box>
  ),
  type: "datocms" as const,
  logoUrl: logo.src,
  displayName: "DatoCMS",
  description:
    "It's the headless CMS for the modern web. More than 25,000 businesses use DatoCMS to create online content at scale from a central hub and distribute it via API.",
} satisfies CMSProviderMeta;
