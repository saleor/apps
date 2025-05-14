import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { createLogger } from "@/lib/logger";
import { loggerContext, withLoggerContext } from "@/lib/logger-context";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripeRefundsApiFactory } from "@/modules/stripe/stripe-refunds-api-factory";

import { withRecipientVerification } from "../with-recipient-verification";
import { TransactionRefundRequestedUseCase } from "./use-case";
import { transactionRefundRequestedWebhookDefinition } from "./webhook-definition";

const useCase = new TransactionRefundRequestedUseCase({
  appConfigRepo: appConfigRepoImpl,
  stripeRefundsApiFactory: new StripeRefundsApiFactory(),
});

const logger = createLogger("TRANSACTION_CHARGE_REQUESTED route");

const handler = transactionRefundRequestedWebhookDefinition.createHandler(
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

      logger.info("Received webhook request");

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
          logger.info("Successfully processed webhook request", {
            httpsStatusCode: result.statusCode,
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
      const response = new UnhandledErrorResponse();

      return response.getResponse();
    }
  }),
);

// TODO: write integration test for this route
export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
