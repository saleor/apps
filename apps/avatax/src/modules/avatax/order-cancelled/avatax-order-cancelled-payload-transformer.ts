import { z } from "zod";
import { OrderCancelledPayload } from "../../webhooks/payloads/order-cancelled-payload";
import { AvataxOrderCancelledTarget } from "./avatax-order-cancelled-adapter";

export class AvataxOrderCancelledPayloadTransformer {
  constructor() {}

  transform(avataxId: string, companyCode: string): AvataxOrderCancelledTarget {
    const transactionCode = z.string().min(1).parse(avataxId);

    return {
      transactionCode,
      companyCode: companyCode,
    };
  }
}
