import { AppResult } from "@/modules/app-result/types";
import { SaleorTransationId } from "@/modules/saleor/saleor-transaction-id";
import { TransactionEventReportInput } from "@/modules/saleor/transaction-event-reporter";

export class TransactionResult {
  readonly saleorTransactionId: SaleorTransationId;
  readonly date: Date;
  readonly appResult: AppResult;

  constructor(args: { saleorTransactionId: SaleorTransationId; date: Date; appResult: AppResult }) {
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
