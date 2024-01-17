import { CriticalError } from "../../../error";
import { createLogger } from "../../../lib/logger";
import { OrderFullyRefundedPayload } from "../../../pages/api/webhooks/order-fully-refunded";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { RefundTransactionParams } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { AvataxDocumentCodeResolver } from "../avatax-document-code-resolver";
import { resolveAvataxTransactionLineNumber } from "../avatax-line-number-resolver";
import { SHIPPING_ITEM_NUMBER } from "../calculate-taxes/avatax-calculate-taxes-adapter";

export class AvataxOrderRefundedPayloadTransformer {
  private logger = createLogger({ name: "AvataxOrderRefundedPayloadTransformer" });

  private resolveAvataxOrderRefundedLines(
    payload: OrderFullyRefundedPayload,
  ): RefundTransactionParams["lines"] {
    const grantedRefunds = payload.order?.grantedRefunds ?? [];

    const grantedRefundsLines = grantedRefunds.flatMap((refund) => refund.lines ?? []);

    const refundLines = grantedRefundsLines.map((grantedRefundLine) =>
      resolveAvataxTransactionLineNumber(grantedRefundLine.orderLine),
    );

    return [...refundLines, SHIPPING_ITEM_NUMBER];
  }

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

    const lines = this.resolveAvataxOrderRefundedLines(payload);

    const code = documentCodeResolver.resolve({
      avataxDocumentCode: order.avataxDocumentCode,
      orderId: order.id,
    });

    return {
      transactionCode: code,
      lines,
      companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
    };
  }
}
