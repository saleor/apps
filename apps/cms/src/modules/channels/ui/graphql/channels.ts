import { gql } from "urql";

export const channelFragment = gql`
  fragment Channel on Channel {
    id
    slug
    name
  }
`;

export const channels = gql`
  ${channelFragment}
  query channels {
    channels {
      ...Channel
    }
  }
`;
