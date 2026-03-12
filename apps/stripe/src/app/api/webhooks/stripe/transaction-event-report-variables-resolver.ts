import { type SaleorMoney } from "@/modules/saleor/saleor-money";
import { type SaleorPaymentMethodDetails } from "@/modules/saleor/saleor-payment-method-details";
import { type SaleorTransationId } from "@/modules/saleor/saleor-transaction-id";
import { type TransactionEventReportInput } from "@/modules/saleor/transaction-event-reporter";
import { type StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { type StripeRefundId } from "@/modules/stripe/stripe-refund-id";
import {
  type AuthorizationActionRequiredResult,
  type ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import { type CancelSuccessResult } from "@/modules/transaction-result/cancel-result";
import {
  type AuthorizationFailureResult,
  type ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import {
  type RefundFailureResult,
  type RefundRequestResult,
  type RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";
import {
  type AuthorizationRequestResult,
  type ChargeRequestResult,
} from "@/modules/transaction-result/request-result";
import {
  type AuthorizationSuccessResult,
  type ChargeSuccessResult,
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
  readonly stripeObjectId: StripePaymentIntentId | StripeRefundId;
  readonly externalUrl: string;
  readonly saleorPaymentMethodDetails: SaleorPaymentMethodDetails | null;

  constructor(args: {
    saleorTransactionId: SaleorTransationId;
    timestamp: Date;
    transactionResult: WebhookTransactionResult;
    saleorMoney: SaleorMoney;
    stripeObjectId: StripePaymentIntentId | StripeRefundId;
    externalUrl: string;
    paymentMethodDetails: SaleorPaymentMethodDetails | null;
  }) {
    this.timestamp = args.timestamp;
    this.saleorTransactionId = args.saleorTransactionId;
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
    this.stripeObjectId = args.stripeObjectId;
    this.externalUrl = args.externalUrl;
    this.saleorPaymentMethodDetails = args.paymentMethodDetails;
  }

  resolveEventReportVariables(): TransactionEventReportInput {
    return {
      transactionId: this.saleorTransactionId,
      amount: this.saleorMoney,
      type: this.transactionResult.result,
      message: this.transactionResult.message,
      time: this.timestamp.toISOString(),
      pspReference: this.stripeObjectId,
      actions: this.transactionResult.actions,
      externalUrl: this.externalUrl,
      saleorPaymentMethodDetailsInput:
        this.saleorPaymentMethodDetails?.toSaleorTransactionEventPayload() || null,
    };
  }
}
