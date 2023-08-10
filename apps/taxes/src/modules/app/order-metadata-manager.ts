import { Client } from "urql";
import {
  UpdatePublicMetadataDocument,
  UpdatePublicMetadataMutation,
  UpdatePublicMetadataMutationVariables,
} from "../../../generated/graphql";

const PROVIDER_ORDER_ID_KEY = "avataxId";

export class OrderMetadataManager {
  private privateOrderIdKey = PROVIDER_ORDER_ID_KEY;

  constructor(private client: Client) {}

  /**
   * We need to store the provider order id in the Saleor order metadata so that we can
   * update the provider order when the Saleor order is fulfilled.
   */
  /**
   *
   * @param orderId - Saleor order id
   * @param externalId - Provider order id
   * @deprecated - This will not be needed when we move to the new webhook flow because the transactions will be commited during OrderConfirmed
   */
  async updateOrderMetadataWithExternalId(orderId: string, externalId: string) {
    const variables: UpdatePublicMetadataMutationVariables = {
      id: orderId,
      input: [
        {
          key: this.privateOrderIdKey,
          value: externalId,
        },
      ],
    };
    const { error } = await this.client
      .mutation<UpdatePublicMetadataMutation>(UpdatePublicMetadataDocument, variables)
      .toPromise();

    if (error) {
      throw error;
    }

    return { ok: true };
  }
}
