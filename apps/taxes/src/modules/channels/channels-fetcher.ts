import { Client } from "urql";
import {
  TaxConfigurationsListDocument,
  TaxConfigurationsListQueryVariables,
} from "../../../generated/graphql";

export class ChannelsFetcher {
  constructor(private client: Client) {}

  fetchChannels() {
    return this.client
      .query(TaxConfigurationsListDocument, {
        first: 10,
      } as TaxConfigurationsListQueryVariables)
      .toPromise()
      .then((r) => {
        return (
          r.data?.taxConfigurations?.edges
            .filter(({ node }) => node.taxCalculationStrategy === "TAX_APP")
            .map(({ node }) => node.channel) ?? []
        );
      });
  }
}
