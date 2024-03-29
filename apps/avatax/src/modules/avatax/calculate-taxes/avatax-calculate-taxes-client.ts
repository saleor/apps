import Avatax from "avatax";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import { err, ResultAsync } from "neverthrow";
import { BaseError } from "../../../error";

export type CreateTransactionArgs = {
  model: CreateTransactionModel;
};

export interface IAvataxCalculateTaxesClient {
  calculateTaxes(payload: CreateTransactionArgs): ResultAsync<any, any>;
}

const AvataxSdkCreateTransactionError = BaseError.subclass("AvataxSdkCreateTransactionError");

export class AvataxCalculateTaxesClient implements IAvataxCalculateTaxesClient {
  constructor(private avataxSdkClient: Avatax) {}

  calculateTaxes(payload: CreateTransactionArgs): ResultAsync<any, any> {
    return this.createTransaction({ model: payload.model }).mapErr((sdkError) => {
      // TODO Mapp errors

      return err(sdkError);
    });
  }

  private createTransaction({ model }: CreateTransactionArgs) {
    /*
     * We use createOrAdjustTransaction instead of createTransaction because
     * we must guarantee a way of idempotent update of the transaction due to the
     * migration requirements. The transaction can be created in the old flow, but committed in the new flow.
     */
    return ResultAsync.fromPromise(
      this.avataxSdkClient.createOrAdjustTransaction({
        model: { createTransactionModel: model },
      }),
      (err) =>
        new AvataxSdkCreateTransactionError("AvataxCalculateTaxesClient error", {
          cause: err,
          errors: [err],
        }),
    );
  }
}
