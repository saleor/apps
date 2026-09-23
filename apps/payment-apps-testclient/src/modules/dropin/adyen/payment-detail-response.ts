import { type z } from "zod";

import { type TransactionProcessSchema } from "../schemas/transaction-process";

export class AdyenPaymentDetailResponse {
  private constructor(
    private paymentDetailsResponse: z.infer<
      typeof TransactionProcessSchema
    >["transactionProcess"]["data"]["paymentDetailsResponse"],
  ) {}

  static createFromTransactionProcess(data: z.infer<typeof TransactionProcessSchema>) {
    return new AdyenPaymentDetailResponse(data.transactionProcess.data.paymentDetailsResponse);
  }

  isRefused() {
    return this.paymentDetailsResponse.resultCode === "Refused";
  }

  getRefusalReason() {
    return this.paymentDetailsResponse.refusalReason ?? "Payment was refused by issuer";
  }

  getRawResponse() {
    return this.paymentDetailsResponse;
  }

  isSuccessful() {
    return ["Authorised", "Pending", "Received"].includes(this.paymentDetailsResponse.resultCode);
  }
}
