import { OrderCancelledPayload } from "../../../pages/api/webhooks/order-cancelled";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxOrderCancelledTarget } from "./avatax-order-cancelled-adapter";

export class AvataxOrderCancelledPayloadTransformer {
  constructor(private readonly config: AvataxConfig) {}

  transform({ order }: OrderCancelledPayload): AvataxOrderCancelledTarget {
    if (!order) {
      throw new Error("Order is required");
    }

    const transactionCode = taxProviderUtils.resolveOptionalOrThrow(order.externalId);

    return {
      transactionCode,
      companyCode: this.config.companyCode ?? "",
    };
  }
}
