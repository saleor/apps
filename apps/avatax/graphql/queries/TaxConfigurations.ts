import { graphql } from "gql.tada";

import { ChannelFragment } from "../fragments/Channel";
import { TaxConfigurationFragment } from "../fragments/TaxConfigurationFragment";

export const TaxConfigurationsListQuery = graphql(
  `
    query TaxConfigurationsList(
      $before: String
      $after: String
      $first: Int
      $last: Int
      $filter: TaxConfigurationFilterInput
    ) {
      taxConfigurations(
        before: $before
        after: $after
        first: $first
        last: $last
        filter: $filter
      ) {
        edges {
          node {
            ...TaxConfiguration
            __typename
          }
          __typename
        }
        __typename
      }
    }
  `,
  [TaxConfigurationFragment],
);
