import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";
import { AppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "../../../lib/error-utils";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { AvataxInvalidAddressError } from "../../../modules/taxes/tax-error";
import { orderCalculateTaxesSyncWebhook } from "../../../modules/webhooks/definitions/order-calculate-taxes";
import { verifyCalculateTaxesPayload } from "../../../modules/webhooks/validate-webhook-payload";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderCalculateTaxesSyncWebhook");

const withMetadataCache = wrapWithMetadataCache(metadataCache);

const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(logger, captureException);

export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
        try {
          const { payload } = ctx;

          subscriptionErrorChecker.checkPayload(payload);

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

          const AvataxWebhookServiceFactory = await import(
            "../../../modules/taxes/avatax-webhook-service-factory"
          ).then((m) => m.AvataxWebhookServiceFactory);

          const avataxWebhookServiceResult = AvataxWebhookServiceFactory.createFromConfig(
            config.value,
            channelSlug,
          );

          if (avataxWebhookServiceResult.isOk()) {
            const { taxProvider } = avataxWebhookServiceResult.value;
            const providerConfig = config.value.getConfigForChannelSlug(channelSlug);

            if (providerConfig.isErr()) {
              return res.status(400).send("App is not configured properly.");
            }

            const calculatedTaxes = await taxProvider.calculateTaxes(
              payload,
              providerConfig.value.avataxConfig.config,
              ctx.authData,
            );

            logger.info("Taxes calculated", { calculatedTaxes });

            if (payload.taxBase?.lines[0].quantity === 10) {
              Sentry.captureException(new Error("TEST ERROR"));
            }

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
    "/api/order-calculate-taxes",
  ),
  loggerContext,
);
