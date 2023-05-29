import { CreateOrderRes } from "taxjar/dist/types/returnTypes";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";

export class TaxJarOrderCreatedResponseTransformer {
  transform(response: CreateOrderRes): CreateOrderResponse {
    return {
      id: response.order.transaction_id,
    };
  }
}
