import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import {
  createStripeClientSecret,
  StripeClientSecretType,
  StripeClientSecretValidationError,
} from "@/modules/stripe/stripe-client-secret";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import {
  createStripePaymentIntentId,
  StripePaymentIntentIdType,
  StripePaymentIntentValidationError,
} from "@/modules/stripe/stripe-payment-intent-id";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import {
  TransactionInitalizeSessionUseCaseResponses,
  TransactionInitalizeSessionUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionInitalizeSessionUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse
>;

export class TransactionInitializeSessionUseCase {
  private logger = createLogger("TransactionInitializeSessionUseCase");
  private appConfigRepo: AppConfigRepo;
  private stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
  }

  private prepareStripeCreatePaymentIntentParams(
    event: TransactionInitializeSessionEventFragment,
  ): Result<Stripe.PaymentIntentCreateParams, InstanceType<typeof StripeMoney.ValdationError>> {
    return StripeMoney.createFromSaleorAmount({
      amount: event.action.amount,
      currency: event.action.currency,
    }).map((result) => {
      return {
        amount: result.amount,
        currency: result.currency,
      };
    });
  }

  private mapStripePaymentIntentToWebhookResponse(
    stripePaymentIntentResponse: Stripe.PaymentIntent,
  ): Result<
    [SaleorMoney, StripePaymentIntentIdType, StripeClientSecretType],
    | InstanceType<typeof StripePaymentIntentValidationError>
    | InstanceType<typeof SaleorMoney.ValdationError>
    | InstanceType<typeof StripeClientSecretValidationError>
  > {
    return Result.combine([
      SaleorMoney.createFromStripe({
        amount: stripePaymentIntentResponse.amount,
        currency: stripePaymentIntentResponse.currency,
      }),
      createStripePaymentIntentId(stripePaymentIntentResponse.id),
      createStripeClientSecret(stripePaymentIntentResponse.client_secret),
    ]);
  }

  async execute(args: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionInitializeSessionEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { channelId, appId, saleorApiUrl } = args;

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (stripeConfigForThisChannel.isErr()) {
      this.logger.error("Failed to get configuration", {
        error: stripeConfigForThisChannel.error,
      });

      return err(new BrokenAppResponse());
    }

    if (!stripeConfigForThisChannel.value) {
      this.logger.warn("Config for channel not found", {
        channelId,
      });

      return err(new AppIsNotConfiguredResponse());
    }

    const restrictedKey = stripeConfigForThisChannel.value.restrictedKey;

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Creating Stripe payment intent with params", {
      params: args.event.action,
    });

    const stripePaymentIntentParamsResult = this.prepareStripeCreatePaymentIntentParams(args.event);

    if (stripePaymentIntentParamsResult.isErr()) {
      captureException(stripePaymentIntentParamsResult.error);

      return err(new BrokenAppResponse());
    }

    const createPaymentIntentResult = await stripePaymentIntentsApi.createPaymentIntent({
      params: stripePaymentIntentParamsResult.value,
    });

    if (createPaymentIntentResult.isErr()) {
      // TODO: handle error properly
      return ok(
        new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
          message: "Error from Stripe API",
        }),
      );
    }

    this.logger.debug("Stripe created payment intent", {
      stripeResponse: createPaymentIntentResult.value,
    });

    return this.mapStripePaymentIntentToWebhookResponse(
      createPaymentIntentResult.value,
    ).match<UseCaseExecuteResult>(
      ([saleorMoney, stripePaymentIntentId, stripeClientSecret]) => {
        return ok(
          new TransactionInitalizeSessionUseCaseResponses.ChargeRequest({
            stripeClientSecret,
            saleorMoney,
            stripePaymentIntentId,
          }),
        );
      },
      (error) => {
        captureException(error);

        return err(new BrokenAppResponse());
      },
    );
  }
}
