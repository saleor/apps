import { graphql } from "@/graphql";

import { TaxBaseFragment } from "./TaxBase";
import { WebhookMetadata } from "./WebhookMetadata";

export const CalculateTaxesEventFragment = graphql(
  `
    fragment CalculateTaxesEvent on Event {
      __typename
      ...WebhookMetadata
      ... on CalculateTaxes {
        taxBase {
          ...TaxBase
        }
        recipient {
          privateMetadata {
            key
            value
          }
        }
      }
    }
  `,
  [WebhookMetadata, TaxBaseFragment],
);
