import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { loggerContext } from "@/lib/logger-context";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import { createPayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { createPayPalRefundId } from "@/modules/paypal/paypal-refund-id";
import { IPayPalRefundsApiFactory } from "@/modules/paypal/types";

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
  private appConfigRepo: AppConfigRepo;
  private paypalRefundsApiFactory: IPayPalRefundsApiFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    paypalRefundsApiFactory: IPayPalRefundsApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.paypalRefundsApiFactory = deps.paypalRefundsApiFactory;
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionRefundRequestedEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event } = args;

    const transaction = getTransactionFromRequestedEventPayload(event);
    const channelId = getChannelIdFromRequestedEventPayload(event);

    // loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, transaction.pspReference);

    const paypalConfigForThisChannel = await this.appConfigRepo.getPayPalConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

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

    appContextContainer.set({
      paypalEnv: paypalConfigForThisChannel.value.getPayPalEnvValue(),
    });

    const paypalRefundsApi = this.paypalRefundsApiFactory.create({
      clientId: paypalConfigForThisChannel.value.clientId,
      clientSecret: paypalConfigForThisChannel.value.clientSecret,
      env: paypalConfigForThisChannel.value.environment,
    });

    this.logger.debug("Refunding PayPal payment intent with id", {
      id: transaction.pspReference,
      action: event.action,
    });

    const paypalOrderId = createPayPalOrderId(transaction.pspReference);

    const paypalMoney = {
      currency_code: event.action.currency,
      value: event.action.amount.toString(),
    };

    // Get capture ID from order - simplified for now
    // In production, you'd track capture IDs or fetch from PayPal API
    const captureId = transaction.pspReference; // Assuming pspReference is capture ID

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
