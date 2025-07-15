import { z } from "zod";

import {
  TransactionSessionActionRequired,
  TransactionSessionFailure,
  TransactionSessionSuccess,
} from "@/generated/app-webhooks-types/transaction-initialize-session";
import {
  AtobaraiFailureTransactionError,
  AtobaraiFailureTransactionErrorPublicCode,
  AtobaraiSuccessTransaction,
} from "@/modules/atobarai/atobarai-transaction";
import {
  AtobaraiApiClientRegisterTransactionErrorPublicCode,
  AtobaraiApiErrors,
} from "@/modules/atobarai/types";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import { SuccessWebhookResponse } from "../saleor-webhook-responses";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: ChargeSuccessResult | ChargeActionRequiredResult;
  readonly atobaraiTransaction: AtobaraiSuccessTransaction;

  constructor(args: {
    transactionResult: ChargeSuccessResult | ChargeActionRequiredResult;
    atobaraiTransaction: AtobaraiSuccessTransaction;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.atobaraiTransaction = args.atobaraiTransaction;
  }

  getResponse(): Response {
    const typeSafeResponse: TransactionSessionSuccess | TransactionSessionActionRequired = {
      result: this.transactionResult.result,
      actions: this.transactionResult.actions,
      message: this.transactionResult.message,
      pspReference: this.atobaraiTransaction.getPspReference(),
    };

    return Response.json(typeSafeResponse, {
      status: this.statusCode,
    });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult;
  readonly error: AtobaraiApiErrors | InstanceType<typeof AtobaraiFailureTransactionError>;

  private static ResponseDataSchema = z.object({
    errors: z.array(
      z.object({
        code: z.union([
          z.literal(AtobaraiApiClientRegisterTransactionErrorPublicCode),
          z.literal(AtobaraiFailureTransactionErrorPublicCode),
        ]),
        message: z.string(),
      }),
    ),
  });

  constructor(args: {
    transactionResult: ChargeFailureResult;
    error: AtobaraiApiErrors | InstanceType<typeof AtobaraiFailureTransactionError>;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.error = args.error;
  }

  getResponse(): Response {
    const typeSafeResponse: TransactionSessionFailure = {
      data: Failure.ResponseDataSchema.parse({
        errors: [
          {
            code: this.error.publicCode,
            message: this.error.publicMessage,
          },
        ],
      }),
      result: this.transactionResult.result,
      actions: this.transactionResult.actions,
      message: this.transactionResult.message,
    };

    return Response.json(typeSafeResponse, {
      status: this.statusCode,
    });
  }
}

export const TransactionInitializeSessionUseCaseResponse = {
  Success,
  Failure,
};

export type TransactionInitializeSessionUseCaseResponse = InstanceType<
  | typeof TransactionInitializeSessionUseCaseResponse.Success
  | typeof TransactionInitializeSessionUseCaseResponse.Failure
>;
