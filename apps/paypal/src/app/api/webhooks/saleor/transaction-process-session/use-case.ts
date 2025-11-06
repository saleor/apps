import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionProcessSessionEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { getPool } from "@/lib/database";
import { PayPalConfigRepo } from "@/modules/paypal/configuration/paypal-config-repo";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import { createPayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { IPayPalOrdersApiFactory } from "@/modules/paypal/types";
import { resolveSaleorMoneyFromPayPalOrder } from "@/modules/saleor/resolve-saleor-money-from-paypal-order";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { ChargeSuccessResult } from "@/modules/transaction-result/success-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import { GlobalPayPalConfigRepository } from "@/modules/wsm-admin/global-paypal-config-repository";

import {
  TransactionProcessSessionUseCaseResponses,
  TransactionProcessSessionUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionProcessSessionUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionProcessSessionUseCase {
  private logger = createLogger("TransactionProcessSessionUseCase");
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
    event: TransactionProcessSessionEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { authData, event } = args;

    this.logger.info("Processing transaction process session event", {
      transactionId: event.transaction.pspReference,
      actionType: event.action.actionType,
      amount: event.action.amount,
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

    // Set app context early so it's available even if errors occur later
    const paypalEnv = config.environment;
    this.logger.debug("Setting app context", { paypalEnv });
    appContextContainer.set({
      paypalEnv,
    });

    // Verify context was set
    const contextCheck = appContextContainer.getContextValue();
    this.logger.debug("App context after set", {
      paypalEnv: contextCheck.paypalEnv,
    });

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
      merchantId: config.merchantId ? (config.merchantId as any) : undefined,
      merchantEmail: config.merchantEmail || undefined,
      bnCode,
      env: config.environment,
    });

    // Get PayPal order ID from transaction pspReference
    const paypalOrderId = createPayPalOrderId(event.transaction.pspReference);

    this.logger.debug("Processing PayPal order", {
      paypalOrderId,
      actionType: event.action.actionType,
    });

    // Based on action type, either capture or authorize the order
    let processResult;
    if (event.action.actionType === "CHARGE") {
      processResult = await paypalOrdersApi.captureOrder({ orderId: paypalOrderId });
    } else {
      processResult = await paypalOrdersApi.authorizeOrder({ orderId: paypalOrderId });
    }

    if (processResult.isErr()) {
      const error = mapPayPalErrorToApiError(processResult.error);
      
      this.logger.error("Failed to process PayPal order", {
        error,
        paypalOrderId,
        actionType: event.action.actionType,
      });

      const failureResult = event.action.actionType === "CHARGE" 
        ? new ChargeFailureResult()
        : new AuthorizationFailureResult();

      return ok(
        new TransactionProcessSessionUseCaseResponses.Failure({
          transactionResult: failureResult,
          error,
          paypalOrderId,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const paypalOrder = processResult.value;

    this.logger.info("Successfully processed PayPal order", {
      paypalOrderId,
      status: paypalOrder.status,
      actionType: event.action.actionType,
    });

    // Resolve Saleor money from PayPal order
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

    // For process session, we typically return success result
    // since the action has been completed
    const successResult = new ChargeSuccessResult();

    return ok(
      new TransactionProcessSessionUseCaseResponses.Success({
        transactionResult: successResult,
        saleorMoney: saleorMoneyResult.value,
        paypalOrderId,
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}