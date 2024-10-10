import { graphql } from "@/graphql";

import { ChannelFragment } from "../fragments/Channel";

export const FetchSingleChannelQuery = graphql(
  `
    query FetchSingleChannel($id: ID!) {
      channel(id: $id) {
        ...Channel
      }
    }
  `,
  [ChannelFragment],
);

export const FetchChannelsQuery = graphql(
  `
    query FetchChannels {
      channels {
        ...Channel
      }
    }
  `,
  [ChannelFragment],
);
