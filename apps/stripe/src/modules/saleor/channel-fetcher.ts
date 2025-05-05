import { GraphQLClient } from "graphql-request";
import { err, ok, Result, ResultAsync } from "neverthrow";

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

  readonly client: GraphQLClient;

  constructor(client: GraphQLClient) {
    this.client = client;
  }

  async fetchChannels(): Promise<
    Result<ChannelFragment[], InstanceType<typeof ChannelsFetcher.FetchError>>
  > {
    const channelsResponse = await ResultAsync.fromPromise(
      this.client.request(FetchChannelsDocument, {}),
      (error) => BaseError.normalize(error),
    );

    if (channelsResponse.isErr()) {
      return err(
        new ChannelsFetcher.FetchError("Failed to fetch channels", {
          cause: channelsResponse.error,
        }),
      );
    }

    if (channelsResponse.value.channels) {
      return ok(channelsResponse.value.channels.map((c) => c));
    }

    return err(new ChannelsFetcher.FetchError("Failed to fetch channels - channels data missing"));
  }
}
