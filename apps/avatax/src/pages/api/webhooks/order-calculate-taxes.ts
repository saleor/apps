import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";
import { waitUntil } from "@vercel/functions";
import { AppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "../../../lib/error-utils";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import {
  TaxesCalculatedInOrderLog,
  TaxesCalculationFailedConfigErrorLog,
  TaxesCalculationFailedInvalidPayloadLog,
  TaxesCalculationFailedUnhandledErrorLog,
} from "../../../modules/public-log-drain/public-events";
import { PublicLogDrainService } from "../../../modules/public-log-drain/public-log-drain.service";
import { LogDrainJsonTransporter } from "../../../modules/public-log-drain/transporters/public-log-drain-json-transporter";
import { LogDrainOtelTransporter } from "../../../modules/public-log-drain/transporters/public-log-drain-otel-transporter";
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

const otelLogDrainTransporter = new LogDrainOtelTransporter();
const jsonLogDrainTransporter = new LogDrainJsonTransporter();

const publicLoggerOtel = new PublicLogDrainService([]);

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

            waitUntil(
              publicLoggerOtel.emitLog(
                new TaxesCalculationFailedInvalidPayloadLog({
                  additionalMessage: payloadVerificationResult.error.message,
                  orderId: payload.taxBase?.sourceObject.id,
                  saleorApiUrl: ctx.authData.saleorApiUrl,
                }),
              ),
            );

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

            waitUntil(
              publicLoggerOtel.emitLog(
                new TaxesCalculationFailedConfigErrorLog({
                  orderId: payload.taxBase?.sourceObject.id,
                  saleorApiUrl: ctx.authData.saleorApiUrl,
                }),
              ),
            );

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
              waitUntil(
                publicLoggerOtel.emitLog(
                  new TaxesCalculationFailedConfigErrorLog({
                    orderId: payload.taxBase?.sourceObject.id,
                    saleorApiUrl: ctx.authData.saleorApiUrl,
                  }),
                ),
              );

              return res.status(400).send("App is not configured properly.");
            }

            if (providerConfig.value.avataxConfig.config.logsSettings?.otel.enabled) {
              const url = providerConfig.value.avataxConfig.config.logsSettings.otel.url ?? "";

              let headers: Record<string, string>;

              try {
                headers = JSON.parse(
                  providerConfig.value.avataxConfig.config.logsSettings.otel.headers ?? "",
                );
              } catch {
                headers = {};
              }

              otelLogDrainTransporter.setSettings({
                headers,
                url,
              });

              publicLoggerOtel.addTransporter(otelLogDrainTransporter);
            }

            if (providerConfig.value.avataxConfig.config.logsSettings?.json.enabled) {
              const url = providerConfig.value.avataxConfig.config.logsSettings.json.url ?? "";

              let headers: Record<string, string>;

              try {
                headers = JSON.parse(
                  providerConfig.value.avataxConfig.config.logsSettings.json.headers ?? "",
                );
              } catch {
                headers = {};
              }

              jsonLogDrainTransporter.setSettings({
                endpoint: url,
                headers,
              });
              publicLoggerOtel.addTransporter(jsonLogDrainTransporter);
            }

            const calculatedTaxes = await taxProvider.calculateTaxes(
              payload,
              providerConfig.value.avataxConfig.config,
              ctx.authData,
            );

            logger.info("Taxes calculated", { calculatedTaxes });

            waitUntil(
              publicLoggerOtel.emitLog(
                new TaxesCalculatedInOrderLog({
                  orderId: payload.taxBase?.sourceObject.id,
                  saleorApiUrl: ctx.authData.saleorApiUrl,
                }),
              ),
            );

            return res.status(200).json(ctx.buildResponse(calculatedTaxes));
          } else {
          }
        } catch (error) {
          if (error instanceof AvataxInvalidAddressError) {
            logger.warn(
              "InvalidAppAddressError: App returns status 400 due to broken address configuration",
              { error },
            );

            waitUntil(
              publicLoggerOtel.emitLog(
                new TaxesCalculationFailedConfigErrorLog({
                  additionalMessage: "Wrong address configuration",
                  orderId: ctx.payload.taxBase?.sourceObject.id,
                  saleorApiUrl: ctx.authData.saleorApiUrl,
                }),
              ),
            );

            return res.status(400).json({
              message: "InvalidAppAddressError: Check address in app configuration",
            });
          }

          Sentry.captureException(error);
          waitUntil(
            publicLoggerOtel.emitLog(
              new TaxesCalculationFailedUnhandledErrorLog({
                orderId: ctx.payload.taxBase?.sourceObject.id,
                saleorApiUrl: ctx.authData.saleorApiUrl,
              }),
            ),
          );

          return res.status(500).send("Unhandled error");
        }
      }),
    ),
    "/api/order-calculate-taxes",
  ),
  loggerContext,
);
