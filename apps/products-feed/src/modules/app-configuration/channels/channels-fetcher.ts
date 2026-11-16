import { type Client } from "urql";

import { FetchChannelsDocument } from "../../../../generated/graphql";

export class ChannelsFetcher {
  constructor(private client: Client) {}

  fetchChannels() {
    return this.client
      .query(FetchChannelsDocument, {})
      .toPromise()
      .then((r) => r.data?.channels ?? null);
  }
}
