import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { compose } from "@saleor/apps-shared";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";
import { UntypedCalculateTaxesDocument } from "generated/graphql";
import { saleorApp } from "saleor-app";

import { AppConfigExtractor } from "@/lib/app-config-extractor";
import { AppConfigurationLogger } from "@/lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "@/lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "@/lib/error-utils";
import { createLogger } from "@/logger";
import { loggerContext, withLoggerContextAppRouter } from "@/logger-context";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-lines-transformer";
import { AvataxCalculateTaxesResponseTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-response-transformer";
import { AvataxCalculateTaxesTaxCodeMatcher } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-tax-code-matcher";
import { CalculateTaxesUseCase } from "@/modules/calculate-taxes/use-case/calculate-taxes.use-case";
import { LogWriterFactory } from "@/modules/client-logs/log-writer-factory";
import { AvataxInvalidAddressError } from "@/modules/taxes/tax-error";
import { checkoutCalculateTaxesSyncWebhookReponse } from "@/modules/webhooks/definitions/checkout-calculate-taxes";
import { CalculateTaxesPayload } from "@/modules/webhooks/payloads/calculate-taxes-payload";

const checkoutCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "CheckoutCalculateTaxes",
  apl: saleorApp.apl,
  event: "CHECKOUT_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/checkout-calculate-taxes",
});

const withMetadataCache = wrapWithMetadataCache(metadataCache);

const handler = checkoutCalculateTaxesSyncWebhook.createHandler(async (_req, ctx) => {
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
    console.log("configExtractor", configExtractor);

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

      return Response.json(
        {
          message: `App configuration is broken for checkout: ${payload.taxBase.sourceObject.id}`,
        },
        {
          status: 400,
        },
      );
    }

    const useCaseResult = await useCase.calculateTaxes(payload, authData);

    return useCaseResult.match(
      (value) => {
        return Response.json(checkoutCalculateTaxesSyncWebhookReponse(value), {
          status: 200,
        });
      },
      (error) => {
        logger.warn("Error calculating taxes", { error });

        switch (error.constructor) {
          case CalculateTaxesUseCase.FailedCalculatingTaxesError: {
            return Response.json(
              {
                message: `Failed to calculate taxes for checkout: ${payload.taxBase.sourceObject.id}`,
              },
              {
                status: 500,
              },
            );
          }
          case CalculateTaxesUseCase.ConfigBrokenError: {
            return Response.json(
              {
                message: `Failed to calculate taxes due to invalid configuration for checkout: ${payload.taxBase.sourceObject.id}`,
              },
              {
                status: 500,
              },
            );
          }
          case CalculateTaxesUseCase.ExpectedIncompletePayloadError: {
            return Response.json(
              {
                message: `Taxes can't be calculated due to incomplete payload for checkout: ${payload.taxBase.sourceObject.id}`,
              },
              {
                status: 400,
              },
            );
          }
          case CalculateTaxesUseCase.UnhandledError: {
            captureException(error);

            return Response.json(
              {
                message: `Failed to calculate taxes (Unhandled error) for checkout: ${payload.taxBase.sourceObject.id}`,
              },
              {
                status: 500,
              },
            );
          }
        }
        return new Response("Unhandled error", { status: 500 });
      },
    );
  } catch (error) {
    // todo this should be now available in usecase. Catch it from FailedCalculatingTaxesError
    if (error instanceof AvataxInvalidAddressError) {
      logger.warn(
        "InvalidAppAddressError: App returns status 400 due to broken address configuration",
        { error },
      );

      return Response.json(
        {
          message: "InvalidAppAddressError: Check address in app configuration",
        },
        {
          status: 400,
        },
      );
    }

    Sentry.captureException(error);

    return Response.json({ message: "Unhandled error" }, { status: 500 });
  }
});

export type WebApiHandler = (req: Request) => Response | Promise<Response>;

export const POST = compose(withLoggerContextAppRouter)(handler);
