import { z } from "zod";
import { OrderCancelledPayload } from "../../webhooks/payloads/order-cancelled-payload";
import { AvataxOrderCancelledTarget } from "./avatax-order-cancelled-adapter";

export class AvataxOrderCancelledPayloadTransformer {
  constructor() {}

  transform({ order }: OrderCancelledPayload, companyCode: string): AvataxOrderCancelledTarget {
    if (!order) {
      throw new Error("Order is required");
    }

    const transactionCode = z.string().min(1).parse(order.avataxId);

    return {
      transactionCode,
      companyCode: companyCode,
    };
  }
}
