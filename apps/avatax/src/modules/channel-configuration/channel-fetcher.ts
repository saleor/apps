import { Client } from "urql";

import { readFragment } from "@/graphql";

import { TaxConfigurationFragment } from "../../../graphql/fragments/TaxConfigurationFragment";
import { TaxConfigurationsListQuery } from "../../../graphql/queries/TaxConfigurations";

// TODO Why this is called ChannelsFetcher? What should it do?
export class ChannelsFetcher {
  constructor(private client: Client) {}

  fetchChannels() {
    return this.client
      .query(TaxConfigurationsListQuery, {
        /**
         * todo: add pagination
         * * arbitrary limit
         */
        first: 100,
      })
      .toPromise()
      .then((r) => {
        return (
          r.data?.taxConfigurations?.edges
            .map(({ node }) => readFragment(TaxConfigurationFragment, node))
            .filter((node) => node.taxCalculationStrategy === "TAX_APP")
            .map((node) => node.channel) ?? []
        );
      });
  }
}
