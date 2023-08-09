import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { AvataxOrderFulfilledResponse } from "./avatax-order-fulfilled-adapter";

export class AvataxOrderFulfilledResponseTransformer {
  transform(response: TransactionModel): AvataxOrderFulfilledResponse {
    return { ok: true };
  }
}
