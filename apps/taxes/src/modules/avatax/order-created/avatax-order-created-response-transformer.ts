import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";

export class AvataxOrderCreatedResponseTransformer {
  transform(response: TransactionModel): CreateOrderResponse {
    return {
      id: taxProviderUtils.resolveOptionalOrThrow(
        response.code,
        new Error(
          "Could not update the order metadata with Avatax transaction code because it was not returned from the createTransaction mutation."
        )
      ),
    };
  }
}
