import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { err, ok } from "neverthrow";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

export class TransactionInitializeSessionUseCase {
  private logger = createLogger("TransactionInitializeSessionUseCase");
  private appConfigRepo: AppConfigRepo;
  private stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;

  static UseCaseError = BaseError.subclass("InitializeStripeTransactionUseCaseError");
  static MissingConfigError = this.UseCaseError.subclass("MissingConfigError");

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
  }

  async execute(args: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionInitializeSessionEventFragment;
  }) {
    const { channelId, appId, saleorApiUrl } = args;

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (stripeConfigForThisChannel.isErr()) {
      return err(
        new TransactionInitializeSessionUseCase.UseCaseError(
          "Failed to retrieve config for channel",
          {
            cause: stripeConfigForThisChannel.error,
          },
        ),
      );
    }

    if (!stripeConfigForThisChannel.value) {
      return err(
        new TransactionInitializeSessionUseCase.MissingConfigError("Config for channel not found"),
      );
    }

    const restrictedKey = stripeConfigForThisChannel.value.restrictedKey;

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Creating Stripe payment intent with params", {
      params: args.event.action,
    });

    const createPaymentIntentResult = await stripePaymentIntentsApi.createPaymentIntent({
      // TODO: extract to resolver / StripeMoney
      params: {
        amount: args.event.action.amount * 100,
        currency: args.event.action.currency.toLowerCase(),
      },
    });

    if (createPaymentIntentResult.isErr()) {
      return err(
        new TransactionInitializeSessionUseCase.UseCaseError(
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
      amount: createPaymentIntentResult.value.amount,
    });

    return ok(validResponseShape);
  }
}
