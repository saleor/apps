import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import {
  ChargeFailureResponse,
  ChargeSuccessResponse,
} from "@/modules/saleor/saleor-webhook-responses";

import { TransactionInitalizeSessionResponseDataShapeType } from "./response-data-shape";

// TODO: add support for other results e.g AUTHORIZE

class ChargeRequest extends ChargeSuccessResponse {
  result = "CHARGE_REQUEST" as const;
  responseData: TransactionInitalizeSessionResponseDataShapeType;
  amount: number;
  pspReference: string;

  constructor(args: {
    responseData: TransactionInitalizeSessionResponseDataShapeType;
    amount: number;
    pspReference: string;
  }) {
    super();
    this.responseData = args.responseData;
    this.amount = args.amount;
    this.pspReference = args.pspReference;
  }

  getResponse() {
    // TODO: fix typing of buildSyncWebhookResponsePayload - it doesn't allow actions etc.
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      data: this.responseData,
      result: this.result,
      amount: this.amount,
      pspReference: this.pspReference,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class ChargeFailure extends ChargeFailureResponse {
  result = "CHARGE_FAILURE" as const;
  amount = 0;
  message: string;

  constructor(args: { message: string }) {
    super();
    this.message = args.message;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      result: this.result,
      amount: this.amount,
      message: this.message,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionInitalizeSessionUseCaseResponses = {
  ChargeRequest,
  ChargeFailure,
};

export type TransactionInitalizeSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionInitalizeSessionUseCaseResponses)[keyof typeof TransactionInitalizeSessionUseCaseResponses]
>;
