import {
  TransactionRefundRequestedSyncFailure,
  TransactionRefundRequestedSyncSuccess,
} from "@/generated/app-webhooks-types/transaction-refund-requested";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { SuccessWebhookResponse } from "../saleor-webhook-responses";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: RefundSuccessResult;
  readonly atobaraiTransactionId: AtobaraiTransactionId;

  constructor(args: {
    transactionResult: RefundSuccessResult;
    atobaraiTransactionId: AtobaraiTransactionId;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.atobaraiTransactionId = args.atobaraiTransactionId;
  }

  getResponse(): Response {
    const typeSafeResponse: TransactionRefundRequestedSyncSuccess = {
      result: this.transactionResult.result,
      actions: this.transactionResult.actions,
      message: "Successfully processed NP Atobarai transaction refund",
      pspReference: this.atobaraiTransactionId,
    };

    return Response.json(typeSafeResponse, {
      status: this.statusCode,
    });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: RefundFailureResult;

  constructor(args: { transactionResult: RefundFailureResult }) {
    super();
    this.transactionResult = args.transactionResult;
  }

  getResponse(): Response {
    const typeSafeResponse: TransactionRefundRequestedSyncFailure = {
      result: this.transactionResult.result,
      actions: this.transactionResult.actions,
      message: "Failed to process NP Atobarai transaction refund",
    };

    return Response.json(typeSafeResponse, {
      status: this.statusCode,
    });
  }
}

export const TransactionRefundRequestedUseCaseResponse = {
  Success,
  Failure,
};

export type TransactionRefundRequestedUseCaseResponse = InstanceType<
  | typeof TransactionRefundRequestedUseCaseResponse.Success
  | typeof TransactionRefundRequestedUseCaseResponse.Failure
>;
