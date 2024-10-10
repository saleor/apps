import { graphql } from "@/graphql";

export const WebhookMetadata = graphql(`
  fragment WebhookMetadata on Event {
    issuedAt
    version
  }
`);
