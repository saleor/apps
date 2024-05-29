import { AuthData } from "@saleor/app-sdk/APL";
import { createLogger } from "@saleor/apps-logger";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";
import { waitUntil } from "@vercel/functions";
import { Result, err, fromPromise } from "neverthrow";
import { MetadataItem } from "../../../../generated/graphql";
import { BaseError } from "../../../error";
import { AppConfigExtractor, IAppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { AvataxCalculateTaxesResponse } from "../../avatax/calculate-taxes/avatax-calculate-taxes-adapter";
import {
  TaxesCalculatedInCheckoutLog,
  TaxesCalculatedInOrderLog,
  TaxesCalculationFailedConfigErrorLog,
  TaxesCalculationFailedInvalidPayloadLog,
  TaxesCalculationFailedUnhandledErrorLog,
  TaxesCalculationProviderErrorLog,
} from "../../public-log-drain/public-events";
import { PublicLogDrain } from "../../public-log-drain/public-log-drain";
import { LogDrainJsonTransporter } from "../../public-log-drain/transporters/public-log-drain-json-transporter";
import { LogDrainOtelTransporter } from "../../public-log-drain/transporters/public-log-drain-otel-transporter";
import { TaxIncompletePayloadErrors } from "../../taxes/tax-error";
import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { verifyCalculateTaxesPayload } from "../../webhooks/validate-webhook-payload";

class PrivateCalculateTaxesUseCase {
  private logger = createLogger("CalculateTaxesUseCase");

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
    protected deps: {
      configExtractor: IAppConfigExtractor;
      publicLogDrain: PublicLogDrain;
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
      this.logger.warn("Failed to extract app config from metadata", { error: config.error });

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
              "Failed to create instance of Avatax connection due to invalid config",
              {
                errors: [innerError],
              },
            ),
          );
        }
        default: {
          Sentry.captureException(innerError);
          this.logger.fatal("Unhandled error", { error: err });

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
          "Failed to create instance of Avatax connection due to invalid config",
          {
            errors: [providerConfig.error],
          },
        ),
      );
    }

    if (providerConfig.value.avataxConfig.config.logsSettings?.otel.enabled) {
      const otelLogDrainTransporter = new LogDrainOtelTransporter();
      let headers: Record<string, string>;

      try {
        headers = JSON.parse(
          providerConfig.value.avataxConfig.config.logsSettings.otel.headers ?? "",
        );
      } catch {
        headers = {};
      }
      const url = providerConfig.value.avataxConfig.config.logsSettings.otel.url ?? "";

      otelLogDrainTransporter.setSettings({
        url,
        headers,
      });

      this.deps.publicLogDrain.addTransporter(otelLogDrainTransporter);
    }

    if (providerConfig.value.avataxConfig.config.logsSettings?.json.enabled) {
      const jsonLogDrainTransporter = new LogDrainJsonTransporter();
      let headers: Record<string, string>;

      try {
        headers = JSON.parse(
          providerConfig.value.avataxConfig.config.logsSettings.json.headers ?? "",
        );
      } catch {
        headers = {};
      }
      const url = providerConfig.value.avataxConfig.config.logsSettings.json.url ?? "";

      jsonLogDrainTransporter.setSettings({
        endpoint: url,
        headers,
      });

      this.deps.publicLogDrain.addTransporter(jsonLogDrainTransporter);
    }

    return fromPromise(
      taxProvider.calculateTaxes(payload, providerConfig.value.avataxConfig.config, authData),
      (err) =>
        new CalculateTaxesUseCase.FailedCalculatingTaxesError("Failed to calculate taxes", {
          errors: [err],
        }),
    ).map((results) => {
      this.logger.info("Taxes calculated", { calculatedTaxes: results });

      return results;
    });
  }
}

export class CalculateTaxesUseCase extends PrivateCalculateTaxesUseCase {
  constructor(deps: { configExtractor: IAppConfigExtractor; publicLogDrain: PublicLogDrain }) {
    super(deps);
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
    const sourceObjectType = payload.taxBase.sourceObject.__typename;
    const sourceObjectId = payload.taxBase.sourceObject.id;
    const orderOrCheckoutId =
      payload.taxBase.sourceObject.__typename === "Checkout"
        ? { checkoutId: sourceObjectId }
        : { orderId: sourceObjectId };
    const saleorApiUrl = authData.saleorApiUrl;

    const result = await super.calculateTaxes(payload, authData);

    return result
      .map((output) => {
        const log =
          sourceObjectType === "Checkout"
            ? new TaxesCalculatedInCheckoutLog({ checkoutId: sourceObjectId, saleorApiUrl })
            : new TaxesCalculatedInOrderLog({ orderId: sourceObjectId, saleorApiUrl });

        waitUntil(this.deps.publicLogDrain.emitLog(log));

        return output;
      })
      .mapErr((err) => {
        let log;

        if (err instanceof CalculateTaxesUseCase.ConfigBrokenError) {
          log = new TaxesCalculationFailedConfigErrorLog({
            ...orderOrCheckoutId,
            saleorApiUrl,
          });
        }

        if (err instanceof CalculateTaxesUseCase.ExpectedIncompletePayloadError) {
          log = new TaxesCalculationFailedInvalidPayloadLog({
            ...orderOrCheckoutId,
            saleorApiUrl,
          });
        }

        if (err instanceof CalculateTaxesUseCase.FailedCalculatingTaxesError) {
          log = new TaxesCalculationProviderErrorLog({
            ...orderOrCheckoutId,
            saleorApiUrl,
          });
        }

        if (err instanceof CalculateTaxesUseCase.UnhandledError) {
          log = new TaxesCalculationFailedUnhandledErrorLog({
            ...orderOrCheckoutId,
            saleorApiUrl,
          });
        }
        if (!log) {
          log = new TaxesCalculationFailedUnhandledErrorLog({
            ...orderOrCheckoutId,
            saleorApiUrl,
          });
        }

        waitUntil(this.deps.publicLogDrain.emitLog(log));

        return err;
      });
  }
}
