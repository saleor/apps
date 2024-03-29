import Avatax from "avatax";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import { ResultAsync } from "neverthrow";
import { TransactionModel } from "avatax/lib/models";
import { CalculateTaxesPayload } from "./calculate-taxes-payload";

export type CreateTransactionArgs = {
  model: CreateTransactionModel;
};

export interface IAvataxCalculateTaxesClient {
  calculateTaxes(payload: CalculateTaxesPayload): ResultAsync<any, any>;
}

export class AvataxCalculateTaxesClient implements IAvataxCalculateTaxesClient {
  constructor(private avataxSdkClient: Avatax) {}

  calculateTaxes(payload: CalculateTaxesPayload): ResultAsync<any, any> {}

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
        // todo error mapping
        new Error("AvataxCalculateTaxesClient error", {
          cause: err,
        }),
    );
  }
}
