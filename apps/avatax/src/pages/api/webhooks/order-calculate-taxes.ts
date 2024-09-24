import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";

import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "@/modules/avatax/discounts";
import { ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { LogWriterFactory } from "@/modules/client-logs/log-writer-factory";

import { AppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "../../../lib/error-utils";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import {
  AvataxEntityNotFoundError,
  AvataxGetTaxError,
  AvataxInvalidAddressError,
  AvataxStringLengthError,
} from "../../../modules/taxes/tax-error";
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
const discountStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

const logsWriterFactory = new LogWriterFactory();

export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
        const logWriter = logsWriterFactory.createWriter(ctx.authData);

        const channelSlug = ctx.payload.taxBase.channel.slug;
        const orderId = ctx.payload.taxBase.sourceObject.id;
        const appMetadata = ctx.payload.recipient?.privateMetadata ?? [];

        try {
          const { payload } = ctx;

          subscriptionErrorChecker.checkPayload(payload);

          loggerContext.set("channelSlug", channelSlug);
          loggerContext.set("orderId", orderId);

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

            ClientLogStoreRequest.create({
              level: "info",
              message: "Taxes not calculated. Missing address or lines",
              checkoutOrOrderId: payload.taxBase.sourceObject.id,
              channelId: payload.taxBase.channel.slug,
              checkoutOrOrder: "order",
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            return res.status(400).json({ message: payloadVerificationResult.error.message });
          }

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
            logger.warn("Failed to extract app config from metadata", {
              error: config.error,
            });

            ClientLogStoreRequest.create({
              level: "error",
              message: "Taxes not calculated. App faced problem with configuration.",
              checkoutOrOrderId: payload.taxBase.sourceObject.id,
              channelId: payload.taxBase.channel.slug,
              checkoutOrOrder: "order",
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            return res.status(400).json({
              message: `App configuration is broken for order: ${payload.taxBase.sourceObject.id}`,
            });
          }

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
              ClientLogStoreRequest.create({
                level: "error",
                message: "Taxes not calculated. App faced problem with configuration.",
                checkoutOrOrderId: payload.taxBase.sourceObject.id,
                channelId: payload.taxBase.channel.slug,
                checkoutOrOrder: "order",
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              return res.status(400).json({
                message: `App is not configured properly for order: ${payload.taxBase.sourceObject.id}`,
              });
            }

            const calculatedTaxes = await taxProvider.calculateTaxes(
              payload,
              providerConfig.value.avataxConfig.config,
              ctx.authData,
              discountStrategy,
            );

            // eslint-disable-next-line @saleor/saleor-app/logger-leak
            logger.info("Taxes calculated", { calculatedTaxes: JSON.stringify(calculatedTaxes) });

            ClientLogStoreRequest.create({
              level: "info",
              message: "Taxes calculated",
              checkoutOrOrderId: payload.taxBase.sourceObject.id,
              channelId: payload.taxBase.channel.slug,
              checkoutOrOrder: "order",
              attributes: {
                calculatedTaxes: calculatedTaxes,
              },
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            return res.status(200).json(ctx.buildResponse(calculatedTaxes));
          } else if (avataxWebhookServiceResult.isErr()) {
            const err = avataxWebhookServiceResult.error;

            logger.warn(`Error in taxes calculation occurred: ${err.name} ${err.message}`, {
              error: err,
            });

            switch (err["constructor"]) {
              case AvataxWebhookServiceFactory.BrokenConfigurationError: {
                ClientLogStoreRequest.create({
                  level: "error",
                  message: "Taxes not calculated. App faced problem with configuration.",
                  checkoutOrOrderId: payload.taxBase.sourceObject.id,
                  channelId: payload.taxBase.channel.slug,
                  checkoutOrOrder: "order",
                })
                  .mapErr(captureException)
                  .map(logWriter.writeLog);

                return res.status(400).json({
                  message: `App is not configured properly for order: ${payload.taxBase.sourceObject.id}`,
                });
              }
              default: {
                Sentry.captureException(avataxWebhookServiceResult.error);
                logger.error("Unhandled error", { error: err });

                ClientLogStoreRequest.create({
                  level: "error",
                  message: "Taxes not calculated. Unknown error.",
                  checkoutOrOrderId: payload.taxBase.sourceObject.id,
                  channelId: payload.taxBase.channel.slug,
                  checkoutOrOrder: "order",
                })
                  .mapErr(captureException)
                  .map(logWriter.writeLog);

                return res.status(500).json({ message: "Unhandled error" });
              }
            }
          }
        } catch (error) {
          if (error instanceof AvataxGetTaxError) {
            logger.warn(
              "GetTaxError: App returns status 400 due to problem when user attempted to create a transaction through AvaTax",
              {
                error,
              },
            );

            ClientLogStoreRequest.create({
              level: "error",
              message: "Taxes not calculated. Avalara returned error",
              checkoutOrOrderId: orderId,
              checkoutOrOrder: "order",
              channelId: channelSlug,
              // todo map error from avalara
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            return res.status(400).json({
              message:
                "GetTaxError: A problem occurred when you attempted to create a transaction through AvaTax. Check your address or line items.",
            });
          }

          if (error instanceof AvataxInvalidAddressError) {
            ClientLogStoreRequest.create({
              level: "error",
              message: "Taxes not calculated. Avalara returned error: invalid address",
              checkoutOrOrderId: orderId,
              channelId: channelSlug,
              checkoutOrOrder: "order",
              // todo map error from avalara
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            logger.warn(
              "InvalidAppAddressError: App returns status 400 due to broken address configuration",
              { error },
            );

            return res.status(400).json({
              message: "InvalidAppAddressError: Check address in app configuration",
            });
          }

          if (error instanceof AvataxStringLengthError) {
            ClientLogStoreRequest.create({
              level: "error",
              message: "Taxes not calculated. Avalara returned error: invalid address",
              checkoutOrOrderId: orderId,
              checkoutOrOrder: "order",
              channelId: channelSlug,
              // todo map error from avalara
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            logger.warn(
              "AvataxStringLengthError: App returns status 400 due to not valid address data",
              { error },
            );

            return res.status(400).json({
              message: `AvaTax service returned validation error: ${error.description} `,
            });
          }

          if (error instanceof AvataxEntityNotFoundError) {
            ClientLogStoreRequest.create({
              level: "error",
              message: "Taxes not calculated. Avalara returned error: entity not found",
              checkoutOrOrderId: orderId,
              checkoutOrOrder: "order",
              channelId: channelSlug,
              // todo map error from avalara
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            logger.warn(
              "AvataxEntityNotFoundError: App returns status 400 due to entity not found. See https://developer.avalara.com/avatax/errors/EntityNotFoundError/ for more details",
              { error },
            );

            return res.status(400).json({
              message: `AvaTax service returned validation error: ${error.description} `,
            });
          }

          Sentry.captureException(error);

          ClientLogStoreRequest.create({
            level: "error",
            message: "Taxes not calculated. Unhandled error",
            checkoutOrOrderId: orderId,
            checkoutOrOrder: "order",
            channelId: channelSlug,
            // todo map error from avalara
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          return res.status(500).json({ message: "Unhandled error" });
        }
      }),
    ),
    "/api/order-calculate-taxes",
  ),
  loggerContext,
);
