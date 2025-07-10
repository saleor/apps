import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { err, ok, Result } from "neverthrow";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/types";
import { AtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { AtobaraiGoods } from "@/modules/atobarai/atobarai-goods";
import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";
import {
  AtobaraiRegisterTransactionPayload,
  createAtobaraiRegisterTransactionPayload,
} from "@/modules/atobarai/atobarai-register-transaction-payload";
import { AtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-shipping-address";
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

    const atobaraiConfigForThisChannel = await this.appConfigRepo.getAtobaraiConfig({
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
  ): AtobaraiRegisterTransactionPayload {
    const saleorTransactionToken = createSaleorTransactionToken(event.transaction.token);
    const atobaraiMoney = createAtobaraiMoney({
      amount: event.action.amount,
      currency: event.action.currency,
    });
    const atobaraiCustomer = AtobaraiCustomer.createFromEvent(event);

    return createAtobaraiRegisterTransactionPayload({
      saleorTransactionToken,
      atobaraiMoney,
      atobaraiCustomer,
      atobaraiDeliveryDestination: new AtobaraiDeliveryDestination(),
      atobaraiGoods: new AtobaraiGoods(),
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
      atobaraiTerminalId: atobaraiConfigResult.value.atobaraiTerminalId,
      atobaraiMerchantCode: atobaraiConfigResult.value.atobaraiMerchantCode,
      atobaraiSpCode: atobaraiConfigResult.value.atobaraiSpCode,
      atobaraiEnviroment: atobaraiConfigResult.value.atobaraiEnviroment,
    });

    const registerTransactionResult = await apiClient.registerTransaction(
      this.prepareRegisterTransactionPayload(event),
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
