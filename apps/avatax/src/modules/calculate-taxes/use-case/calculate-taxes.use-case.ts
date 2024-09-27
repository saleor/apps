import { AuthData } from "@saleor/app-sdk/APL";
import { captureException } from "@sentry/nextjs";
import { err, fromPromise, Result } from "neverthrow";

import { AvataxClient } from "@/modules/avatax/avatax-client";
import { AvataxConfig } from "@/modules/avatax/avatax-connection-schema";
import { AvataxEntityTypeMatcher } from "@/modules/avatax/avatax-entity-type-matcher";
import { AvataxSdkClientFactory } from "@/modules/avatax/avatax-sdk-client-factory";
import { AvataxCalculateTaxesPayloadService } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-lines-transformer";
import { AvataxCalculateTaxesPayloadTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-transformer";
import { AvataxCalculateTaxesResponseTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-response-transformer";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "@/modules/avatax/discounts";
import { AvataxTaxCodeMatchesService } from "@/modules/avatax/tax-code/avatax-tax-code-matches.service";
import { ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { ILogWriterFactory } from "@/modules/client-logs/log-writer-factory";

import { MetadataItem } from "../../../../generated/graphql";
import { BaseError } from "../../../error";
import { AppConfigExtractor, IAppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { createLogger } from "../../../logger";
import {
  AvataxCalculateTaxesAdapter,
  AvataxCalculateTaxesResponse,
} from "../../avatax/calculate-taxes/avatax-calculate-taxes-adapter";
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
      logWriterFactory: ILogWriterFactory;
      payloadLinesTransformer: AvataxCalculateTaxesPayloadLinesTransformer;
      calculateTaxesResponseTransformer: AvataxCalculateTaxesResponseTransformer;
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

  private async callAvaTax(
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
    discountStrategy: AutomaticallyDistributedProductLinesDiscountsStrategy,
    authData: AuthData,
  ) {
    /**
     * Create local dependencies. They more-or-less need runtime values, like AuthData.
     * This is part of the refactor. Later we should refactor these and inject them into use-case
     */
    const avaTaxSdk = new AvataxSdkClientFactory().createClient(avataxConfig);
    const avaTaxClient = new AvataxClient(avaTaxSdk);

    const calculateTaxesAdapter = new AvataxCalculateTaxesAdapter(
      avaTaxClient,
      this.deps.calculateTaxesResponseTransformer,
    );

    const payloadService = new AvataxCalculateTaxesPayloadService(
      AvataxTaxCodeMatchesService.createFromAuthData(authData),
      new AvataxCalculateTaxesPayloadTransformer(
        this.deps.payloadLinesTransformer,
        new AvataxEntityTypeMatcher(avaTaxClient),
      ),
    );

    const avataxModel = await payloadService.getPayload(payload, avataxConfig, discountStrategy);

    const response = await calculateTaxesAdapter.send(avataxModel);

    return response;
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
    const logWriter = this.deps.logWriterFactory.createWriter(authData);

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

      ClientLogStoreRequest.create({
        level: "error",
        message: "Failed to calculate taxes. Invalid config",
        checkoutOrOrderId: payload.taxBase.sourceObject.id,
        channelId: payload.taxBase.channel.slug,
        checkoutOrOrder: "checkout",
      })
        .mapErr(captureException)
        .map(logWriter.writeLog);

      return err(
        new CalculateTaxesUseCase.ConfigBrokenError("Failed to extract app config from metadata", {
          errors: [config.error],
        }),
      );
    }

    this.logger.info("Found active connection service. Calculating taxes...");

    const providerConfig = config.value.getConfigForChannelSlug(channelSlug);

    if (providerConfig.isErr()) {
      ClientLogStoreRequest.create({
        level: "error",
        message: "Failed to calculate taxes. Invalid config",
        checkoutOrOrderId: payload.taxBase.sourceObject.id,
        channelId: payload.taxBase.channel.slug,
        checkoutOrOrder: "checkout",
      })
        .mapErr(captureException)
        .map(logWriter.writeLog);

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
      this.callAvaTax(
        payload,
        providerConfig.value.avataxConfig.config,
        this.discountsStrategy,
        authData,
      ),
      (err) => {
        ClientLogStoreRequest.create({
          level: "error",
          message: "Failed to calculate taxes.",
          checkoutOrOrderId: payload.taxBase.sourceObject.id,
          channelId: payload.taxBase.channel.slug,
          checkoutOrOrder: "checkout",
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        return new CalculateTaxesUseCase.FailedCalculatingTaxesError("Failed to calculate taxes", {
          errors: [err],
        });
      },
    ).map((results) => {
      this.logger.info("Taxes calculated", { calculatedTaxes: JSON.stringify(results) });

      ClientLogStoreRequest.create({
        level: "info",
        message: "Taxes calculated",
        checkoutOrOrderId: payload.taxBase.sourceObject.id,
        channelId: payload.taxBase.channel.slug,
        attributes: results,
        checkoutOrOrder: "checkout",
      })
        .mapErr(captureException)
        .map(logWriter.writeLog);

      return results;
    });
  }
}
