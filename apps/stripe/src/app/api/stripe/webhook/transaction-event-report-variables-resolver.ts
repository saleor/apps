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
    isLive: boolean;
  }) {
    this.date = args.date;
    this.saleorTransactionId = args.saleorTransactionId;
    this.transactionResult = args.transactionResult;
  }

  /*
   * todo add test to check this
   * todo check if urls are correct
   */
  private createExternalReference() {
    switch (this.transactionResult.stripeEnv) {
      case "LIVE":
        return `https://dashboard.stripe.com/payments/${encodeURIComponent(
          this.transactionResult.stripePaymentIntentId,
        )}`;
      case "TEST":
        return `https://dashboard.stripe.com/test/payments/${encodeURIComponent(
          this.transactionResult.stripePaymentIntentId,
        )}`;
    }
  }

  resolveEventReportVariables(): TransactionEventReportInput {
    return {
      transactionId: this.saleorTransactionId,
      amount: this.transactionResult.saleorMoney,
      type: this.transactionResult.result,
      message: this.transactionResult.message,
      time: this.date.toISOString(),
      pspReference: this.transactionResult.stripePaymentIntentId,
      // @ts-expect-error TODO: this is a workaround for the type error - remove after we update app-sdk
      actions: this.transactionResult.actions,
      externalReference: this.createExternalReference(),
    };
  }
}
