import { graphql } from "@/graphql";

export const UpdatePrivateMetadataMutations = graphql(`
  mutation UpdatePrivateMetadata($id: ID!, $input: [MetadataInput!]!) {
    updatePrivateMetadata(id: $id, input: $input) {
      errors {
        code
        message
      }
      item {
        privateMetadata {
          key
          value
        }
      }
    }
  }
`);
