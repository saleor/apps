import { CriticalError } from "../../../error";
import { Logger, createLogger } from "../../../lib/logger";
import { OrderRefundedPayload } from "../../../pages/api/webhooks/order-refunded";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { RefundTransactionParams } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { AvataxDocumentCodeResolver } from "../avatax-document-code-resolver";
import { AvataxAddressResolver } from "../order-confirmed/avatax-address-resolver";
import { AvataxOrderRefundedLinesTransformer } from "./avatax-order-refunded-transformer";

export class AvataxOrderRefundedPayloadTransformer {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({ name: "AvataxOrderRefundedPayloadTransformer" });
  }

  transform(payload: OrderRefundedPayload, avataxConfig: AvataxConfig): RefundTransactionParams {
    this.logger.debug(
      { payload },
      "Transforming the Saleor payload for refunding order with AvaTax...",
    );

    const addressResolver = new AvataxAddressResolver();
    const linesTransformer = new AvataxOrderRefundedLinesTransformer();
    const documentCodeResolver = new AvataxDocumentCodeResolver();

    const order = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
      payload.transaction?.sourceObject,
      new CriticalError("Order not found in transaction"),
    );

    const addresses = addressResolver.resolve({
      from: avataxConfig.address,
      to: order.shippingAddress,
    });
    const lines = linesTransformer.transform(payload);
    const customerCode = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
      order.user?.id,
      new CriticalError("Missing user id in order"),
    );
    const code = documentCodeResolver.resolve({
      avataxDocumentCode: order.avataxDocumentCode,
      orderId: order.id,
    });

    return {
      code,
      lines,
      customerCode,
      addresses,
      date: new Date(),
      companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
    };
  }
}
