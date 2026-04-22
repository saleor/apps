import { gql } from "urql";

import type { MetadataItemContext } from "./fetch-metadata-rotation-items";
import type { RotatedItem } from "./secret-key-rotation-runner";

const UpdateAppMetadataMutation = gql`
  mutation UpdateAppMetadata($id: ID!, $input: [MetadataInput!]!) {
    updatePrivateMetadata(id: $id, input: $input) {
      item {
        privateMetadata {
          key
          value
        }
      }
    }
  }
`;

export async function saveMetadataRotationItem(
  item: RotatedItem<MetadataItemContext>,
): Promise<void> {
  const { client, appId } = item.original;
  const input = Object.entries(item.reEncryptedFields).map(([key, value]) => ({ key, value }));

  const { error } = await client
    .mutation(UpdateAppMetadataMutation, { id: appId, input })
    .toPromise();

  if (error) {
    throw new Error(`Failed to save metadata: ${error.message}`);
  }
}
