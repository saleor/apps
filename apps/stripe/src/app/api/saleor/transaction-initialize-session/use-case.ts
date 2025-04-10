import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/shared";
import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { BaseError, UseCaseGetConfigError, UseCaseMissingConfigError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

type UseCaseResultShape = SyncWebhookResponsesMap["TRANSACTION_INITIALIZE_SESSION"] & {
  data: {
    stripeClientSecret: string;
  };
};

type UseCaseErrorShape =
  | InstanceType<typeof UseCaseMissingConfigError>
  | InstanceType<typeof UseCaseGetConfigError>
  | InstanceType<typeof TransactionInitializeSessionUseCase.UseCaseError>;

export class TransactionInitializeSessionUseCase {
  private logger = createLogger("TransactionInitializeSessionUseCase");
  private appConfigRepo: AppConfigRepo;
  private stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;

  static UseCaseError = BaseError.subclass("InitializeStripeTransactionUseCaseError", {
    props: {
      _internalName: "InitializeStripeTransactionUseCaseError" as const,
      httpStatusCode: 500,
      httpMessage: "Failed to initialize Stripe PaymentIntent",
    },
  });

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
  }

  private prepareStripeCreatePaymentIntentParams(
    event: TransactionInitializeSessionEventFragment,
  ): Stripe.PaymentIntentCreateParams {
    const stripeMoneyResult = StripeMoney.createFromSaleorAmount({
      amount: event.action.amount,
      currency: event.action.currency,
    });

    if (stripeMoneyResult.isErr()) {
      this.logger.error(
        "Failed to convert amount / currency coming from Saleor to one used by Stripe - throwing",
        {
          error: stripeMoneyResult.error,
        },
      );

      throw new TransactionInitializeSessionUseCase.UseCaseError("Failed to create Stripe money", {
        cause: stripeMoneyResult.error,
      });
    }

    return {
      amount: stripeMoneyResult.value.amount,
      currency: stripeMoneyResult.value.currency,
    };
  }

  private prepareResponseToSaleor(
    stripePaymentIntentResponse: Stripe.PaymentIntent,
  ): UseCaseResultShape {
    const saleorMoneyResult = SaleorMoney.createFromStripe({
      amount: stripePaymentIntentResponse.amount,
      currency: stripePaymentIntentResponse.currency,
    });

    if (saleorMoneyResult.isErr()) {
      this.logger.error(
        "Failed to convert amount / currency coming from Stripe to one used by Saleor - throwing",
        {
          error: saleorMoneyResult.error,
        },
      );

      throw new TransactionInitializeSessionUseCase.UseCaseError("Failed to create Saleor money", {
        cause: saleorMoneyResult.error,
      });
    }

    if (!stripePaymentIntentResponse.client_secret) {
      throw new TransactionInitializeSessionUseCase.UseCaseError(
        "Stripe payment intent response does not contain client_secret. It means that the payment intent was not created properly.",
      );
    }

    return {
      result: "CHARGE_REQUESTED",
      amount: saleorMoneyResult.value.amount,
      pspReference: stripePaymentIntentResponse.id,
      data: {
        stripeClientSecret: stripePaymentIntentResponse.client_secret,
      },
    } as const;
  }

  async execute(args: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionInitializeSessionEventFragment;
  }): Promise<Result<UseCaseResultShape, UseCaseErrorShape>> {
    const { channelId, appId, saleorApiUrl } = args;

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (stripeConfigForThisChannel.isErr()) {
      return err(
        new UseCaseGetConfigError("Failed to retrieve config for channel", {
          cause: stripeConfigForThisChannel.error,
        }),
      );
    }

    if (!stripeConfigForThisChannel.value) {
      return err(
        new UseCaseMissingConfigError("Config for channel not found", {
          props: {
            channelId,
          },
        }),
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
      params: this.prepareStripeCreatePaymentIntentParams(args.event),
    });

    if (createPaymentIntentResult.isErr()) {
      // TODO: shoudn't we return 200 with error in the body to Saleor?
      return err(
        new TransactionInitializeSessionUseCase.UseCaseError("Failed to create payment intent", {
          cause: createPaymentIntentResult.error,
        }),
      );
    }

    this.logger.debug("Stripe created payment intent", {
      stripeResponse: createPaymentIntentResult.value,
    });

    const validResponseShape = this.prepareResponseToSaleor(createPaymentIntentResult.value);

    return ok(validResponseShape);
  }
}
