import { Client } from "urql";

import { BaseError } from "@/error";
import { createLogger } from "@/logger";

import {
  UpdatePublicMetadataDocument,
  UpdatePublicMetadataMutation,
  UpdatePublicMetadataMutationVariables,
} from "../../../generated/graphql";

const PROVIDER_ORDER_ID_KEY = "avataxId";

export class OrderMetadataManager {
  private privateOrderIdKey = PROVIDER_ORDER_ID_KEY;
  private logger = createLogger("OrderMetadataManager");

  static BaseError = BaseError.subclass("OrderMetadataManagerError");
  static MutationError = OrderMetadataManager.BaseError.subclass(
    "OrderMetadataManagerMutationError",
  );

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
    const { error, data } = await this.client
      .mutation<UpdatePublicMetadataMutation>(UpdatePublicMetadataDocument, variables)
      .toPromise();

    const gqlErrors = data?.updateMetadata?.errors ?? [];

    const errorToReport = error ?? gqlErrors[0] ?? null;

    if (errorToReport) {
      const error = new OrderMetadataManager.MutationError(
        errorToReport.message ?? "Failed to update metadata",
        {
          props: {
            error: errorToReport,
          },
        },
      );

      this.logger.error("Failed to update metadata", {
        error,
      });

      throw new OrderMetadataManager.MutationError("Failed to update metadata", {
        props: { error },
      });
    }

    return { ok: true };
  }
}
