import { SaleorMoney } from "@/modules/saleor/saleor-money";
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
  RefundFailureResult,
  RefundRequestResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";
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
  | CancelSuccessResult
  | RefundSuccessResult
  | RefundFailureResult
  | RefundRequestResult;

export class TransactionEventReportVariablesResolver {
  readonly saleorTransactionId: SaleorTransationId;
  readonly timestamp: Date;
  readonly transactionResult: WebhookTransactionResult;
  readonly saleorMoney: SaleorMoney;

  constructor(args: {
    saleorTransactionId: SaleorTransationId;
    timestamp: Date;
    transactionResult: WebhookTransactionResult;
    saleorMoney: SaleorMoney;
  }) {
    this.timestamp = args.timestamp;
    this.saleorTransactionId = args.saleorTransactionId;
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
  }

  resolveEventReportVariables(): TransactionEventReportInput {
    return {
      transactionId: this.saleorTransactionId,
      amount: this.saleorMoney,
      type: this.transactionResult.result,
      message: this.transactionResult.message,
      time: this.timestamp.toISOString(),
      pspReference: this.transactionResult.stripePaymentIntentId,
      actions: this.transactionResult.actions,
      externalUrl: generateStripeDashboardUrl(
        this.transactionResult.stripePaymentIntentId,
        this.transactionResult.stripeEnv,
      ),
    };
  }
}
