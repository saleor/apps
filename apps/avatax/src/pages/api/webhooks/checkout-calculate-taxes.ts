import { withOtel } from "@saleor/apps-otel";
import * as Sentry from "@sentry/nextjs";
import { createLogger } from "../../../logger";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { loggerContext } from "../../../logger-context";
import { InvalidAppAddressError } from "../../../modules/taxes/tax-error";
import { checkoutCalculateTaxesSyncWebhook } from "../../../modules/webhooks/definitions/checkout-calculate-taxes";
import { AppConfigExtractor } from "../../../lib/app-config-extractor";
import { CalculateTaxesUseCase } from "../../../modules/calculate-taxes/use-case/calculate-taxes.use-case";

export const config = {
  api: {
    bodyParser: false,
  },
};

const withMetadataCache = wrapWithMetadataCache(metadataCache);

const useCase = new CalculateTaxesUseCase({
  configExtractor: new AppConfigExtractor(),
});

/**
 * TODO: Add tests to handler
 */
export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      checkoutCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
        const logger = createLogger("checkoutCalculateTaxesSyncWebhook");

        try {
          const { payload, authData } = ctx;

          loggerContext.set("channelSlug", ctx.payload.taxBase.channel.slug);
          loggerContext.set("checkoutId", ctx.payload.taxBase.sourceObject.id);
          if (payload.version) {
            Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
            loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          }

          logger.info("Handler for CHECKOUT_CALCULATE_TAXES webhook called");

          const appMetadata = payload.recipient?.privateMetadata ?? [];

          metadataCache.setMetadata(appMetadata);

          return useCase.calculateTaxes(payload, authData).then((result) => {
            return result.match(
              (value) => {
                return res.status(200).send(ctx.buildResponse(value));
              },
              (err) => {
                return res.status(500).send("Unhandled error "); // todo map error
              },
            );
          });
        } catch (error) {
          // todo this should be now available in usecase, refactor
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
