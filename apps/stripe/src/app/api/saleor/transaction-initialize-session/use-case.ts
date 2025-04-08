import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { err, ok } from "neverthrow";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigPersistor } from "@/modules/app-config/app-config-persistor";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

export class InitializeStripeTransactionUseCase {
  private logger = createLogger("InitializeStripeTransactionUseCase");
  private configPersister: AppConfigPersistor;
  private stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;

  static UseCaseError = BaseError.subclass("InitializeStripeTransactionUseCaseError");
  static MissingConfigError = this.UseCaseError.subclass("MissingConfigError");

  constructor(deps: {
    configPersister: AppConfigPersistor;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
  }) {
    this.configPersister = deps.configPersister;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
  }

  async execute(args: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionInitializeSessionEventFragment;
  }) {
    const { channelId, appId, saleorApiUrl } = args;

    const stripeConfigForThisChannel = await this.configPersister.getStripeConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (stripeConfigForThisChannel.isErr()) {
      return err(
        new InitializeStripeTransactionUseCase.UseCaseError(
          "Failed to retrieve config for channel",
          {
            cause: stripeConfigForThisChannel.error,
          },
        ),
      );
    }

    if (!stripeConfigForThisChannel.value) {
      return err(
        new InitializeStripeTransactionUseCase.MissingConfigError("Config for channel not found"),
      );
    }

    const restrictedKey = stripeConfigForThisChannel.value.restrictedKey;

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Creating Stripe payment intent with params", {
      params: {
        amount: 100,
        currency: "USD",
      },
    });

    const createPaymentIntentResult = await stripePaymentIntentsApi.createPaymentIntent({
      // TODO: get real data from event
      params: {
        amount: 100,
        currency: "USD",
      },
    });

    if (createPaymentIntentResult.isErr()) {
      return err(
        new InitializeStripeTransactionUseCase.UseCaseError(
          "Error creating Stripe payment intent",
          {
            cause: createPaymentIntentResult.error,
          },
        ),
      );
    }

    this.logger.debug("Stripe created payment intent", {
      stripeResponse: createPaymentIntentResult.value,
    });

    const validResponseShape = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      // TODO: fill out with real data
      result: "CHARGE_SUCCESS",
      amount: 100,
    });

    return ok(validResponseShape);
  }
}
