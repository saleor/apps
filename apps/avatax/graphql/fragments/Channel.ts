import { graphql } from "@/graphql";

export const ChannelFragment = graphql(`
  fragment Channel on Channel {
    id
    name
    slug
  }
`);
