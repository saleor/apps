import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { GetConfigError, MissingConfigError } from "@/modules/app-config/app-config-errors";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  GetConfigErrorResponse,
  MissingConfigErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import {
  TransactionInitalizeSessionResponseDataShape,
  TransactionInitalizeSessionResponseDataShapeType,
} from "./response-data-shape";
import {
  TransactionInitalizeSessionUseCaseResponses,
  TransactionInitalizeSessionUseCaseResponsesType,
} from "./use-case-response";

export class TransactionInitializeSessionUseCase {
  private logger = createLogger("TransactionInitializeSessionUseCase");
  private appConfigRepo: AppConfigRepo;
  private stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;

  // TODO: change it to retrun failure response instead of throwing error
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

  private prepareSuccessResponseParamsToSaleor(stripePaymentIntentResponse: Stripe.PaymentIntent): {
    pspReference: string;
    amount: number;
    responseData: TransactionInitalizeSessionResponseDataShapeType;
  } {
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

    const responseDataShape = TransactionInitalizeSessionResponseDataShape.safeParse({
      stripeClientSecret: stripePaymentIntentResponse.client_secret,
    });

    if (!responseDataShape.success) {
      throw new TransactionInitializeSessionUseCase.UseCaseError(
        "Stripe payment intent response does not contain client_secret. It means that the payment intent was not created properly.",
      );
    }

    return {
      amount: saleorMoneyResult.value.amount,
      pspReference: stripePaymentIntentResponse.id,
      responseData: responseDataShape.data,
    };
  }

  async execute(args: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionInitializeSessionEventFragment;
  }): Promise<
    Result<
      TransactionInitalizeSessionUseCaseResponsesType,
      MissingConfigErrorResponse | GetConfigErrorResponse
    >
  > {
    const { channelId, appId, saleorApiUrl } = args;

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (stripeConfigForThisChannel.isErr()) {
      return err(
        new GetConfigErrorResponse({
          error: new GetConfigError("Failed to get configuration", {
            cause: stripeConfigForThisChannel.error,
          }),
        }),
      );
    }

    if (!stripeConfigForThisChannel.value) {
      return err(
        new MissingConfigErrorResponse({
          error: new MissingConfigError("Config for channel not found", {
            props: {
              channelId,
            },
          }),
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

    const { responseData, amount, pspReference } = this.prepareSuccessResponseParamsToSaleor(
      createPaymentIntentResult.value,
    );

    return ok(
      new TransactionInitalizeSessionUseCaseResponses.ChargeRequest({
        responseData,
        amount,
        pspReference,
      }),
    );
  }
}
