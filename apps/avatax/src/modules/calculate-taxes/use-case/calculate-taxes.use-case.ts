import { AuthData } from "@saleor/app-sdk/APL";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";
import { err, fromPromise, Result } from "neverthrow";

import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "@/modules/avatax/discounts";

import { MetadataItem } from "../../../../generated/graphql";
import { BaseError } from "../../../error";
import { AppConfigExtractor, IAppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { createLogger } from "../../../logger";
import { AvataxCalculateTaxesResponse } from "../../avatax/calculate-taxes/avatax-calculate-taxes-adapter";
import { TaxIncompletePayloadErrors } from "../../taxes/tax-error";
import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { verifyCalculateTaxesPayload } from "../../webhooks/validate-webhook-payload";

export class CalculateTaxesUseCase {
  private logger = createLogger("CalculateTaxesUseCase");

  private discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

  static CalculateTaxesUseCaseError = BaseError.subclass("CalculateTaxesUseCaseError");
  static ExpectedIncompletePayloadError = this.CalculateTaxesUseCaseError.subclass(
    "ExpectedIncompletePayloadError",
  );
  static ConfigBrokenError = this.CalculateTaxesUseCaseError.subclass("ConfigBrokenError");
  static UnhandledError = this.CalculateTaxesUseCaseError.subclass("UnhandledError");
  static FailedCalculatingTaxesError = this.CalculateTaxesUseCaseError.subclass(
    "FailedCalculatingTaxesError",
  );

  constructor(
    private deps: {
      configExtractor: IAppConfigExtractor;
    },
  ) {}

  private verifyPayload(payload: CalculateTaxesPayload) {
    const payloadVerificationResult = verifyCalculateTaxesPayload(payload);

    return payloadVerificationResult.mapErr((innerError) => {
      switch (innerError["constructor"]) {
        case TaxIncompletePayloadErrors.MissingLinesError:
        case TaxIncompletePayloadErrors.MissingAddressError: {
          return new CalculateTaxesUseCase.ExpectedIncompletePayloadError(
            "Payload is incomplete and taxes cant be calculated. This is expected",
            {
              errors: [innerError],
            },
          );
        }
        default: {
          return new CalculateTaxesUseCase.UnhandledError("Failed to verify payload", {
            errors: [innerError],
          });
        }
      }
    });
  }

  private extractConfig(appMetadata: MetadataItem[], channelSlug: string) {
    return this.deps.configExtractor
      .extractAppConfigFromPrivateMetadata(appMetadata)
      .map((config) => {
        try {
          new AppConfigurationLogger(this.logger).logConfiguration(config, channelSlug);
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
  }

  async calculateTaxes(
    payload: CalculateTaxesPayload,
    authData: AuthData,
  ): Promise<
    Result<
      AvataxCalculateTaxesResponse,
      (typeof CalculateTaxesUseCase.CalculateTaxesUseCaseError)["prototype"]
    >
  > {
    const payloadVerificationResult = this.verifyPayload(payload);

    if (payloadVerificationResult.isErr()) {
      return err(payloadVerificationResult.error);
    }

    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.taxBase.channel.slug;

    const config = this.extractConfig(appMetadata, channelSlug);

    if (config.isErr()) {
      this.logger.warn("Failed to extract app config from metadata", {
        error: config.error,
      });

      return err(
        new CalculateTaxesUseCase.ConfigBrokenError("Failed to extract app config from metadata", {
          errors: [config.error],
        }),
      );
    }

    const AvataxWebhookServiceFactory = await import(
      "../../../modules/taxes/avatax-webhook-service-factory"
    ).then((m) => m.AvataxWebhookServiceFactory);

    const webhookServiceResult = AvataxWebhookServiceFactory.createFromConfig(
      config.value,
      channelSlug,
    ).mapErr((innerError) => {
      this.logger.warn(
        `Error in taxes calculation occurred: ${innerError.name} ${innerError.message}`,
        {
          error: innerError,
        },
      );

      switch (innerError["constructor"]) {
        case AvataxWebhookServiceFactory.BrokenConfigurationError: {
          return err(
            new CalculateTaxesUseCase.ConfigBrokenError(
              "Failed to create instance of AvaTax connection due to invalid config",
              {
                errors: [innerError],
              },
            ),
          );
        }
        default: {
          Sentry.captureException(innerError);
          this.logger.fatal("Unhandled error", { error: innerError });

          return err(
            new CalculateTaxesUseCase.UnhandledError("Unhandled error", { errors: [innerError] }),
          );
        }
      }
    });

    if (webhookServiceResult.isErr()) {
      return webhookServiceResult.error;
    }

    this.logger.info("Found active connection service. Calculating taxes...");

    const { taxProvider } = webhookServiceResult.value;
    const providerConfig = config.value.getConfigForChannelSlug(channelSlug);

    if (providerConfig.isErr()) {
      return err(
        new CalculateTaxesUseCase.ConfigBrokenError(
          "Failed to create instance of AvaTax connection due to invalid config",
          {
            errors: [providerConfig.error],
          },
        ),
      );
    }

    return fromPromise(
      taxProvider.calculateTaxes(
        payload,
        providerConfig.value.avataxConfig.config,
        authData,
        this.discountsStrategy,
      ),
      (err) =>
        new CalculateTaxesUseCase.FailedCalculatingTaxesError("Failed to calculate taxes", {
          errors: [err],
        }),
    ).map((results) => {
      this.logger.info("Taxes calculated", { calculatedTaxes: JSON.stringify(results) });

      return results;
    });
  }
}
