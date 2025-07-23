import { z } from "zod";

import {
  TransactionSessionActionRequired,
  TransactionSessionFailure,
  TransactionSessionSuccess,
} from "@/generated/app-webhooks-types/transaction-initialize-session";
import { assertUnreachable } from "@/lib/assert-unreachable";
import {
  AtobaraiApiClientRegisterTransactionErrorPublicCode,
  AtobaraiApiRegisterTransactionErrors,
} from "@/modules/atobarai/api/types";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import { SuccessWebhookResponse } from "../saleor-webhook-responses";
import {
  AtobaraiFailureTransactionErrorPublicCode,
  AtobaraiMultipleFailureTransactionErrorPublicCode,
  UseCaseErrors,
} from "../use-case-errors";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: ChargeSuccessResult | ChargeActionRequiredResult;
  readonly atobaraiTransactionId: AtobaraiTransactionId;

  constructor(args: {
    transactionResult: ChargeSuccessResult | ChargeActionRequiredResult;
    atobaraiTransactionId: AtobaraiTransactionId;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.atobaraiTransactionId = args.atobaraiTransactionId;
  }

  private getMessage(): string {
    if (this.transactionResult instanceof ChargeSuccessResult) {
      return "Successfully registered NP Atobarai transaction";
    } else if (this.transactionResult instanceof ChargeActionRequiredResult) {
      return "NP Atobarai transaction requires further action";
    }
    assertUnreachable(this.transactionResult);
  }

  getResponse(): Response {
    const typeSafeResponse: TransactionSessionSuccess | TransactionSessionActionRequired = {
      result: this.transactionResult.result,
      actions: this.transactionResult.actions,
      message: this.getMessage(),
      pspReference: this.atobaraiTransactionId,
    };

    return Response.json(typeSafeResponse, {
      status: this.statusCode,
    });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult;
  readonly error: AtobaraiApiRegisterTransactionErrors | UseCaseErrors;

  private static ResponseDataSchema = z.object({
    errors: z.array(
      z.object({
        code: z.union([
          z.literal(AtobaraiApiClientRegisterTransactionErrorPublicCode),
          z.literal(AtobaraiFailureTransactionErrorPublicCode),
          z.literal(AtobaraiMultipleFailureTransactionErrorPublicCode),
        ]),
        message: z.string(),
      }),
    ),
  });

  constructor(args: {
    transactionResult: ChargeFailureResult;
    error: AtobaraiApiRegisterTransactionErrors | UseCaseErrors;
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
      message: "Failed to register NP Atobarai transaction",
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
