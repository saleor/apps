import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";

import { AppConfigExtractor } from "@/lib/app-config-extractor";
import { AppConfigurationLogger } from "@/lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCacheAppRouter } from "@/lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "@/lib/error-utils";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { CalculateTaxesUseCase } from "@/modules/calculate-taxes/use-case/calculate-taxes.use-case";
import { AvataxInvalidAddressError } from "@/modules/taxes/tax-error";
import { checkoutCalculateTaxesSyncWebhook2 } from "@/wh";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("checkoutCalculateTaxesSyncWebhook");

const withMetadataCache = wrapWithMetadataCacheAppRouter(metadataCache);

const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(logger, captureException);
const useCase = new CalculateTaxesUseCase({
  configExtractor: new AppConfigExtractor(),
});

const handler = checkoutCalculateTaxesSyncWebhook2.createHandler(
  async (req, ctx): Promise<NextResponse> => {
    try {
      const { payload, authData } = ctx;

      subscriptionErrorChecker.checkPayload(payload);

      logger.info("Tax base payload for checkout calculate taxes", {
        payload: payload.taxBase,
      });

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

        return NextResponse.json(
          {
            message: `App configuration is broken for checkout: ${payload.taxBase.sourceObject.id}`,
          },
          { status: 400 },
        );
      }

      metadataCache.setMetadata(appMetadata);

      const res = useCase.calculateTaxes(payload, authData).then((result) => {
        return result.match(
          (value) => {
            return NextResponse.json(ctx.buildResponse(value), {
              status: 200,
            });
          },
          (err) => {
            logger.warn("Error calculating taxes", { error: err });

            switch (err.constructor) {
              case CalculateTaxesUseCase.FailedCalculatingTaxesError: {
                return NextResponse.json(
                  {
                    message: `Failed to calculate taxes for checkout: ${payload.taxBase.sourceObject.id}`,
                  },
                  {
                    status: 500,
                  },
                );
              }
              case CalculateTaxesUseCase.ConfigBrokenError: {
                return NextResponse.json(
                  {
                    message: `Failed to calculate taxes due to invalid configuration for checkout: ${payload.taxBase.sourceObject.id}`,
                  },
                  { status: 400 },
                );
              }
              case CalculateTaxesUseCase.ExpectedIncompletePayloadError: {
                return NextResponse.json(
                  {
                    message: `Taxes can't be calculated due to incomplete payload for checkout: ${payload.taxBase.sourceObject.id}`,
                  },
                  { status: 400 },
                );
              }
              case CalculateTaxesUseCase.UnhandledError: {
                captureException(err);

                return NextResponse.json(
                  {
                    message: `Failed to calculate taxes (Unhandled error) for checkout: ${payload.taxBase.sourceObject.id}`,
                  },
                  {
                    status: 500,
                  },
                );
              }
              default: {
                return NextResponse.json({});
              }
            }
          },
        );
      });

      return res;
    } catch (error) {
      // todo this should be now available in usecase. Catch it from FailedCalculatingTaxesError
      if (error instanceof AvataxInvalidAddressError) {
        logger.warn(
          "InvalidAppAddressError: App returns status 400 due to broken address configuration",
          { error },
        );

        return NextResponse.json(
          {
            message: "InvalidAppAddressError: Check address in app configuration",
          },
          { status: 400 },
        );
      }

      Sentry.captureException(error);

      return NextResponse.json({ message: "Unhandled error" }, { status: 500 });
    }
  },
);

export const POST = withMetadataCache(handler) as (req: NextRequest) => Promise<NextResponse>;
