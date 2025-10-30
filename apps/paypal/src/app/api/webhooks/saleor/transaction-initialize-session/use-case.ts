import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { getPool } from "@/lib/database";
import { PayPalConfigRepo } from "@/modules/paypal/configuration/paypal-config-repo";
import { createPayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { IPayPalOrdersApiFactory } from "@/modules/paypal/types";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { resolveSaleorMoneyFromPayPalOrder } from "@/modules/saleor/resolve-saleor-money-from-paypal-order";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import { PayPalMoney } from "@/modules/paypal/paypal-money";
import {
  ChargeActionRequiredResult,
  AuthorizationActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  ChargeFailureResult,
  AuthorizationFailureResult,
} from "@/modules/transaction-result/failure-result";
import { GlobalPayPalConfigRepository } from "@/modules/wsm-admin/global-paypal-config-repository";

import {
  TransactionInitializeSessionUseCaseResponses,
  TransactionInitializeSessionUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionInitializeSessionUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionInitializeSessionUseCase {
  private logger = createLogger("TransactionInitializeSessionUseCase");
  private paypalConfigRepo: PayPalConfigRepo;
  private paypalOrdersApiFactory: IPayPalOrdersApiFactory;

  constructor(deps: {
    paypalConfigRepo: PayPalConfigRepo;
    paypalOrdersApiFactory: IPayPalOrdersApiFactory;
  }) {
    this.paypalConfigRepo = deps.paypalConfigRepo;
    this.paypalOrdersApiFactory = deps.paypalOrdersApiFactory;
  }

  async execute(args: {
    authData: import("@saleor/app-sdk/APL").AuthData;
    event: TransactionInitializeSessionEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { authData, event } = args;

    this.logger.info("Processing transaction initialize session event", {
      transactionId: event.transaction.id,
      actionType: event.action.actionType,
      amount: event.action.amount,
      currency: event.action.currency,
    });

    // Get channel ID from the event
    const channelId = event.sourceObject.channel.id;

    // Get PayPal configuration for this channel
    const paypalConfigResult = await this.paypalConfigRepo.getPayPalConfig(authData, channelId);

    if (paypalConfigResult.isErr()) {
      this.logger.error("Failed to get PayPal configuration", {
        error: paypalConfigResult.error,
      });

      return err(
        new BrokenAppResponse(
          appContextContainer.getContextValue(),
          paypalConfigResult.error,
        ),
      );
    }

    if (!paypalConfigResult.value) {
      this.logger.warn("PayPal configuration not found for channel", {
        channelId,
      });

      return err(
        new AppIsNotConfiguredResponse(
          appContextContainer.getContextValue(),
          new BaseError("PayPal configuration not found for channel"),
        ),
      );
    }

    const config = paypalConfigResult.value;

    this.logger.debug("Loaded PayPal configuration", {
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret,
      environment: config.environment,
      hasMerchantEmail: !!config.merchantEmail,
      hasMerchantClientId: !!config.merchantClientId,
      hasMerchantId: !!config.merchantId,
      merchantEmail: config.merchantEmail,
    });

    // Set app context early so it's available even if errors occur later
    const appContext = {
      paypalEnv: config.environment || config.getPayPalEnvValue(),
    };
    appContextContainer.set(appContext);

    // Fetch BN code from global config for partner attribution
    let bnCode: string | undefined;
    try {
      const pool = getPool();
      const globalConfigRepository = GlobalPayPalConfigRepository.create(pool);
      const globalConfigResult = await globalConfigRepository.getActiveConfig();

      if (globalConfigResult.isOk() && globalConfigResult.value) {
        bnCode = globalConfigResult.value.bnCode || undefined;
        this.logger.debug("Retrieved BN code from global config", {
          hasBnCode: !!bnCode,
        });
      } else {
        this.logger.warn("No active global config found for BN code", {
          error: globalConfigResult.isErr() ? globalConfigResult.error : undefined,
        });
      }
    } catch (error) {
      this.logger.warn("Failed to fetch BN code from global config", {
        error,
      });
    }

    // Create PayPal orders API instance with merchant context
    const paypalOrdersApi = this.paypalOrdersApiFactory.create({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      merchantEmail: config.merchantEmail || undefined,
      bnCode,
      env: config.environment,
    });

    // Convert Saleor money to PayPal money format
    const paypalMoney: PayPalMoney = {
      currency_code: event.action.currency,
      value: (event.action.amount as number).toString(),
    };

    // Determine PayPal intent based on action type
    const intent = event.action.actionType === "CHARGE" ? "CAPTURE" : "AUTHORIZE";

    this.logger.debug("Creating PayPal order", {
      intent,
      amount: paypalMoney,
      transactionId: event.transaction.id,
    });

    // Create PayPal order
    const createOrderResult = await paypalOrdersApi.createOrder({
      amount: paypalMoney,
      intent,
      metadata: {
        saleor_transaction_id: event.transaction.id,
        saleor_source_id: event.sourceObject.id,
        saleor_source_type: event.sourceObject.__typename,
        saleor_channel_id: channelId,
      },
    });

    if (createOrderResult.isErr()) {
      const error = mapPayPalErrorToApiError(createOrderResult.error);
      
      this.logger.error("Failed to create PayPal order", {
        error,
      });

      const failureResult = event.action.actionType === "CHARGE" 
        ? new ChargeFailureResult()
        : new AuthorizationFailureResult();

      return ok(
        new TransactionInitializeSessionUseCaseResponses.Failure({
          transactionResult: failureResult,
          error,
          appContext,
        }),
      );
    }

    const paypalOrder = createOrderResult.value;

    this.logger.info("Successfully created PayPal order", {
      paypalOrderId: paypalOrder.id,
      status: paypalOrder.status,
    });

    // Check if order requires payer action (e.g., approval)
    if (paypalOrder.status === "PAYER_ACTION_REQUIRED" || paypalOrder.status === "CREATED") {
      const actionRequiredResult = event.action.actionType === "CHARGE"
        ? new ChargeActionRequiredResult()
        : new AuthorizationActionRequiredResult();

      return ok(
        new TransactionInitializeSessionUseCaseResponses.ActionRequired({
          transactionResult: actionRequiredResult,
          paypalOrderId: createPayPalOrderId(paypalOrder.id),
          data: {
            client_token: null, // PayPal doesn't use client tokens like Stripe
            paypal_order_id: paypalOrder.id,
            environment: config.environment,
          },
          appContext,
        }),
      );
    }

    // If order is already approved, we can proceed
    const saleorMoneyResult = resolveSaleorMoneyFromPayPalOrder(paypalOrder);

    if (saleorMoneyResult.isErr()) {
      this.logger.error("Failed to resolve Saleor money from PayPal order", {
        error: saleorMoneyResult.error,
      });

      return err(
        new BrokenAppResponse(
          appContext,
          saleorMoneyResult.error,
        ),
      );
    }

    // Create appropriate success result
    const successResult = event.action.actionType === "CHARGE"
      ? new ChargeActionRequiredResult()
      : new AuthorizationActionRequiredResult();

    return ok(
      new TransactionInitializeSessionUseCaseResponses.Success({
        transactionResult: successResult,
        paypalOrderId: createPayPalOrderId(paypalOrder.id),
        saleorMoney: saleorMoneyResult.value,
        appContext,
      }),
    );
  }
}