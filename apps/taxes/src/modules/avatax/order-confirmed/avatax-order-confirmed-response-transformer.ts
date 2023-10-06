import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { TaxUnexpectedError } from "../../taxes/tax-error";

export class AvataxOrderConfirmedResponseTransformer {
  transform(response: TransactionModel): CreateOrderResponse {
    return {
      id: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        response.code,
        new TaxUnexpectedError(
          "Could not update the order metadata with AvaTax transaction code because it was not returned from the createTransaction mutation.",
        ),
      ),
    };
  }
}
