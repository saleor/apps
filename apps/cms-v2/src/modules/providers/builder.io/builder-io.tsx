import { Text } from "@saleor/macaw-ui";

import logo from "./builder-logo.svg";
import { CMSProviderMeta } from "../cms-provider-meta";
import { TextLink } from "@saleor/apps-ui";

export const BuilderIo = {
  formSideInfo: (
    <Text>
      Ensure fields are properly mapped with your{" "}
      <TextLink newTab href="https://www.builder.io/c/docs/models-data">
        CMS Data Model
      </TextLink>
      .
    </Text>
  ),
  type: "builder.io" as const,
  logoUrl: logo.src as string,
  displayName: "Builder.io",
  description:
    "Builder.io is the only headless CMS that gives developers, marketers, and product managers the freedom they need to ship fast, flexible, multi-channel experiences without overwhelming your backlog.",
} satisfies CMSProviderMeta;
