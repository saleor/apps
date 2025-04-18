import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import {
  parseTransactionInitializeSessionEventData,
  TransactionInitializeSessionEventData,
} from "@/app/api/saleor/transaction-initialize-session/event-data-parser";
import { resolvePaymentMethodFromEventData } from "@/app/api/saleor/transaction-initialize-session/payment-method-resolver";
import {
  TransactionFlowStrategyEnum,
  TransactionInitializeSessionEventFragment,
} from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import {
  createStripeClientSecret,
  StripeClientSecret,
  StripeClientSecretValidationError,
} from "@/modules/stripe/stripe-client-secret";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import { mapStripeCreatePaymentIntentErrorToApiError } from "@/modules/stripe/stripe-payment-intent-api-error";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
  StripePaymentIntentValidationError,
} from "@/modules/stripe/stripe-payment-intent-id";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import {
  TransactionInitalizeSessionUseCaseResponses,
  TransactionInitalizeSessionUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionInitalizeSessionUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
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

  private prepareStripeCreatePaymentIntentParams(args: {
    eventAction: TransactionInitializeSessionEventFragment["action"];
    eventData: TransactionInitializeSessionEventData;
    paymentMethodSupportedFlow: TransactionFlowStrategyEnum;
  }): Result<Stripe.PaymentIntentCreateParams, InstanceType<typeof StripeMoney.ValdationError>> {
    return StripeMoney.createFromSaleorAmount({
      amount: args.eventAction.amount,
      currency: args.eventAction.currency,
    }).map((result) => {
      return {
        amount: result.amount,
        currency: result.currency,
        /*
         * Enable all payment methods configured in the Stripe Dashboard.
         * The app validated if it allow payment method before.
         */
        automatic_payment_methods: {
          enabled: true,
        },
        capture_method:
          args.paymentMethodSupportedFlow === "AUTHORIZATION" ? "manual" : "automatic_async",
      };
    });
  }

  private mapStripePaymentIntentToWebhookResponse(
    stripePaymentIntentResponse: Stripe.PaymentIntent,
  ): Result<
    [SaleorMoney, StripePaymentIntentId, StripeClientSecret],
    | InstanceType<typeof StripePaymentIntentValidationError>
    | InstanceType<typeof SaleorMoney.ValidationError>
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
    const { channelId, appId, saleorApiUrl, event } = args;
    const eventDataResult = parseTransactionInitializeSessionEventData(event.data);

    if (eventDataResult.isErr()) {
      if (args.event.action.actionType === "AUTHORIZATION") {
        return ok(
          new TransactionInitalizeSessionUseCaseResponses.AuthorizationFailure({
            error: eventDataResult.error,
            saleorEventAmount: event.action.amount,
          }),
        );
      }

      return ok(
        new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
          error: eventDataResult.error,
          saleorEventAmount: event.action.amount,
        }),
      );
    }

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

    const selectedPaymentMethod = resolvePaymentMethodFromEventData(eventDataResult.value);
    const paymentMethodSupportedFlow = selectedPaymentMethod.getSupportedTransactionFlow(
      event.action.actionType,
    );

    const stripePaymentIntentParamsResult = this.prepareStripeCreatePaymentIntentParams({
      eventData: eventDataResult.value,
      eventAction: event.action,
      paymentMethodSupportedFlow: paymentMethodSupportedFlow,
    });

    if (stripePaymentIntentParamsResult.isErr()) {
      captureException(stripePaymentIntentParamsResult.error);

      return err(new MalformedRequestResponse());
    }

    const createPaymentIntentResult = await stripePaymentIntentsApi.createPaymentIntent({
      params: stripePaymentIntentParamsResult.value,
    });

    if (createPaymentIntentResult.isErr()) {
      const mappedError = mapStripeCreatePaymentIntentErrorToApiError(
        createPaymentIntentResult.error,
      );

      this.logger.error("Failed to create payment intent", {
        error: mappedError,
      });

      if (paymentMethodSupportedFlow === "AUTHORIZATION") {
        return ok(
          new TransactionInitalizeSessionUseCaseResponses.AuthorizationFailure({
            error: mappedError,
            saleorEventAmount: event.action.amount,
          }),
        );
      }

      return ok(
        new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
          error: mappedError,
          saleorEventAmount: event.action.amount,
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
        if (paymentMethodSupportedFlow === "AUTHORIZATION") {
          return ok(
            new TransactionInitalizeSessionUseCaseResponses.AuthorizationActionRequired({
              stripeClientSecret,
              saleorMoney,
              stripePaymentIntentId,
            }),
          );
        }

        return ok(
          new TransactionInitalizeSessionUseCaseResponses.ChargeActionRequired({
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
