import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { createAtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";
import { createAtobaraiGoods } from "@/modules/atobarai/atobarai-goods";
import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";
import {
  AtobaraiRegisterTransactionPayload,
  createAtobaraiRegisterTransactionPayload,
} from "@/modules/atobarai/atobarai-register-transaction-payload";
import { createAtobaraiShopOrderDate } from "@/modules/atobarai/atobarai-shop-order-date";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/types";
import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";

import { AppIsNotConfiguredResponse, MalformedRequestResponse } from "../saleor-webhook-responses";

type UseCaseExecuteResult = Promise<
  // TODO: add here Response
  Result<unknown, AppIsNotConfiguredResponse | MalformedRequestResponse>
>;

export class TransactionInitializeSessionUseCase {
  private appConfigRepo: AppConfigRepo;
  private logger = createLogger("TransactionInitializeSessionUseCase");
  private atobaraiApiClientFactory: IAtobaraiApiClientFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.atobaraiApiClientFactory = deps.atobaraiApiClientFactory;
  }

  private async getAtobaraiConfig(params: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }) {
    const { channelId, appId, saleorApiUrl } = params;

    const atobaraiConfigForThisChannel = await this.appConfigRepo.getChannelConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (atobaraiConfigForThisChannel.isErr()) {
      this.logger.error("Failed to get configuration", {
        error: atobaraiConfigForThisChannel.error,
      });

      return err(new AppIsNotConfiguredResponse(atobaraiConfigForThisChannel.error));
    }

    if (!atobaraiConfigForThisChannel.value) {
      this.logger.warn("No configuration found for channel", {
        channelId,
      });

      return err(
        new AppIsNotConfiguredResponse(new BaseError("Configuration not found for channel")),
      );
    }

    return ok(atobaraiConfigForThisChannel.value);
  }

  private prepareRegisterTransactionPayload(
    event: TransactionInitializeSessionEventFragment,
    config: AppChannelConfig,
  ): AtobaraiRegisterTransactionPayload {
    return createAtobaraiRegisterTransactionPayload({
      saleorTransactionToken: createSaleorTransactionToken(event.transaction.token),
      atobaraiMoney: createAtobaraiMoney({
        amount: event.action.amount,
        currency: event.action.currency,
      }),
      atobaraiCustomer: createAtobaraiCustomer(event),
      atobaraiDeliveryDestination: createAtobaraiDeliveryDestination(event),
      atobaraiGoods: createAtobaraiGoods(event, config),
      atobaraiShopOrderDate: createAtobaraiShopOrderDate(event.issuedAt!), // checked if exists in execute method
    });
  }

  async execute(params: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionInitializeSessionEventFragment;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event } = params;

    const atobaraiConfigResult = await this.getAtobaraiConfig({
      channelId: event.sourceObject.channel.id,
      appId,
      saleorApiUrl,
    });

    if (atobaraiConfigResult.isErr()) {
      return err(atobaraiConfigResult.error);
    }

    if (!event.issuedAt) {
      this.logger.warn("Missing issuedAt in event", {
        event,
      });

      return err(new MalformedRequestResponse(new BaseError("Missing issuedAt in event")));
    }

    const apiClient = this.atobaraiApiClientFactory.create({
      atobaraiTerminalId: atobaraiConfigResult.value.terminalId,
      atobaraiMerchantCode: atobaraiConfigResult.value.merchantCode,
      atobaraiSpCode: atobaraiConfigResult.value.spCode,
      atobaraiEnvironment: atobaraiConfigResult.value.useSandbox ? "sandbox" : "production",
    });

    const registerTransactionResult = await apiClient.registerTransaction(
      this.prepareRegisterTransactionPayload(event, atobaraiConfigResult.value),
    );

    if (registerTransactionResult.isErr()) {
      this.logger.error("Failed to register transaction with Atobarai", {
        error: registerTransactionResult.error,
      });
    }

    // TODO: handle errors and return response
    return ok(undefined);
  }
}
