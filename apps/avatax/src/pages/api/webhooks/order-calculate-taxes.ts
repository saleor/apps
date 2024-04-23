import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { orderCalculateTaxesSyncWebhook } from "../../../modules/webhooks/definitions/order-calculate-taxes";
import { verifyCalculateTaxesPayload } from "../../../modules/webhooks/validate-webhook-payload";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { InvalidAppAddressError } from "../../../modules/taxes/tax-error";
import { AppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { captureException } from "@sentry/nextjs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const withMetadataCache = wrapWithMetadataCache(metadataCache);

export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
        const logger = createLogger("orderCalculateTaxesSyncWebhook");

        try {
          const { payload } = ctx;

          loggerContext.set("channelSlug", ctx.payload.taxBase.channel.slug);
          loggerContext.set("orderId", ctx.payload.taxBase.sourceObject.id);

          if (payload.version) {
            Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
            loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          }

          logger.info("Handler for ORDER_CALCULATE_TAXES webhook called");

          const payloadVerificationResult = verifyCalculateTaxesPayload(payload);

          if (payloadVerificationResult.isErr()) {
            logger.warn("Failed to calculate taxes, due to incomplete payload", {
              error: payloadVerificationResult.error,
            });

            return res.status(400).send(payloadVerificationResult.error.message);
          }

          const appMetadata = payload.recipient?.privateMetadata ?? [];

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

          const channelSlug = payload.taxBase.channel.slug;

          const AvataxWebhookServiceFactory = await import(
            "../../../modules/taxes/avatax-webhook-service-factory"
          ).then((m) => m.AvataxWebhookServiceFactory);

          const avataxWebhookServiceResult = AvataxWebhookServiceFactory.createFromConfig(
            config.value,
            channelSlug,
          );

          if (avataxWebhookServiceResult.isOk()) {
            const { taxProvider, config } = avataxWebhookServiceResult.value;

            const calculatedTaxes = await taxProvider.calculateTaxes(payload, config, ctx.authData);

            logger.info("Taxes calculated", { calculatedTaxes });

            return res.status(200).json(ctx.buildResponse(calculatedTaxes));
          } else if (avataxWebhookServiceResult.isErr()) {
            const err = avataxWebhookServiceResult.error;

            logger.warn(`Error in taxes calculation occurred: ${err.name} ${err.message}`, {
              error: err,
            });

            switch (err["constructor"]) {
              case AvataxWebhookServiceFactory.BrokenConfigurationError: {
                return res.status(400).send("App is not configured properly.");
              }
              default: {
                Sentry.captureException(avataxWebhookServiceResult.error);
                logger.fatal("Unhandled error", { error: err });

                return res.status(500).send("Unhandled error");
              }
            }
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
    "/api/order-calculate-taxes",
  ),
  loggerContext,
);
