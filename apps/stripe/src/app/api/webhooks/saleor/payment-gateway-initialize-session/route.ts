import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";

import { withRecipientVerification } from "../with-recipient-verification";
import { PaymentGatewayInitializeSessionUseCase } from "./use-case";
import { paymentGatewayInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new PaymentGatewayInitializeSessionUseCase({
  appConfigRepo: appConfigRepoImpl,
});

const logger = createLogger("PAYMENT_GATEWAY_INITIALIZE_SESSION route");

const handler = paymentGatewayInitializeSessionWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, ctx) => {
    try {
      setObservabilitySourceObjectId(ctx.payload.sourceObject);

      logger.info("Received webhook request");

      const saleorApiUrlResult = createSaleorApiUrl(ctx.authData.saleorApiUrl);

      if (saleorApiUrlResult.isErr()) {
        const response = new MalformedRequestResponse();

        captureException(saleorApiUrlResult.error);

        return response.getResponse();
      }

      const result = await useCase.execute({
        channelId: ctx.payload.sourceObject.channel.id,
        appId: ctx.authData.appId,
        saleorApiUrl: saleorApiUrlResult.value,
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

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
