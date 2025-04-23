import { err, ok } from "neverthrow";
import { Client } from "urql";

import { BaseError } from "@/lib/errors";

import { FetchChannelsDocument } from "../../../generated/graphql";

/**
 * Shared with Avatax, consider moving common services to package
 */
export class ChannelsFetcher {
  static FetchError = BaseError.subclass("FetchError", {
    props: {
      _internalName: "ChannelsFetcher.FetchError",
    },
  });

  readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async fetchChannels() {
    const channelsResponse = await this.client.query(FetchChannelsDocument, {}).toPromise();

    if (channelsResponse.error) {
      return err(
        new ChannelsFetcher.FetchError("Failed to fetch channels", {
          cause: channelsResponse.error,
        }),
      );
    }

    if (channelsResponse.data?.channels) {
      return ok(channelsResponse.data.channels);
    }

    return err(new ChannelsFetcher.FetchError("Failed to fetch channels - data is missing"));
  }
}
