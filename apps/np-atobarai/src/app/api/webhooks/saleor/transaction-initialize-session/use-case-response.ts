import { z } from "zod";

import {
  TransactionSessionActionRequired,
  TransactionSessionFailure,
  TransactionSessionSuccess,
} from "@/generated/app-webhooks-types/transaction-initialize-session";
import {
  AtobaraiFailureTransaction,
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

  private static ResponseDataSchema = z.object({
    transactionRegister: z.object({
      translatedMessage: z.string(),
    }),
  });

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
      data: Success.ResponseDataSchema.parse({
        transactionRegister: {
          translatedMessage: this.atobaraiTransaction.getPublicTranslatedMessage(),
        },
      }),
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
  readonly error?: AtobaraiApiErrors;
  readonly atobaraiTransaction?: AtobaraiFailureTransaction;

  private static ResponseDataSchema = z.object({
    transactionRegister: z.object({
      translatedMessage: z.string().optional(),
      errors: z
        .array(
          z.object({
            code: z.literal(AtobaraiApiClientRegisterTransactionErrorPublicCode),
            message: z.string(),
          }),
        )
        .optional(),
    }),
  });

  constructor(args: {
    transactionResult: ChargeFailureResult;
    error?: AtobaraiApiErrors;
    atobaraiTransaction?: AtobaraiFailureTransaction;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.error = args.error;
    this.atobaraiTransaction = args.atobaraiTransaction;
  }

  getResponse(): Response {
    const typeSafeResponse: TransactionSessionFailure = {
      data: Failure.ResponseDataSchema.parse({
        transactionRegister: {
          translatedMessage: this.atobaraiTransaction?.getPublicTranslatedMessage(),
          errors: [
            {
              code: this.error?.publicCode,
              message: this.error?.publicMessage,
            },
          ],
        },
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
