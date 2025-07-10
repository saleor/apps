import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";
import { ok } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";
import { setObservabilitySaleorApiUrl } from "@/lib/observability-saleor-api-url";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { AtobaraiConfig } from "@/modules/app-config/types";

import { UnhandledErrorResponse } from "../saleor-webhook-responses";
import { withRecipientVerification } from "../with-recipient-verification";
import { PaymentGatewayInitializeSessionUseCase } from "./use-case";
import { paymentGatewayInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new PaymentGatewayInitializeSessionUseCase({
  // TODO: Replace with actual implementation of AppConfigRepo
  appConfigRepo: {
    getAtobaraiConfig: () => {
      return Promise.resolve(ok(new AtobaraiConfig()));
    },
  },
});

const logger = createLogger("PaymentGatewayInitializeSession route");

const handler = paymentGatewayInitializeSessionWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, ctx) => {
    try {
      setObservabilitySourceObjectId(ctx.payload.sourceObject);

      logger.info("Received webhook request");

      const saleorApiUrl = createSaleorApiUrl(ctx.authData.saleorApiUrl);

      setObservabilitySaleorApiUrl(saleorApiUrl, ctx.payload.version);

      const result = await useCase.execute({
        event: ctx.payload,
        appId: ctx.authData.appId,
        saleorApiUrl,
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

      const response = new UnhandledErrorResponse(BaseError.normalize(error));

      return response.getResponse();
    }
  }),
);

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
