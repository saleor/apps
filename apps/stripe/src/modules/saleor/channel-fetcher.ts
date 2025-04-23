import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import { BaseError } from "@/lib/errors";

import { ChannelFragment, FetchChannelsDocument } from "../../../generated/graphql";

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

  async fetchChannels(): Promise<
    Result<ChannelFragment[], InstanceType<typeof ChannelsFetcher.FetchError>>
  > {
    const channelsResponse = await this.client.query(FetchChannelsDocument, {}).toPromise();

    if (channelsResponse.error) {
      return err(
        new ChannelsFetcher.FetchError("Failed to fetch channels", {
          cause: channelsResponse.error,
        }),
      );
    }

    if (channelsResponse.data?.channels) {
      return ok(channelsResponse.data.channels.map((c) => c));
    }

    return err(new ChannelsFetcher.FetchError("Failed to fetch channels - data is missing"));
  }
}
