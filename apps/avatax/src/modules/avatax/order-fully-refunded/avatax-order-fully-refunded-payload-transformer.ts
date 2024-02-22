import { CriticalError } from "../../../error";
import { createLogger } from "../../../logger";
import { OrderFullyRefundedPayload } from "../../../pages/api/webhooks/order-fully-refunded";

import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { RefundTransactionParams } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { avataxData } from "../avatax-data-resolver";

export class AvataxOrderRefundedPayloadTransformer {
  private logger = createLogger("OrderRefundedPayloadTransformer");

  transform(
    payload: OrderFullyRefundedPayload,
    avataxConfig: AvataxConfig,
  ): RefundTransactionParams {
    this.logger.debug("Transforming the Saleor payload for refunding order with AvaTax...", {
      payload,
    });

    const order = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
      payload.order,
      new CriticalError("Order not found in payload"),
    );

    const code = avataxData.documentCode.resolve({
      avataxDocumentCode: order.avataxDocumentCode,
      orderId: order.id,
    });

    const refundDate = payload.issuedAt ? new Date(payload.issuedAt) : new Date();

    return {
      transactionCode: code,
      companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
      refundDate,
    };
  }
}
