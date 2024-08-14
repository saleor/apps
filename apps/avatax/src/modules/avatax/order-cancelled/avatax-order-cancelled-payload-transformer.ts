import { z } from "zod";

import { CancelOrderPayload } from "../../taxes/tax-provider-webhook";
import { AvataxOrderCancelledTarget } from "./avatax-order-cancelled-adapter";

export class AvataxOrderCancelledPayloadTransformer {
  constructor() {}

  transform(payload: CancelOrderPayload, companyCode: string): AvataxOrderCancelledTarget {
    const transactionCode = z.string().min(1).parse(payload.avataxId);

    return {
      transactionCode,
      companyCode: companyCode,
    };
  }
}
