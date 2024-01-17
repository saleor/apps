import { CriticalError } from "../../../error";
import { createLogger } from "../../../lib/logger";
import { OrderFullyRefundedPayload } from "../../../pages/api/webhooks/order-fully-refunded";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { RefundTransactionParams } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { AvataxDocumentCodeResolver } from "../avatax-document-code-resolver";

export class AvataxOrderRefundedPayloadTransformer {
  private logger = createLogger({ name: "AvataxOrderRefundedPayloadTransformer" });

  transform(
    payload: OrderFullyRefundedPayload,
    avataxConfig: AvataxConfig,
  ): RefundTransactionParams {
    this.logger.debug(
      { payload },
      "Transforming the Saleor payload for refunding order with AvaTax...",
    );

    const order = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
      payload.order,
      new CriticalError("Order not found in payload"),
    );

    const documentCodeResolver = new AvataxDocumentCodeResolver();

    const code = documentCodeResolver.resolve({
      avataxDocumentCode: order.avataxDocumentCode,
      orderId: order.id,
    });

    return {
      transactionCode: code,
      companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
    };
  }
}
