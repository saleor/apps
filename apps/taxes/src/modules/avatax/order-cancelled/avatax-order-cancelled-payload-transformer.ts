import { z } from "zod";
import { OrderCancelledPayload } from "../../../pages/api/webhooks/order-cancelled";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxOrderCancelledTarget } from "./avatax-order-cancelled-adapter";

export class AvataxOrderCancelledPayloadTransformer {
  constructor(private readonly config: AvataxConfig) {}

  transform({ order }: OrderCancelledPayload): AvataxOrderCancelledTarget {
    if (!order) {
      throw new Error("Order is required");
    }

    const transactionCode = z.string().min(1).parse(order.avataxId);

    return {
      transactionCode,
      companyCode: this.config.companyCode ?? "", // If companyCode is not defined, we set the value to empty string so that the default company is used.
    };
  }
}
