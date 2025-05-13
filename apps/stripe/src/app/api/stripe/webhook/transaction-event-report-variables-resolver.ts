import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { SaleorTransationId } from "@/modules/saleor/saleor-transaction-id";
import { TransactionEventReportInput } from "@/modules/saleor/transaction-event-reporter";
import {
  generatePaymentIntentStripeDashboardUrl,
  generateRefundStripeDashboardUrl,
} from "@/modules/stripe/generate-stripe-dashboard-urls";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripeRefundId } from "@/modules/stripe/stripe-refund-id";
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

  private resolvePspReference(): StripePaymentIntentId | StripeRefundId {
    switch (this.transactionResult.result) {
      case "REFUND_FAILURE":
      case "REFUND_REQUEST":
      case "REFUND_SUCCESS":
        return this.transactionResult.stripeRefundId;
      default:
        return this.transactionResult.stripePaymentIntentId;
    }
  }

  private resolveExternalUrl(): string {
    switch (this.transactionResult.result) {
      case "REFUND_FAILURE":
      case "REFUND_REQUEST":
      case "REFUND_SUCCESS":
        return generateRefundStripeDashboardUrl(
          this.transactionResult.stripeRefundId,
          this.transactionResult.stripeEnv,
        );
      default:
        return generatePaymentIntentStripeDashboardUrl(
          this.transactionResult.stripePaymentIntentId,
          this.transactionResult.stripeEnv,
        );
    }
  }

  resolveEventReportVariables(): TransactionEventReportInput {
    return {
      transactionId: this.saleorTransactionId,
      amount: this.saleorMoney,
      type: this.transactionResult.result,
      message: this.transactionResult.message,
      time: this.timestamp.toISOString(),
      pspReference: this.resolvePspReference(),
      actions: this.transactionResult.actions,
      externalUrl: this.resolveExternalUrl(),
    };
  }
}
