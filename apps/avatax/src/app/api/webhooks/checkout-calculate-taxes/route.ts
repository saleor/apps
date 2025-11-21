import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException, setTag } from "@sentry/nextjs";

import { AppConfigExtractor } from "@/lib/app-config-extractor";
import { AppConfigurationLogger } from "@/lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "@/lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "@/lib/error-utils";
import { appExternalTracer } from "@/lib/otel/tracing";
import { withFlushOtelMetrics } from "@/lib/otel/with-flush-otel-metrics";
import { createLogger } from "@/logger";
import { loggerContext, withLoggerContext } from "@/logger-context";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-lines-transformer";
import { AvataxCalculateTaxesResponseTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-response-transformer";
import { AvataxCalculateTaxesTaxCodeMatcher } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-tax-code-matcher";
import { CalculateTaxesUseCase } from "@/modules/calculate-taxes/use-case/calculate-taxes.use-case";
import { LogWriterFactory } from "@/modules/client-logs/log-writer-factory";
import { AvataxInvalidAddressError } from "@/modules/taxes/tax-error";
import { checkoutCalculateTaxesSyncWebhook } from "@/modules/webhooks/definitions/checkout-calculate-taxes";

const logger = createLogger("checkoutCalculateTaxesSyncWebhook");

const withMetadataCache = wrapWithMetadataCache(metadataCache);

const checkoutCalculateTaxesSyncWebhookReponse =
  buildSyncWebhookResponsePayload<"CHECKOUT_CALCULATE_TAXES">;

const handler = checkoutCalculateTaxesSyncWebhook.createHandler(async (_req, ctx) => {
  return appExternalTracer.startActiveSpan(
    "executing checkoutCalculateTaxes webhook handler",
    {
      kind: SpanKind.SERVER,
    },
    async (span) => {
      /**
       * Create deps in handler, so it's potentially faster and reduce lambda start
       * TODO: It's rather not true, we should move it outside
       */
      const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(
        logger,
        captureException,
      );
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
          setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
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

          span.recordException(config.error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "App configuration is broken",
          });

          return Response.json(
            {
              message: `App configuration is broken for checkout: ${payload.taxBase.sourceObject.id}`,
            },
            { status: 400 },
          );
        }

        return useCase.calculateTaxes(payload, authData).then((result) => {
          return result.match(
            (value) => {
              span.setStatus({
                code: SpanStatusCode.OK,
                message: "Taxes calculated successfully",
              });

              return Response.json(checkoutCalculateTaxesSyncWebhookReponse(value), {
                status: 200,
              });
            },
            (error) => {
              logger.warn("Error calculating taxes", { error });
              span.recordException(error);

              switch (error.constructor) {
                case CalculateTaxesUseCase.FailedCalculatingTaxesError: {
                  span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: "Failed to calculate taxes: error from AvaTax API",
                  });

                  return Response.json(
                    {
                      message: `Failed to calculate taxes for checkout: ${payload.taxBase.sourceObject.id}`,
                    },
                    { status: 500 },
                  );
                }

                case CalculateTaxesUseCase.ConfigBrokenError: {
                  span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: "Failed to calculate taxes: invalid configuration",
                  });

                  return Response.json(
                    {
                      message: `Failed to calculate taxes due to invalid configuration for checkout: ${payload.taxBase.sourceObject.id}`,
                    },
                    { status: 500 },
                  );
                }

                case CalculateTaxesUseCase.ExpectedIncompletePayloadError: {
                  span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: "Failed to calculate taxes: incomplete payload",
                  });

                  return Response.json(
                    {
                      message: `Taxes can't be calculated due to incomplete payload for checkout: ${payload.taxBase.sourceObject.id}`,
                    },
                    { status: 202 },
                  );
                }

                default:
                case CalculateTaxesUseCase.UnhandledError: {
                  captureException(error);
                  span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: "Failed to calculate taxes: unhandled error",
                  });

                  return Response.json(
                    {
                      message: `Failed to calculate taxes (Unhandled error) for checkout: ${payload.taxBase.sourceObject.id}`,
                    },
                    { status: 500 },
                  );
                }
              }
            },
          );
        });
      } catch (error) {
        span.recordException(error as Error);
        // todo this should be now available in usecase. Catch it from FailedCalculatingTaxesError
        if (error instanceof AvataxInvalidAddressError) {
          logger.warn(
            "InvalidAppAddressError: App returns status 400 due to broken address configuration",
            { error },
          );

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to calculate taxes: error from AvaTax API",
          });

          return Response.json(
            {
              message: "InvalidAppAddressError: Check address in app configuration",
            },
            { status: 400 },
          );
        }

        captureException(error);

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to calculate taxes: unhandled error",
        });

        return Response.json({ message: "Unhandled error" }, { status: 500 });
      }
    },
  );
});

/**
 * TODO: Add tests to handler
 */
export const POST = compose(
  withLoggerContext,
  withFlushOtelMetrics,
  withMetadataCache,
  withSpanAttributesAppRouter,
)(handler);
