import { Text } from "@saleor/macaw-ui/next";

import logo from "./contentful-logo.svg";
import { CMSProviderMeta } from "../cms-provider-meta";

export const Contentful = {
  formSideInfo: <Text>App will save each variant with the same ID as variant ID.</Text>,
  type: "contentful" as const,
  logoUrl: logo.src as string,
  displayName: "Contentful",
  description:
    "More than a headless CMS, Contentful is the API-first composable content platform to create, manage and publish content on any digital channel.",
} satisfies CMSProviderMeta;
