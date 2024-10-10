import { graphql } from "@/graphql";

export const UpdatePublicMetadataMutation = graphql(`
  mutation UpdatePublicMetadata($id: ID!, $input: [MetadataInput!]!) {
    updateMetadata(id: $id, input: $input) {
      errors {
        message
        code
      }
      item {
        metadata {
          key
          value
        }
      }
    }
  }
`);
