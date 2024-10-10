import { graphql, ResultOf } from "@/graphql";

export const ChannelFragment = graphql(`
  fragment Channel on Channel {
    id
    name
    slug
  }
`);

export type ChannelFragmentType = ResultOf<typeof ChannelFragment>;
