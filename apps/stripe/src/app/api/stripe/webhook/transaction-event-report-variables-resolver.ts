import { SaleorTransationId } from "@/modules/saleor/saleor-transaction-id";
import { TransactionEventReportInput } from "@/modules/saleor/transaction-event-reporter";
import { TransactionResult } from "@/modules/transaction-result/types";

export class TransactionEventReportVariablesResolver {
  readonly saleorTransactionId: SaleorTransationId;
  readonly date: Date;
  readonly transactionResult: TransactionResult;

  constructor(args: {
    saleorTransactionId: SaleorTransationId;
    date: Date;
    transactionResult: TransactionResult;
  }) {
    this.date = args.date;
    this.saleorTransactionId = args.saleorTransactionId;
    this.transactionResult = args.transactionResult;
  }

  resolveEventReportVariables(): TransactionEventReportInput {
    return {
      transactionId: this.saleorTransactionId,
      amount: this.transactionResult.saleorMoney,
      type: this.transactionResult.result,
      message: this.transactionResult.message,
      time: this.date.toISOString(),
      pspReference: this.transactionResult.stripePaymentIntentId,
      // TODO: add actions here
    };
  }
}
