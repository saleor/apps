import {
  FetchOrderExternalIdDocument,
  FetchOrderExternalIdQuery,
  UpdateMetadataDocument,
  UpdateMetadataMutation,
  UpdateMetadataMutationVariables,
} from "../../../generated/graphql";
import { Client } from "urql";
import { PROVIDER_ORDER_ID_KEY } from "../avatax/order-fulfilled/avatax-order-fulfilled-payload-transformer";

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

  async readExternalIdFromOrderMetadata(orderId: string) {
    const { error, data } = await this.client
      .query<FetchOrderExternalIdQuery>(FetchOrderExternalIdDocument, { id: orderId })
      .toPromise();

    if (error) {
      throw error;
    }

    return data?.order?.externalId;
  }
}
