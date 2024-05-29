import { withOtel } from "@saleor/apps-otel";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";
import { createLogger } from "../../../logger";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { AppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "../../../lib/error-utils";
import { loggerContext } from "../../../logger-context";
import { CalculateTaxesUseCase } from "../../../modules/calculate-taxes/use-case/calculate-taxes.use-case";
import { PublicLogDrainService } from "../../../modules/public-log-drain/public-log-drain.service";
import { AvataxInvalidAddressError } from "../../../modules/taxes/tax-error";
import { checkoutCalculateTaxesSyncWebhook } from "../../../modules/webhooks/definitions/checkout-calculate-taxes";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("checkoutCalculateTaxesSyncWebhook");

const withMetadataCache = wrapWithMetadataCache(metadataCache);

const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(logger, captureException);
const useCase = new CalculateTaxesUseCase({
  configExtractor: new AppConfigExtractor(),
  publicLogDrain: new PublicLogDrainService([]),
});

/**
 * TODO: Add tests to handler
 */
export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      checkoutCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
        try {
          const { payload, authData } = ctx;

          subscriptionErrorChecker.checkPayload(payload);

          loggerContext.set("channelSlug", ctx.payload.taxBase.channel.slug);
          loggerContext.set("checkoutId", ctx.payload.taxBase.sourceObject.id);

          if (payload.version) {
            Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
            loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          }

          logger.info("Handler for CHECKOUT_CALCULATE_TAXES webhook called");

          const appMetadata = payload.recipient?.privateMetadata ?? [];
          const channelSlug = payload.taxBase.channel.slug;

          const configExtractor = new AppConfigExtractor();

          const config = configExtractor
            .extractAppConfigFromPrivateMetadata(appMetadata)
            .map((config) => {
              try {
                new AppConfigurationLogger(logger).logConfiguration(config, channelSlug);
              } catch (e) {
                captureException(
                  new AppConfigExtractor.LogConfigurationMetricError(
                    "Failed to log configuration metric",
                    {
                      cause: e,
                    },
                  ),
                );
              }

              return config;
            });

          if (config.isErr()) {
            logger.warn("Failed to extract app config from metadata", { error: config.error });

            return res.status(400).send("App configuration is broken");
          }

          metadataCache.setMetadata(appMetadata);

          return useCase.calculateTaxes(payload, authData).then((result) => {
            return result.match(
              (value) => {
                return res.status(200).send(ctx.buildResponse(value));
              },
              (err) => {
                logger.warn("Error calculating taxes", { error: err });

                switch (err.constructor) {
                  case CalculateTaxesUseCase.FailedCalculatingTaxesError: {
                    return res.status(500).send("Failed to calculate taxes");
                  }
                  case CalculateTaxesUseCase.ConfigBrokenError: {
                    return res
                      .status(500)
                      .send("Failed to calculate taxes due to invalid configuration");
                  }
                  case CalculateTaxesUseCase.ExpectedIncompletePayloadError: {
                    return res
                      .status(400)
                      .send("Taxes cant be calculated due to incomplete payload");
                  }
                  case CalculateTaxesUseCase.UnhandledError: {
                    captureException(err);

                    return res.status(500).send("Failed to calculate taxes (Unhandled error)");
                  }
                }
              },
            );
          });
        } catch (error) {
          // todo this should be now available in usecase. Catch it from FailedCalculatingTaxesError
          if (error instanceof AvataxInvalidAddressError) {
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
