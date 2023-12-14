import { CriticalError } from "../../../error";
import { Logger, createLogger } from "../../../lib/logger";
import { OrderRefundedPayload } from "../../../pages/api/webhooks/order-refunded";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { RefundTransactionParams } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { AvataxDocumentCodeResolver } from "../avatax-document-code-resolver";
import { resolveAvataxTransactionLineNumber } from "../avatax-line-number-resolver";

export class AvataxOrderRefundedPayloadTransformer {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({ name: "AvataxOrderRefundedPayloadTransformer" });
  }

  private resolveAvataxOrderRefundedLines(
    payload: OrderRefundedPayload,
  ): RefundTransactionParams["lines"] {
    const grantedRefunds = payload.order?.grantedRefunds ?? [];

    const grantedRefundsLines = grantedRefunds.flatMap((refund) => refund.lines ?? []);

    return grantedRefundsLines.map((grantedRefundLine) =>
      resolveAvataxTransactionLineNumber(grantedRefundLine.orderLine),
    );
  }

  transform(payload: OrderRefundedPayload, avataxConfig: AvataxConfig): RefundTransactionParams {
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
