import { graphql, ResultOf } from "@/graphql";

export const MetadataItemFragment = graphql(`
  fragment MetadataItem on MetadataItem {
    key
    value
  }
`);

export type MetadataItemFragmentType = ResultOf<typeof MetadataItemFragment>;
