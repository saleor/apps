import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";

export class AvataxOrderConfirmedResponseTransformer {
  transform(response: TransactionModel): CreateOrderResponse {
    return {
      id: taxProviderUtils.resolveOptionalOrThrow(
        response.code,
        "Could not update the order metadata with AvaTax transaction code because it was not returned from the createTransaction mutation.",
      ),
    };
  }
}
