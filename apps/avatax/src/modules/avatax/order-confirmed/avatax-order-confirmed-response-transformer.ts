import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { TaxBadProviderResponseError } from "../../taxes/tax-error";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";

export class AvataxOrderConfirmedResponseTransformer {
  transform(response: TransactionModel): CreateOrderResponse {
    return {
      id: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        response.code,
        new TaxBadProviderResponseError(
          "Could not update the order metadata with AvaTax transaction code because it was not returned from the createTransaction mutation.",
        ),
      ),
    };
  }
}
