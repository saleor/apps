import { Box, Text } from "@saleor/macaw-ui/next";

import { CMSProviderMeta } from "../cms-provider-meta";
import logo from "./logo.png";

export const PayloadCMS = {
  formSideInfo: (
    <Box>
      <Text as="p" marginBottom={2}>
        todo
      </Text>
    </Box>
  ),
  type: "payloadcms" as const,
  logoUrl: logo.src,
  displayName: "Payload",
  description: "todo",
} satisfies CMSProviderMeta;
