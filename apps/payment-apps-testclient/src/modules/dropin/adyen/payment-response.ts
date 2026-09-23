import { type z } from "zod";

import type { InitalizeTransactionSchema } from "../schemas/initalize-transaction";

export class AdyenPaymentResponse {
  private constructor(
    private transaction: z.infer<
      typeof InitalizeTransactionSchema
    >["transactionInitialize"]["transaction"],
    private paymentResponse: z.infer<
      typeof InitalizeTransactionSchema
    >["transactionInitialize"]["data"]["paymentResponse"],
  ) {}

  static createFromTransactionInitalize(data: z.infer<typeof InitalizeTransactionSchema>) {
    return new AdyenPaymentResponse(
      data.transactionInitialize.transaction,
      data.transactionInitialize.data.paymentResponse,
    );
  }

  getSaleorTransactionId() {
    return this.transaction.id;
  }

  getAction() {
    return this.paymentResponse.action;
  }

  isRedirectOrAdditionalActionFlow() {
    return this.getAction() !== undefined;
  }

  isSuccessful() {
    return ["Authorised", "Pending", "Received"].includes(this.paymentResponse.resultCode);
  }

  isCancelled() {
    return this.paymentResponse.resultCode === "Cancelled";
  }

  isError() {
    return this.paymentResponse.resultCode === "Error";
  }

  isRefused() {
    return this.paymentResponse.resultCode === "Refused";
  }

  getPaymentResponse() {
    return this.paymentResponse;
  }

  hasOrderWithRemainingAmount() {
    return (
      this.paymentResponse.order?.remainingAmount &&
      this.paymentResponse.order?.remainingAmount?.value !== 0
    );
  }
}
