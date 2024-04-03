import { withOtel } from "@saleor/apps-otel";
import * as Sentry from "@sentry/nextjs";
import { createLogger } from "../../../logger";
import { calculateTaxesErrorsStrategy } from "../../../modules/webhooks/calculate-taxes-errors-strategy";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { loggerContext } from "../../../logger-context";
import { MissingAddressAvataxWebhookService } from "../../../modules/avatax/calculate-taxes/missing-address-avatax-webhook-service";
import {
  InvalidAppAddressError,
  TaxIncompletePayloadErrors,
} from "../../../modules/taxes/tax-error";
import { checkoutCalculateTaxesSyncWebhook } from "../../../modules/webhooks/definitions/checkout-calculate-taxes";
import { verifyCalculateTaxesPayload } from "../../../modules/webhooks/validate-webhook-payload";

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
        const logger = createLogger("checkoutCalculateTaxesSyncWebhook");

        try {
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
            const error = payloadVerificationResult.error;

            switch (true) {
              case error instanceof TaxIncompletePayloadErrors.MissingAddressError:
                logger.info(
                  "Missing address in the payload. Returning totalPrice and shippingPrice as a fallback.",
                );
                const calculatedTaxes =
                  MissingAddressAvataxWebhookService.calculateTaxesNoop(payload);

                return res.status(200).send(ctx.buildResponse(calculatedTaxes));
              default:
                logger.warn("Failed to calculate taxes, due to incomplete payload", {
                  error: payloadVerificationResult.error,
                });
                return res.status(400).send(error.message);
            }
          }

          const appMetadata = payload.recipient?.privateMetadata ?? [];

          metadataCache.setMetadata(appMetadata);

          const channelSlug = payload.taxBase.channel.slug;

          const getActiveConnectionService = await import(
            "../../../modules/taxes/get-active-connection-service"
          ).then((m) => m.getActiveConnectionService);

          const activeConnectionServiceResult = getActiveConnectionService(
            channelSlug,
            appMetadata,
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

            const { taxProvider, config } = activeConnectionServiceResult.value;

            // TODO: Improve errors handling like above
            const calculatedTaxes = await taxProvider.calculateTaxes(payload, config, ctx.authData);

            logger.info("Taxes calculated", { calculatedTaxes });

            return res.status(200).json(ctx.buildResponse(calculatedTaxes));
          }
        } catch (error) {
          if (error instanceof InvalidAppAddressError) {
            logger.warn(
              "InvalidAppAddressError: App returns status 400 due to broken address configuration",
              { error },
            );

            return res.status(400).json({
              message: "InvalidAppAddressError: Check address in app configuration",
            });
          }

          Sentry.captureException(error);

          return res.status(500).send("Unhandled error");
        }
      }),
    ),
    "/api/webhooks/checkout-calculate-taxes",
  ),
  loggerContext,
);
