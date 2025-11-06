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
import { createPayPalMoney } from "@/modules/paypal/paypal-money";
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

    // Fetch BN code and partner fee percentage from global config
    let bnCode: string | undefined;
    let partnerMerchantId: string | undefined;
    let partnerFeePercent: number | undefined;
    try {
      const pool = getPool();
      const globalConfigRepository = GlobalPayPalConfigRepository.create(pool);
      const globalConfigResult = await globalConfigRepository.getActiveConfig();

      if (globalConfigResult.isOk() && globalConfigResult.value) {
        const globalConfig = globalConfigResult.value;
        bnCode = globalConfig.bnCode || undefined;
        partnerMerchantId = globalConfig.partnerMerchantId || undefined;
        partnerFeePercent = globalConfig.partnerFeePercent || undefined;
        this.logger.debug("Retrieved config from global config", {
          hasBnCode: !!bnCode,
          hasPartnerMerchantId: !!partnerMerchantId,
          partnerFeePercent,
        });
      } else {
        this.logger.warn("No active global config found", {
          error: globalConfigResult.isErr() ? globalConfigResult.error : undefined,
        });
      }
    } catch (error) {
      this.logger.warn("Failed to fetch global config", {
        error,
      });
    }

    // Create PayPal orders API instance with merchant context
    const paypalOrdersApi = this.paypalOrdersApiFactory.create({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      merchantId: config.merchantId ? (config.merchantId as any) : undefined,
      merchantEmail: config.merchantEmail || undefined,
      bnCode,
      env: config.environment,
    });

    // Validate and convert amount
    if (typeof event.action.amount !== "number" || event.action.amount == null) {
      this.logger.error("Invalid amount in transaction event", {
        amount: event.action.amount,
        transactionId: event.transaction.id,
      });

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          new BaseError("Invalid amount in transaction event"),
        ),
      );
    }

    if (event.action.amount < 0) {
      this.logger.error("Amount must be greater than or equal to 0", {
        amount: event.action.amount,
        transactionId: event.transaction.id,
      });

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          new BaseError("Amount must be greater than or equal to 0"),
        ),
      );
    }

    // Convert Saleor money to PayPal money format
    const paypalMoney = createPayPalMoney({
      currencyCode: event.action.currency,
      amount: event.action.amount,
    });

    // Calculate platform fee if configured
    let platformFees: Array<{ amount: typeof paypalMoney; payee?: { merchant_id: string } }> | undefined;
    if (partnerFeePercent && partnerFeePercent > 0 && config.merchantId && partnerMerchantId) {
      const feeAmount = event.action.amount * (partnerFeePercent / 100);
      const platformFeeMoney = createPayPalMoney({
        currencyCode: event.action.currency,
        amount: feeAmount,
      });

      // Platform fee payee is optional - if not specified, PayPal uses the partner's merchant ID
      // from the authentication context
      platformFees = [{
        amount: platformFeeMoney,
      }];

      this.logger.debug("Calculated platform fee", {
        partnerFeePercent,
        feeAmount,
        platformFeeMoney,
      });
    }

    // Determine PayPal intent based on action type
    const intent = event.action.actionType === "CHARGE" ? "CAPTURE" : "AUTHORIZE";

    this.logger.debug("Creating PayPal order", {
      intent,
      amount: paypalMoney,
      hasPlatformFees: !!platformFees,
      payeeMerchantId: config.merchantId,
      transactionId: event.transaction.id,
    });

    // Create PayPal order
    const createOrderResult = await paypalOrdersApi.createOrder({
      amount: paypalMoney,
      intent,
      payeeMerchantId: config.merchantId || undefined,
      platformFees,
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
          appContext: appContextContainer.getContextValue(),
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
          appContext: appContextContainer.getContextValue(),
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
          appContextContainer.getContextValue(),
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
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}