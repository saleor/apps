import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import {
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { loggerContext, withLoggerContext } from "@/lib/logger-context";
import { setObservabilitySaleorApiUrl } from "@/lib/observability-saleor-api-url";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";

import { withRecipientVerification } from "../with-recipient-verification";
import { TransactionChargeRequestedUseCase } from "./use-case";
import { transactionChargeRequestedWebhookDefinition } from "./webhook-definition";

const useCase = new TransactionChargeRequestedUseCase({
  appConfigRepo: appConfigRepoImpl,
  stripePaymentIntentsApiFactory: new StripePaymentIntentsApiFactory(),
});

const logger = createLogger("TRANSACTION_CHARGE_REQUESTED route");

const handler = transactionChargeRequestedWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, ctx) => {
    try {
      setObservabilitySourceObjectId({
        __typename: ctx.payload.transaction?.checkout?.id ? "Checkout" : "Order",
        id: ctx.payload.transaction?.checkout?.id ?? ctx.payload.transaction?.order?.id ?? null,
      });

      loggerContext.set(
        ObservabilityAttributes.PSP_REFERENCE,
        ctx.payload.transaction?.pspReference ?? null,
      );

      loggerContext.set(
        ObservabilityAttributes.TRANSACTION_AMOUNT,
        ctx.payload.action.amount ?? null,
      );

      logger.info("Received webhook request");

      const saleorApiUrlResult = createSaleorApiUrl(ctx.authData.saleorApiUrl);

      if (saleorApiUrlResult.isErr()) {
        captureException(saleorApiUrlResult.error);
        const response = new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          saleorApiUrlResult.error,
        );

        return response.getResponse();
      }

      setObservabilitySaleorApiUrl(saleorApiUrlResult.value, ctx.payload.version);

      const result = await useCase.execute({
        appId: ctx.authData.appId,
        saleorApiUrl: saleorApiUrlResult.value,
        event: ctx.payload,
      });

      return result.match(
        (result) => {
          logger.info("Successfully processed webhook request", {
            httpsStatusCode: result.statusCode,
            stripeEnv: result.appContext.stripeEnv,
            transactionResult: result.transactionResult.result,
          });

          return result.getResponse();
        },
        (err) => {
          logger.warn("Failed to process webhook request", {
            httpsStatusCode: err.statusCode,
            reason: err.message,
          });

          return err.getResponse();
        },
      );
    } catch (error) {
      captureException(error);
      logger.error("Unhandled error", { error: error });

      const response = new UnhandledErrorResponse(
        appContextContainer.getContextValue(),
        BaseError.normalize(error),
      );

      return response.getResponse();
    }
  }),
);

// TODO: write integration test for this route
export const POST = compose(
  withLoggerContext,
  appContextContainer.wrapRequest,
  withSpanAttributesAppRouter,
)(handler);
