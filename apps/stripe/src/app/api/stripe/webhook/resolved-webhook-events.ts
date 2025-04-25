import { PaymentIntentResult } from "@/modules/saleor/payment-intent-result/types";
import { TransactionEventReportInput } from "@/modules/saleor/transaction-event-reporter";

export class TransactionResult {
  readonly saleorTransactionId: string;
  readonly date: Date;
  readonly appResult: PaymentIntentResult;

  constructor(args: { saleorTransactionId: string; date: Date; appResult: PaymentIntentResult }) {
    this.date = args.date;
    this.saleorTransactionId = args.saleorTransactionId;
    this.appResult = args.appResult;
  }

  getTransactionEventReportVariables(): TransactionEventReportInput {
    return {
      transactionId: this.saleorTransactionId,
      amount: this.appResult.saleorMoney,
      type: this.appResult.result,
      message: this.appResult.message,
      time: this.date.toISOString(),
      pspReference: this.appResult.stripePaymentIntentId,
      // TODO: add actions here
    };
  }
}
