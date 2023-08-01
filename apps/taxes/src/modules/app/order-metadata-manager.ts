import { Client } from "urql";
import {
  UpdateMetadataDocument,
  UpdateMetadataMutation,
  UpdateMetadataMutationVariables,
} from "../../../generated/graphql";

const PROVIDER_ORDER_ID_KEY = "avataxId";

export class OrderMetadataManager {
  private privateOrderIdKey = PROVIDER_ORDER_ID_KEY;

  constructor(private client: Client) {}

  /**
   * We need to store the provider order id in the Saleor order metadata so that we can
   * update the provider order when the Saleor order is fulfilled.
   */
  async updateOrderMetadataWithExternalId(orderId: string, externalId: string) {
    const variables: UpdateMetadataMutationVariables = {
      id: orderId,
      input: [
        {
          key: this.privateOrderIdKey,
          value: externalId,
        },
      ],
    };
    const { error } = await this.client
      .mutation<UpdateMetadataMutation>(UpdateMetadataDocument, variables)
      .toPromise();

    if (error) {
      throw error;
    }

    return { ok: true };
  }
}
