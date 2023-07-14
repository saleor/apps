import { Text } from "@saleor/macaw-ui/next";

import logo from "./builder-logo.svg";
import { CMSProviderMeta } from "../cms-provider-meta";

export const BuilderIo = {
  formSideInfo: <Text>todo</Text>,
  type: "builder.io" as const,
  logoUrl: logo.src as string,
  displayName: "Builder.io",
  description:
    "Builder.io is the only headless CMS that gives developers, marketers, and product managers the freedom they need to ship fast, flexible, multi-channel experiences without overwhelming your backlog.",
} satisfies CMSProviderMeta;
