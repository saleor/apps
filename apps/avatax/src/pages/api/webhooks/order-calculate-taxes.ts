import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";

import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "@/modules/avatax/discounts";
import { ClientLog, ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { clientLogsFeatureConfig } from "@/modules/client-logs/client-logs-feature-config";
import {
  createLogsDocumentClient,
  createLogsDynamoClient,
} from "@/modules/client-logs/dynamo-client";
import {
  ClientLogDynamoEntityFactory,
  LogByDateEntity,
  LogsTable,
} from "@/modules/client-logs/dynamo-schema";
import { LogsRepositoryDynamodb } from "@/modules/client-logs/logs-repository";

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

const createLogsRepository = () => {
  try {
    const dynamoClient = createLogsDynamoClient();
    const logsTable = LogsTable.create({
      documentClient: createLogsDocumentClient(dynamoClient),
      tableName: clientLogsFeatureConfig.dynamoTableName,
    });
    const repository = new LogsRepositoryDynamodb({
      logsTable,
      logByCheckoutOrOrderId: ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable),
      logByDateEntity: ClientLogDynamoEntityFactory.createLogByDate(logsTable),
    });

    return repository;
  } catch (e) {
    logger.error("Failed to create DynamoDB repository");
    captureException(new Error("Failed to create DynamoDB repository"));

    return null;
  }
};

export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
        const logsRepo = clientLogsFeatureConfig.isEnabled ? createLogsRepository() : null;

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

            logsRepo &&
              ClientLogStoreRequest.create({
                checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                message: "Taxes not calculated. Missing address or lines",
                channelId: ctx.payload.taxBase.channel.slug,
                level: "info",
              })
                .map((value) => {
                  logsRepo.writeLog({
                    saleorApiUrl: ctx.authData.saleorApiUrl,
                    appId: ctx.authData.appId,
                    clientLogRequest: value,
                  });
                })
                .mapErr((err) => {
                  logger.error("Failed to create log", {
                    error: err,
                  });
                });

            return res.status(400).json({ message: payloadVerificationResult.error.message });
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

            logsRepo &&
              ClientLogStoreRequest.create({
                checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                message: "Taxes not calculated. App faced problem with configuration.",
                channelId: ctx.payload.taxBase.channel.slug,
                level: "error",
              })
                .map((value) => {
                  logsRepo.writeLog({
                    saleorApiUrl: ctx.authData.saleorApiUrl,
                    appId: ctx.authData.appId,
                    clientLogRequest: value,
                  });
                })
                .mapErr((err) => {
                  logger.error("Failed to create log", {
                    error: err,
                  });
                });

            return res.status(400).json({
              message: `App configuration is broken for order: ${payload.taxBase.sourceObject.id}`,
            });
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
              logsRepo &&
                ClientLogStoreRequest.create({
                  checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                  message: "Taxes not calculated. App faced problem with configuration.",
                  channelId: ctx.payload.taxBase.channel.slug,
                  level: "error",
                })
                  .map((value) => {
                    logsRepo.writeLog({
                      saleorApiUrl: ctx.authData.saleorApiUrl,
                      appId: ctx.authData.appId,
                      clientLogRequest: value,
                    });
                  })
                  .mapErr((err) => {
                    logger.error("Failed to create log", {
                      error: err,
                    });
                  });

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

            logger.info("Taxes calculated", { calculatedTaxes });

            logsRepo &&
              ClientLogStoreRequest.create({
                checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                message: "Taxes calculated",
                channelId: ctx.payload.taxBase.channel.slug,
                level: "info",
                attributes: {
                  calculatedTaxes: calculatedTaxes,
                },
              })
                .map((value) => {
                  logsRepo.writeLog({
                    saleorApiUrl: ctx.authData.saleorApiUrl,
                    appId: ctx.authData.appId,
                    clientLogRequest: value,
                  });
                })
                .mapErr((err) => {
                  logger.error("Failed to create log", {
                    error: err,
                  });
                });

            return res.status(200).json(ctx.buildResponse(calculatedTaxes));
          } else if (avataxWebhookServiceResult.isErr()) {
            const err = avataxWebhookServiceResult.error;

            logger.warn(`Error in taxes calculation occurred: ${err.name} ${err.message}`, {
              error: err,
            });

            switch (err["constructor"]) {
              case AvataxWebhookServiceFactory.BrokenConfigurationError: {
                logsRepo &&
                  ClientLogStoreRequest.create({
                    checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                    message: "Taxes not calculated. App faced problem with configuration.",
                    channelId: ctx.payload.taxBase.channel.slug,
                    level: "error",
                  })
                    .map((value) => {
                      logsRepo.writeLog({
                        saleorApiUrl: ctx.authData.saleorApiUrl,
                        appId: ctx.authData.appId,
                        clientLogRequest: value,
                      });
                    })
                    .mapErr((err) => {
                      logger.error("Failed to create log", {
                        error: err,
                      });
                    });

                return res.status(400).json({
                  message: `App is not configured properly for order: ${payload.taxBase.sourceObject.id}`,
                });
              }
              default: {
                Sentry.captureException(avataxWebhookServiceResult.error);
                logger.fatal("Unhandled error", { error: err });

                logsRepo &&
                  ClientLogStoreRequest.create({
                    checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                    message: "Taxes not calculated. Unknown error",
                    channelId: ctx.payload.taxBase.channel.slug,
                    level: "error",
                  })
                    .map((value) => {
                      logsRepo.writeLog({
                        saleorApiUrl: ctx.authData.saleorApiUrl,
                        appId: ctx.authData.appId,
                        clientLogRequest: value,
                      });
                    })
                    .mapErr((err) => {
                      logger.error("Failed to create log", {
                        error: err,
                      });
                    });

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

            logsRepo &&
              ClientLogStoreRequest.create({
                checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                message: "Taxes not calculated. Avalara returned error ",
                channelId: ctx.payload.taxBase.channel.slug,
                level: "error",
                attributes: {
                  avalaraError: error.message,
                },
              })
                .map((value) => {
                  logsRepo.writeLog({
                    saleorApiUrl: ctx.authData.saleorApiUrl,
                    appId: ctx.authData.appId,
                    clientLogRequest: value,
                  });
                })
                .mapErr((err) => {
                  logger.error("Failed to create log", {
                    error: err,
                  });
                });
            return res.status(400).json({
              message:
                "GetTaxError: A problem occurred when you attempted to create a transaction through AvaTax. Check your address or line items.",
            });
          }

          if (error instanceof AvataxInvalidAddressError) {
            logsRepo &&
              ClientLogStoreRequest.create({
                checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                message: "Taxes not calculated. Avalara returned error: invalid address",
                channelId: ctx.payload.taxBase.channel.slug,
                level: "error",
                attributes: {
                  avalaraError: error.message,
                },
              })
                .map((value) => {
                  logsRepo.writeLog({
                    saleorApiUrl: ctx.authData.saleorApiUrl,
                    appId: ctx.authData.appId,
                    clientLogRequest: value,
                  });
                })
                .mapErr((err) => {
                  logger.error("Failed to create log", {
                    error: err,
                  });
                });

            logger.warn(
              "InvalidAppAddressError: App returns status 400 due to broken address configuration",
              { error },
            );

            return res.status(400).json({
              message: "InvalidAppAddressError: Check address in app configuration",
            });
          }

          if (error instanceof AvataxStringLengthError) {
            logsRepo &&
              ClientLogStoreRequest.create({
                checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                message: "Taxes not calculated. Avalara returned error: invalid address",
                channelId: ctx.payload.taxBase.channel.slug,
                level: "error",
                attributes: {
                  avalaraError: error.message,
                },
              })
                .map((value) => {
                  logsRepo.writeLog({
                    saleorApiUrl: ctx.authData.saleorApiUrl,
                    appId: ctx.authData.appId,
                    clientLogRequest: value,
                  });
                })
                .mapErr((err) => {
                  logger.error("Failed to create log", {
                    error: err,
                  });
                });

            logger.warn(
              "AvataxStringLengthError: App returns status 400 due to not valid address data",
              { error },
            );

            return res.status(400).json({
              message: `AvaTax service returned validation error: ${error.description} `,
            });
          }

          if (error instanceof AvataxEntityNotFoundError) {
            logsRepo &&
              ClientLogStoreRequest.create({
                checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
                message: "Taxes not calculated. Avalara returned error: entity not found",
                channelId: ctx.payload.taxBase.channel.slug,
                level: "error",
                attributes: {
                  avalaraError: error.message,
                },
              })
                .map((value) => {
                  logsRepo.writeLog({
                    saleorApiUrl: ctx.authData.saleorApiUrl,
                    appId: ctx.authData.appId,
                    clientLogRequest: value,
                  });
                })
                .mapErr((err) => {
                  logger.error("Failed to create log", {
                    error: err,
                  });
                });

            logger.warn(
              "AvataxEntityNotFoundError: App returns status 400 due to entity not found. See https://developer.avalara.com/avatax/errors/EntityNotFoundError/ for more details",
              { error },
            );

            return res.status(400).json({
              message: `AvaTax service returned validation error: ${error.description} `,
            });
          }

          Sentry.captureException(error);

          logsRepo &&
            ClientLogStoreRequest.create({
              checkoutOrOrderId: ctx.payload.taxBase.sourceObject.id,
              message: "Taxes not calculated. Unhandled error",
              channelId: ctx.payload.taxBase.channel.slug,
              level: "error",
              attributes: {},
            })
              .map((value) => {
                logsRepo.writeLog({
                  saleorApiUrl: ctx.authData.saleorApiUrl,
                  appId: ctx.authData.appId,
                  clientLogRequest: value,
                });
              })
              .mapErr((err) => {
                logger.error("Failed to create log", {
                  error: err,
                });
              });

          return res.status(500).json({ message: "Unhandled error" });
        }
      }),
    ),
    "/api/order-calculate-taxes",
  ),
  loggerContext,
);
