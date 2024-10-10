import { graphql } from "gql.tada";

import { ChannelFragment } from "../fragments/Channel";

const CountryWithCode = graphql(`
  fragment CountryWithCode on CountryDisplay {
    code
    country
    __typename
  }
`);

const TaxConfigurationPerCountryFragment = graphql(
  `
    fragment TaxConfigurationPerCountry on TaxConfigurationPerCountry {
      country {
        ...CountryWithCode
        __typename
      }
      chargeTaxes
      taxCalculationStrategy
      displayGrossPrices
      __typename
    }
  `,
  [CountryWithCode],
);

const TaxConfigurationFragment = graphql(
  `
    fragment TaxConfiguration on TaxConfiguration {
      id
      channel {
        ...Channel
      }
      displayGrossPrices
      pricesEnteredWithTax
      chargeTaxes
      taxCalculationStrategy
      countries {
        ...TaxConfigurationPerCountry
        __typename
      }
      __typename
    }
  `,
  [ChannelFragment, TaxConfigurationPerCountryFragment],
);

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
