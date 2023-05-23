import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { Response } from "./avatax-order-fulfilled-adapter";

export class AvataxOrderFulfilledResponseTransformer {
  transform(response: TransactionModel): Response {
    return { ok: true };
  }
}
