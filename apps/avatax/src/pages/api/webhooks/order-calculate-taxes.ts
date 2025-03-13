import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { AuthData } from "@saleor/app-sdk/APL";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";

import { AppConfigExtractor } from "@/lib/app-config-extractor";
import { AppConfigurationLogger } from "@/lib/app-configuration-logger";
import { appInternalTracer } from "@/lib/app-internal-tracer";
import { metadataCache, wrapWithMetadataCache } from "@/lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "@/lib/error-utils";
import { createLogger } from "@/logger";
import { loggerContext, withLoggerContext } from "@/logger-context";
import { AvataxClient } from "@/modules/avatax/avatax-client";
import { AvataxConfig } from "@/modules/avatax/avatax-connection-schema";
import { AvataxEntityTypeMatcher } from "@/modules/avatax/avatax-entity-type-matcher";
import { AvataxSdkClientFactory } from "@/modules/avatax/avatax-sdk-client-factory";
import { AvataxCalculateTaxesAdapter } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxCalculateTaxesPayloadService } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-lines-transformer";
import { AvataxCalculateTaxesPayloadTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-transformer";
import { AvataxCalculateTaxesResponseTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-response-transformer";
import { AvataxCalculateTaxesTaxCodeMatcher } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-tax-code-matcher";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "@/modules/avatax/discounts";
import { AvataxTaxCodeMatchesService } from "@/modules/avatax/tax-code/avatax-tax-code-matches.service";
import { CalculateTaxesLogRequest } from "@/modules/client-logs/calculate-taxes-log-request";
import { LogWriterFactory } from "@/modules/client-logs/log-writer-factory";
import {
  AvataxEntityNotFoundError,
  AvataxGetTaxError,
  AvataxInvalidAddressError,
  AvataxStringLengthError,
} from "@/modules/taxes/tax-error";
import { orderCalculateTaxesSyncWebhook } from "@/modules/webhooks/definitions/order-calculate-taxes";
import { CalculateTaxesPayload } from "@/modules/webhooks/payloads/calculate-taxes-payload";
import { verifyCalculateTaxesPayload } from "@/modules/webhooks/validate-webhook-payload";

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

const createAvataxCalculateTaxesAdapter = (avaTaxClient: AvataxClient) => {
  const avataxCalculateTaxesResponseTransformer = new AvataxCalculateTaxesResponseTransformer();

  return new AvataxCalculateTaxesAdapter(avaTaxClient, avataxCalculateTaxesResponseTransformer);
};

const createAvataxCalculateTaxesPayloadTransformer = (
  entityTypeMatcher: AvataxEntityTypeMatcher,
) => {
  const avataxCalculateTaxesTaxCodeMatcher = new AvataxCalculateTaxesTaxCodeMatcher();
  const avataxCalculateTaxesPayloadLinesTransformer =
    new AvataxCalculateTaxesPayloadLinesTransformer(avataxCalculateTaxesTaxCodeMatcher);

  return new AvataxCalculateTaxesPayloadTransformer(
    avataxCalculateTaxesPayloadLinesTransformer,
    entityTypeMatcher,
  );
};

/**
 * @deprecated use CalculateTaxesUseCase instead, see checkout-calculate-taxes handler
 */
async function calculateTaxes(
  payload: CalculateTaxesPayload,
  avataxConfig: AvataxConfig,
  authData: AuthData,
  discountStrategy: AutomaticallyDistributedProductLinesDiscountsStrategy,
) {
  const avaTaxSdk = new AvataxSdkClientFactory().createClient(avataxConfig);
  const avaTaxClient = new AvataxClient(avaTaxSdk);
  const calculateTaxesPayloadTransformer = createAvataxCalculateTaxesPayloadTransformer(
    new AvataxEntityTypeMatcher(avaTaxClient),
  );
  const calculateTaxesAdapter = createAvataxCalculateTaxesAdapter(avaTaxClient);
  const payloadService = new AvataxCalculateTaxesPayloadService(
    AvataxTaxCodeMatchesService.createFromAuthData(authData),
    calculateTaxesPayloadTransformer,
  );

  const avataxModel = await payloadService.getPayload(payload, avataxConfig, discountStrategy);

  const response = await calculateTaxesAdapter.send(avataxModel);

  return response;
}

const handler = orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
  return appInternalTracer.startActiveSpan(
    "executing orderCalculateTaxes webhook handler",
    {
      kind: SpanKind.SERVER,
    },
    async (span) => {
      const logWriter = logsWriterFactory.createWriter(ctx.authData);

      const channelSlug = ctx.payload.taxBase.channel.slug;
      const orderId = ctx.payload.taxBase.sourceObject.id;
      const appMetadata = ctx.payload.recipient?.privateMetadata ?? [];

      metadataCache.setMetadata(appMetadata);
      try {
        const { payload, authData } = ctx;

        span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, authData.saleorApiUrl);

        subscriptionErrorChecker.checkPayload(payload);

        loggerContext.set("channelSlug", channelSlug);
        loggerContext.set("orderId", orderId);

        if (payload.version) {
          Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          span.setAttribute(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        }

        logger.info("Handler for ORDER_CALCULATE_TAXES webhook called");

        const payloadVerificationResult = verifyCalculateTaxesPayload(payload);

        if (payloadVerificationResult.isErr()) {
          logger.warn("Failed to calculate taxes, due to incomplete payload", {
            error: payloadVerificationResult.error,
          });

          CalculateTaxesLogRequest.createErrorLog({
            sourceId: payload.taxBase.sourceObject.id,
            channelSlug: payload.taxBase.channel.slug,
            sourceType: "order",
            errorReason: "Missing address or lines",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.recordException(payloadVerificationResult.error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to calucalted taxes due to incomplete payload",
          });
          span.end();

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

          CalculateTaxesLogRequest.createErrorLog({
            sourceId: payload.taxBase.sourceObject.id,
            channelSlug: payload.taxBase.channel.slug,
            sourceType: "order",
            errorReason: "Cannot get app configuration",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.recordException(config.error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to calculate taxes: invalid configuration",
          });
          span.end();

          return res.status(400).json({
            message: `App configuration is broken for order: ${payload.taxBase.sourceObject.id}`,
          });
        }

        const providerConfig = config.value.getConfigForChannelSlug(channelSlug);

        if (providerConfig.isErr()) {
          CalculateTaxesLogRequest.createErrorLog({
            sourceId: payload.taxBase.sourceObject.id,
            channelSlug: payload.taxBase.channel.slug,
            sourceType: "order",
            errorReason: "Invalid app configuration",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.recordException(providerConfig.error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to calculate taxes: invalid configuration",
          });
          span.end();

          return res.status(400).json({
            message: `App is not configured properly for order: ${payload.taxBase.sourceObject.id}`,
          });
        }

        const calculatedTaxes = await calculateTaxes(
          payload,
          providerConfig.value.avataxConfig.config,
          ctx.authData,
          discountStrategy,
        );

        logger.info("Taxes calculated - returning response do Saleor");

        CalculateTaxesLogRequest.createSuccessLog({
          sourceId: payload.taxBase.sourceObject.id,
          channelSlug: payload.taxBase.channel.slug,
          sourceType: "order",
          calculatedTaxesResult: calculatedTaxes,
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        span.setStatus({
          code: SpanStatusCode.OK,
          message: "Taxes calculated successfully",
        });
        span.end();

        return res.status(200).json(ctx.buildResponse(calculatedTaxes));
      } catch (error) {
        span.recordException(error as Error); // todo: remove casting when error handling is refactored

        if (error instanceof AvataxGetTaxError) {
          logger.warn(
            "GetTaxError: App returns status 400 due to problem when user attempted to create a transaction through AvaTax",
            {
              error,
            },
          );

          CalculateTaxesLogRequest.createErrorLog({
            sourceId: orderId,
            channelSlug: channelSlug,
            sourceType: "order",
            errorReason: "AvaTax API returned an error",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to calculate taxes: error from AvaTax API",
          });
          span.end();

          return res.status(400).json({
            message:
              "GetTaxError: A problem occurred when you attempted to create a transaction through AvaTax. Check your address or line items.",
          });
        }

        if (error instanceof AvataxInvalidAddressError) {
          CalculateTaxesLogRequest.createErrorLog({
            sourceId: orderId,
            channelSlug: channelSlug,
            sourceType: "order",
            errorReason: "Invalid address",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          logger.warn(
            "InvalidAppAddressError: App returns status 400 due to broken address configuration",
            { error },
          );

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to calculate taxes: error from AvaTax API",
          });
          span.end();

          return res.status(400).json({
            message: "InvalidAppAddressError: Check address in app configuration",
          });
        }

        if (error instanceof AvataxStringLengthError) {
          CalculateTaxesLogRequest.createErrorLog({
            sourceId: orderId,
            channelSlug: channelSlug,
            sourceType: "order",
            errorReason: "Invalid address",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          logger.warn(
            "AvataxStringLengthError: App returns status 400 due to not valid address data",
            {
              error,
            },
          );

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to calculate taxes: error from AvaTax API",
          });
          span.end();

          return res.status(400).json({
            message: `AvaTax service returned validation error: ${error.description} `,
          });
        }

        if (error instanceof AvataxEntityNotFoundError) {
          CalculateTaxesLogRequest.createErrorLog({
            sourceId: orderId,
            channelSlug: channelSlug,
            sourceType: "order",
            errorReason: "Entity not found",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          logger.warn(
            "AvataxEntityNotFoundError: App returns status 400 due to entity not found. See https://developer.avalara.com/avatax/errors/EntityNotFoundError/ for more details",
            { error },
          );

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to calculate taxes: error from AvaTax API",
          });
          span.end();

          return res.status(400).json({
            message: `AvaTax service returned validation error: ${error.description} `,
          });
        }

        Sentry.captureException(error);

        CalculateTaxesLogRequest.createErrorLog({
          sourceId: orderId,
          channelSlug: channelSlug,
          sourceType: "order",
          errorReason: "Unhandled error",
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to calculate taxes: unhandled error",
        });
        span.end();

        return res.status(500).json({ message: "Unhandled error" });
      }
    },
  );
});

export default compose(withLoggerContext, withMetadataCache, withSpanAttributes)(handler);
