import { graphql } from "@/graphql";

import { CalculateTaxesEventFragment } from "../fragments/CalculateTaxesEvent";

export const CalculateTaxesSubscription = graphql(
  `
    subscription CalculateTaxes {
      event {
        ...CalculateTaxesEvent
      }
    }
  `,
  [CalculateTaxesEventFragment],
);
