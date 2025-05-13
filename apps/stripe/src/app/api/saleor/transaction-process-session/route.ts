import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { withRecipientVerification } from "@/app/api/saleor/with-recipient-verification";
import { withLoggerContext } from "@/lib/logger-context";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";
import { transactionRecorder } from "@/modules/transactions-recording/repositories/transaction-recorder-impl";

import { TransactionProcessSessionUseCase } from "./use-case";
import { transactionProcessSessionWebhookDefinition } from "./webhook-definition";

const useCase = new TransactionProcessSessionUseCase({
  appConfigRepo: appConfigRepoImpl,
  stripePaymentIntentsApiFactory: new StripePaymentIntentsApiFactory(),
  transactionRecorder: transactionRecorder,
});

const handler = transactionProcessSessionWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, ctx) => {
    try {
      setObservabilitySourceObjectId({
        __typename: ctx.payload.transaction?.checkout?.id ? "Checkout" : "Order",
        id: ctx.payload.transaction?.checkout?.id ?? ctx.payload.transaction?.order?.id ?? null,
      });

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
  }),
);

// TODO: write integration test for this route
export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
