import { Client } from "urql";
import {
  TaxConfigurationsListDocument,
  TaxConfigurationsListQueryVariables,
} from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";

export class ChannelsFetcher {
  constructor(private client: Client) {}

  fetchChannels() {
    const logger = createLogger({ service: "ChannelsFetcher" });

    logger.fatal("fetchChannels called");

    const response = this.client
      .query(TaxConfigurationsListDocument, {
        first: 10,
      } as TaxConfigurationsListQueryVariables)
      .toPromise()
      .then((r) => {
        logger.fatal({ response: r.data }, "raw fetchChannels response");
        return (
          r.data?.taxConfigurations?.edges
            .filter(({ node }) => node.taxCalculationStrategy === "TAX_APP")
            .map(({ node }) => node.channel) ?? []
        );
      });

    logger.fatal({ response }, "filtered fetchChannels response");
    return response;
  }
}
