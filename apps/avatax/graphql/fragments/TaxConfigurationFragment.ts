import { graphql } from "gql.tada";

import { ChannelFragment } from "./Channel";

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

export const TaxConfigurationFragment = graphql(
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
