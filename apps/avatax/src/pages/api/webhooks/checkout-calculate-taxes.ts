import { withOtel } from "@saleor/apps-otel";
import * as Sentry from "@sentry/nextjs";
import { createLogger } from "../../../logger";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { calculateTaxesErrorsStrategy } from "../../../modules/webhooks/calculate-taxes-errors-strategy";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { loggerContext } from "../../../logger-context";
import { checkoutCalculateTaxesSyncWebhook } from "../../../modules/webhooks/definitions/checkout-calculate-taxes";
import { verifyCalculateTaxesPayload } from "../../../modules/webhooks/validate-webhook-payload";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";

export const config = {
  api: {
    bodyParser: false,
  },
};

const withMetadataCache = wrapWithMetadataCache(metadataCache);

/**
 * TODO: Add tests to handler
 */
export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      checkoutCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
        const webhookResponse = new WebhookResponse(res);

        try {
          const logger = createLogger("checkoutCalculateTaxesSyncWebhook");
          const { payload } = ctx;

          loggerContext.set("channelSlug", ctx.payload.taxBase.channel.slug);
          loggerContext.set("checkoutId", ctx.payload.taxBase.sourceObject.id);
          if (payload.version) {
            Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
            loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          }

          logger.info("Handler for CHECKOUT_CALCULATE_TAXES webhook called");

          const payloadVerificationResult = verifyCalculateTaxesPayload(payload);

          if (payloadVerificationResult.isErr()) {
            logger.warn("Failed to calculate taxes, due to incomplete payload", {
              error: payloadVerificationResult.error,
            });

            return res.status(400).send(payloadVerificationResult.error.message);
          }

          const appMetadata = payload.recipient?.privateMetadata ?? [];
          const channelSlug = payload.taxBase.channel.slug;
          const activeConnectionServiceResult = getActiveConnectionService(
            channelSlug,
            appMetadata,
            ctx.authData,
          );

          if (activeConnectionServiceResult.isErr()) {
            const err = activeConnectionServiceResult.error;

            logger.warn(`Error in taxes calculation occurred: ${err.name} ${err.message}`, {
              error: err,
            });

            const executeErrorStrategy = calculateTaxesErrorsStrategy(req, res).get(err.name);

            if (executeErrorStrategy) {
              return executeErrorStrategy();
            } else {
              Sentry.captureException(err);

              logger.fatal(`UNHANDLED: ${err.name}`, {
                error: err,
              });

              return res.status(500).send("Error calculating taxes");
            }
          } else {
            logger.info("Found active connection service. Calculating taxes...");
            // TODO: Improve errors handling like above
            const calculatedTaxes =
              await activeConnectionServiceResult.value.calculateTaxes(payload);

            logger.info("Taxes calculated", { calculatedTaxes });
            return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
          }
        } catch (error) {
          Sentry.captureException(error);

          return webhookResponse.error(error);
        }
      }),
    ),
    "/api/webhooks/checkout-calculate-taxes",
  ),
  loggerContext,
);
