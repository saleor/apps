import { SaleorTransationId } from "@/modules/saleor/saleor-transaction-id";
import { TransactionEventReportInput } from "@/modules/saleor/transaction-event-reporter";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import { CancelSuccessResult } from "@/modules/transaction-result/cancel-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import {
  AuthorizationRequestResult,
  ChargeRequestResult,
} from "@/modules/transaction-result/request-result";
import {
  AuthorizationSuccessResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/success-result";

type WebhookTransactionResult =
  | ChargeSuccessResult
  | AuthorizationSuccessResult
  | ChargeActionRequiredResult
  | AuthorizationActionRequiredResult
  | ChargeRequestResult
  | AuthorizationRequestResult
  | ChargeFailureResult
  | AuthorizationFailureResult
  | CancelSuccessResult;

export class TransactionEventReportVariablesResolver {
  readonly saleorTransactionId: SaleorTransationId;
  readonly date: Date;
  readonly transactionResult: WebhookTransactionResult;

  constructor(args: {
    saleorTransactionId: SaleorTransationId;
    date: Date;
    transactionResult: WebhookTransactionResult;
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
      actions: this.transactionResult.actions,
      externalReference: generateStripeDashboardUrl(
        this.transactionResult.stripePaymentIntentId,
        this.transactionResult.stripeEnv,
      ),
    };
  }
}
