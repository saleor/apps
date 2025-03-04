import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";

import { AppConfigExtractor } from "@/lib/app-config-extractor";
import { AppConfigurationLogger } from "@/lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "@/lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "@/lib/error-utils";
import { createLogger } from "@/logger";
import { loggerContext, withLoggerContext } from "@/logger-context";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-lines-transformer";
import { AvataxCalculateTaxesResponseTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-response-transformer";
import { AvataxCalculateTaxesTaxCodeMatcher } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-tax-code-matcher";
import { CalculateTaxesUseCase } from "@/modules/calculate-taxes/use-case/calculate-taxes.use-case";
import { LogWriterFactory } from "@/modules/client-logs/log-writer-factory";
import { AvataxInvalidAddressError } from "@/modules/taxes/tax-error";
import { checkoutCalculateTaxesSyncWebhook } from "@/modules/webhooks/definitions/checkout-calculate-taxes";

export const config = {
  api: {
    bodyParser: false,
  },
};

const withMetadataCache = wrapWithMetadataCache(metadataCache);

const handler = checkoutCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger("checkoutCalculateTaxesSyncWebhook");

  /**
   * Create deps in handler, so it's potentially faster and reduce lambda start
   * TODO: It's rather not true, we should move it outside
   */
  const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(logger, captureException);
  const useCase = new CalculateTaxesUseCase({
    configExtractor: new AppConfigExtractor(),
    logWriterFactory: new LogWriterFactory(),
    payloadLinesTransformer: new AvataxCalculateTaxesPayloadLinesTransformer(
      new AvataxCalculateTaxesTaxCodeMatcher(),
    ),
    calculateTaxesResponseTransformer: new AvataxCalculateTaxesResponseTransformer(),
  });

  try {
    const { payload, authData } = ctx;

    subscriptionErrorChecker.checkPayload(payload);

    loggerContext.set(ObservabilityAttributes.CHANNEL_SLUG, ctx.payload.taxBase.channel.slug);
    loggerContext.set(ObservabilityAttributes.CHECKOUT_ID, ctx.payload.taxBase.sourceObject.id);

    if (payload.version) {
      Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
      loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
    }

    logger.info("Handler for CHECKOUT_CALCULATE_TAXES webhook called");

    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.taxBase.channel.slug;

    const configExtractor = new AppConfigExtractor();

    metadataCache.setMetadata(appMetadata);

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
      logger.warn("Failed to extract app config from metadata", {
        error: config.error,
      });

      return res.status(400).json({
        message: `App configuration is broken for checkout: ${payload.taxBase.sourceObject.id}`,
      });
    }

    return useCase.calculateTaxes(payload, authData).then((result) => {
      return result.match(
        (value) => {
          return res.status(200).json(ctx.buildResponse(value));
        },
        (error) => {
          logger.warn("Error calculating taxes", { error });

          switch (error.constructor) {
            case CalculateTaxesUseCase.FailedCalculatingTaxesError: {
              return res.status(500).json({
                message: `Failed to calculate taxes for checkout: ${payload.taxBase.sourceObject.id}`,
              });
            }
            case CalculateTaxesUseCase.ConfigBrokenError: {
              return res.status(500).json({
                message: `Failed to calculate taxes due to invalid configuration for checkout: ${payload.taxBase.sourceObject.id}`,
              });
            }
            case CalculateTaxesUseCase.ExpectedIncompletePayloadError: {
              return res.status(400).json({
                message: `Taxes can't be calculated due to incomplete payload for checkout: ${payload.taxBase.sourceObject.id}`,
              });
            }
            case CalculateTaxesUseCase.UnhandledError: {
              captureException(error);

              return res.status(500).json({
                message: `Failed to calculate taxes (Unhandled error) for checkout: ${payload.taxBase.sourceObject.id}`,
              });
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

    return res.status(500).json({ message: "Unhandled error" });
  }
});

/**
 * TODO: Add tests to handler
 */
export default compose(withLoggerContext, withMetadataCache, withSpanAttributes)(handler);
