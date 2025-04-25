import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { appConfigPersistence } from "@/lib/app-config-persistence";
import { withLoggerContext } from "@/lib/logger-context";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";
import { transactionRecorder } from "@/modules/transactions-recording/transaction-recorder-impl";

import { TransactionInitializeSessionUseCase } from "./use-case";
import { transactionInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new TransactionInitializeSessionUseCase({
  appConfigRepo: appConfigPersistence,
  stripePaymentIntentsApiFactory: new StripePaymentIntentsApiFactory(),
  // TODO: change it to use DynamoDB
  transactionRecorder: transactionRecorder,
});

const handler = transactionInitializeSessionWebhookDefinition.createHandler(async (_req, ctx) => {
  try {
    const saleorApiUrlResult = createSaleorApiUrl(ctx.authData.saleorApiUrl);

    if (saleorApiUrlResult.isErr()) {
      captureException(saleorApiUrlResult.error);
      const response = new MalformedRequestResponse();

      return response.getResponse();
    }

    const result = await useCase.execute({
      appId: ctx.authData.appId,
      saleorApiUrl: saleorApiUrlResult.value,
      event: ctx.payload,
    });

    return result.match(
      (result) => {
        return result.getResponse();
      },
      (err) => {
        return err.getResponse();
      },
    );
  } catch (error) {
    captureException(error);
    const response = new UnhandledErrorResponse();

    return response.getResponse();
  }
});

// TODO: write integration test for this route
export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
