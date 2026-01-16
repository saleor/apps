import { z } from "zod";

import {
  TransactionSessionActionRequired,
  TransactionSessionFailure,
  TransactionSessionSuccess,
} from "@/generated/app-webhooks-types/transaction-process-session";
import { assertUnreachable } from "@/lib/assert-unreachable";
import {
  AtobaraiApiChangeTransactionErrors,
  AtobaraiApiClientChangeTransactionErrorPublicCode,
  AtobaraiMultipleResultsErrorPublicCode,
} from "@/modules/atobarai/api/types";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { SaleorPaymentMethodDetails } from "@/modules/saleor/saleor-payment-method-details";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import { SuccessWebhookResponse } from "../saleor-webhook-responses";
import {
  AtobaraiFailureTransactionErrorPublicCode,
  InvalidEventValidationErrorPublicCode,
  UseCaseErrors,
} from "../use-case-errors";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: ChargeSuccessResult | ChargeActionRequiredResult;
  readonly atobaraiTransactionId: AtobaraiTransactionId;
  readonly saleorPaymentMethodDetails: SaleorPaymentMethodDetails | null;

  constructor(args: {
    transactionResult: ChargeSuccessResult | ChargeActionRequiredResult;
    atobaraiTransactionId: AtobaraiTransactionId;
    saleorPaymentMethodDetails: SaleorPaymentMethodDetails | null;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.atobaraiTransactionId = args.atobaraiTransactionId;
    this.saleorPaymentMethodDetails = args.saleorPaymentMethodDetails;
  }

  private getMessage(): string {
    if (this.transactionResult instanceof ChargeSuccessResult) {
      return "Successfully changed NP Atobarai transaction";
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
      paymentMethodDetails: this.saleorPaymentMethodDetails?.toSaleorWebhookResponse(),
    };

    return Response.json(typeSafeResponse, {
      status: this.statusCode,
    });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult;
  readonly error: AtobaraiApiChangeTransactionErrors | UseCaseErrors;
  /**
   * There are different errors that can be passed, not every related to API,
   * so we pass optional api error separately
   */
  readonly apiError?: string;

  private static ResponseDataSchema = z.object({
    errors: z.array(
      z.object({
        code: z.union([
          z.literal(AtobaraiFailureTransactionErrorPublicCode),
          z.literal(AtobaraiMultipleResultsErrorPublicCode),
          z.literal(AtobaraiApiClientChangeTransactionErrorPublicCode),
          z.literal(InvalidEventValidationErrorPublicCode),
        ]),
        message: z.string(),
        apiError: z.string().optional(),
      }),
    ),
  });

  constructor(args: {
    transactionResult: ChargeFailureResult;
    error: AtobaraiApiChangeTransactionErrors | UseCaseErrors;
    apiError?: string;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.error = args.error;
    this.apiError = args.apiError;
  }

  getResponse(): Response {
    const typeSafeResponse: TransactionSessionFailure = {
      data: Failure.ResponseDataSchema.parse({
        errors: [
          {
            code: this.error.publicCode,
            message: this.error.publicMessage,
            apiError: this.apiError,
          },
        ],
      }),
      result: this.transactionResult.result,
      actions: this.transactionResult.actions,
      message: "Failed to change NP Atobarai transaction",
    };

    return Response.json(typeSafeResponse, {
      status: this.statusCode,
    });
  }
}

export const TransactionProcessSessionUseCaseResponse = {
  Success,
  Failure,
};

export type TransactionProcessSessionUseCaseResponse = InstanceType<
  | typeof TransactionProcessSessionUseCaseResponse.Success
  | typeof TransactionProcessSessionUseCaseResponse.Failure
>;
