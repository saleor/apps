import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionCancelationRequestedEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { getPool } from "@/lib/database";
import { loggerContext } from "@/lib/logger-context";
import { PayPalConfigRepo } from "@/modules/paypal/configuration/paypal-config-repo";
import { resolveSaleorMoneyFromPayPalOrder } from "@/modules/saleor/resolve-saleor-money-from-paypal-order";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import { createPayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { IPayPalOrdersApiFactory } from "@/modules/paypal/types";
import {
  CancelFailureResult,
  CancelSuccessResult,
} from "@/modules/transaction-result/cancel-result";
import { GlobalPayPalConfigRepository } from "@/modules/wsm-admin/global-paypal-config-repository";

import {
  TransactionCancelationRequestedUseCaseResponses,
  TransactionCancelationRequestedUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionCancelationRequestedUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionCancelationRequestedUseCase {
  private logger = createLogger("TransactionCancelationRequestedUseCase");
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
    event: TransactionCancelationRequestedEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { authData, event } = args;

    const transaction = getTransactionFromRequestedEventPayload(event);
    const channelId = getChannelIdFromRequestedEventPayload(event);

    // loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, transaction.pspReference);

    const paypalConfigForThisChannel = await this.paypalConfigRepo.getPayPalConfig(authData, channelId);

    if (paypalConfigForThisChannel.isErr()) {
      this.logger.error("Failed to get configuration", {
        error: paypalConfigForThisChannel.error,
      });

      return err(
        new BrokenAppResponse(
          appContextContainer.getContextValue(),
          paypalConfigForThisChannel.error,
        ),
      );
    }

    if (!paypalConfigForThisChannel.value) {
      this.logger.warn("Config for channel not found", {
        channelId,
      });

      return err(
        new AppIsNotConfiguredResponse(
          appContextContainer.getContextValue(),
          new BaseError("No config found for channel"),
        ),
      );
    }

    const config = paypalConfigForThisChannel.value;

    // Set app context early so it's available even if errors occur later
    appContextContainer.set({
      paypalEnv: config.environment || config.getPayPalEnvValue(),
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
      merchantEmail: config.merchantEmail || undefined,
      bnCode,
      env: config.environment,
    });

    this.logger.debug("Getting PayPal order with id", {
      id: transaction.pspReference,
    });

    const paypalOrderId = createPayPalOrderId(transaction.pspReference);

    // PayPal doesn't have a direct cancel endpoint, we get the order to verify it exists
    const getOrderResult = await paypalOrdersApi.getOrder({
      orderId: paypalOrderId,
    });

    if (getOrderResult.isErr()) {
      const error = mapPayPalErrorToApiError(getOrderResult.error);

      this.logger.error("Failed to get PayPal order", {
        error,
      });

      return ok(
        new TransactionCancelationRequestedUseCaseResponses.Failure({
          paypalOrderId,
          transactionResult: new CancelFailureResult(),
          error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const saleorMoneyResult = resolveSaleorMoneyFromPayPalOrder(
      getOrderResult.value,
    );

    if (saleorMoneyResult.isErr()) {
      this.logger.error("Failed to create Saleor money", {
        error: saleorMoneyResult.error,
      });

      return err(
        new BrokenAppResponse(appContextContainer.getContextValue(), saleorMoneyResult.error),
      );
    }

    return ok(
      new TransactionCancelationRequestedUseCaseResponses.Success({
        saleorMoney: saleorMoneyResult.value,
        paypalOrderId,
        transactionResult: new CancelSuccessResult(),
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
