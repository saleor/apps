import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { getPool } from "@/lib/database";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { PayPalConfigRepo } from "@/modules/paypal/configuration/paypal-config-repo";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
import { mapPayPalErrorToApiError, PayPalApiError } from "@/modules/paypal/paypal-api-error";
import { createPayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { createPayPalRefundId } from "@/modules/paypal/paypal-refund-id";
import { createPayPalClientId } from "@/modules/paypal/paypal-client-id";
import { createPayPalClientSecret } from "@/modules/paypal/paypal-client-secret";
import { IPayPalOrdersApiFactory, IPayPalRefundsApiFactory } from "@/modules/paypal/types";
import { GlobalPayPalConfigRepository } from "@/modules/wsm-admin/global-paypal-config-repository";

import {
  TransactionRefundRequestedUseCaseResponses,
  TransactionRefundRequestedUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionRefundRequestedUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionRefundRequestedUseCase {
  private logger = createLogger("TransactionRefundRequestedUseCase");
  private paypalConfigRepo: PayPalConfigRepo;
  private paypalOrdersApiFactory: IPayPalOrdersApiFactory;
  private paypalRefundsApiFactory: IPayPalRefundsApiFactory;

  constructor(deps: {
    paypalConfigRepo: PayPalConfigRepo;
    paypalOrdersApiFactory: IPayPalOrdersApiFactory;
    paypalRefundsApiFactory: IPayPalRefundsApiFactory;
  }) {
    this.paypalConfigRepo = deps.paypalConfigRepo;
    this.paypalOrdersApiFactory = deps.paypalOrdersApiFactory;
    this.paypalRefundsApiFactory = deps.paypalRefundsApiFactory;
  }

  async execute(args: {
    authData: import("@saleor/app-sdk/APL").AuthData;
    event: TransactionRefundRequestedEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { authData, event } = args;

    const transaction = getTransactionFromRequestedEventPayload(event);
    const channelId = getChannelIdFromRequestedEventPayload(event);

    // loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, transaction.pspReference);

    const paypalConfigForThisChannel = await this.paypalConfigRepo.getPayPalConfig(authData);

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
          new BaseError("Config for channel not found"),
        ),
      );
    }

    const config = paypalConfigForThisChannel.value;

    appContextContainer.set({
      paypalEnv: config.environment,
    });

    // Fetch global config for partner credentials
    // Partner credentials are required for refund API calls with merchant context
    let globalClientId = config.clientId;
    let globalClientSecret = config.clientSecret;
    let bnCode: string | undefined;

    try {
      const pool = getPool();
      const globalConfigRepository = GlobalPayPalConfigRepository.create(pool);
      const globalConfigResult = await globalConfigRepository.getActiveConfig();

      if (globalConfigResult.isOk() && globalConfigResult.value) {
        const globalConfig = globalConfigResult.value;
        globalClientId = createPayPalClientId(globalConfig.clientId);
        globalClientSecret = createPayPalClientSecret(globalConfig.clientSecret);
        bnCode = globalConfig.bnCode || undefined;
        this.logger.debug("Using global partner credentials for refund", {
          hasBnCode: !!bnCode,
          hasPartnerCredentials: true,
        });
      } else {
        this.logger.warn("No active global config found, using per-channel credentials", {
          error: globalConfigResult.isErr() ? globalConfigResult.error : undefined,
        });
      }
    } catch (error) {
      this.logger.warn("Failed to fetch global config, using per-channel credentials", {
        error,
      });
    }

    const apiConfig = {
      clientId: globalClientId,
      clientSecret: globalClientSecret,
      merchantId: config.merchantId ? (config.merchantId as any) : undefined,
      merchantEmail: config.merchantEmail || undefined,
      bnCode,
      env: config.environment,
    };

    const paypalOrdersApi = this.paypalOrdersApiFactory.create(apiConfig);
    const paypalRefundsApi = this.paypalRefundsApiFactory.create(apiConfig);

    this.logger.debug("Refunding PayPal payment intent with id", {
      id: transaction.pspReference,
      action: event.action,
    });

    const paypalOrderId = createPayPalOrderId(transaction.pspReference);

    const paypalMoney = {
      currency_code: event.action.currency,
      value: (event.action.amount as string | number).toString(),
    };

    // Fetch the order to get the capture ID
    // pspReference might be the order ID, not the capture ID
    this.logger.debug("Fetching order to extract capture ID", {
      orderId: paypalOrderId,
    });

    const orderResult = await paypalOrdersApi.getOrder({ orderId: paypalOrderId });

    if (orderResult.isErr()) {
      const error = mapPayPalErrorToApiError(orderResult.error);

      this.logger.error("Failed to fetch order", { error });

      return ok(
        new TransactionRefundRequestedUseCaseResponses.Failure({
          paypalOrderId,
          error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const order = orderResult.value;

    // Extract capture ID from the order
    const capture = order.purchase_units[0]?.payments?.captures?.[0];

    if (!capture) {
      this.logger.error("No capture found in order", {
        orderId: paypalOrderId,
        orderStatus: order.status,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponses.Failure({
          paypalOrderId,
          error: new PayPalApiError("No capture found in order. Order may not have been captured yet."),
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const captureId = capture.id;

    this.logger.debug("Extracted capture ID from order", {
      orderId: paypalOrderId,
      captureId,
      captureStatus: capture.status,
    });

    const refundResult = await paypalRefundsApi.refundCapture({
      captureId,
      amount: paypalMoney,
    });

    if (refundResult.isErr()) {
      const error = mapPayPalErrorToApiError(refundResult.error);

      this.logger.error("Failed to create refund", { error });

      return ok(
        new TransactionRefundRequestedUseCaseResponses.Failure({
          paypalOrderId,
          error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const refund = refundResult.value;

    return ok(
      new TransactionRefundRequestedUseCaseResponses.Success({
        paypalRefundId: createPayPalRefundId(refund.id),
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
