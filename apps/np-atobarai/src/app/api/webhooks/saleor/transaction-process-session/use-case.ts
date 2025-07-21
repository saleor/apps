import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import { TransactionProcessSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import {
  AtobaraiChangeTransactionPayload,
  createAtobaraiChangeTransactionPayload,
} from "@/modules/atobarai/atobarai-change-transaction-payload";
import { createAtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";
import { createAtobaraiGoods } from "@/modules/atobarai/atobarai-goods";
import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";
import { createAtobaraiShopOrderDate } from "@/modules/atobarai/atobarai-shop-order-date";
import { createAtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import {
  AtobaraiTransactionSuccessResponse,
  CreditCheckResult,
} from "@/modules/atobarai/atobarai-transaction-success-response";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/types";
import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import { BaseUseCase } from "../base-use-case";
import { AppIsNotConfiguredResponse, MalformedRequestResponse } from "../saleor-webhook-responses";
import {
  AtobaraiFailureTransactionError,
  AtobaraiMultipleFailureTransactionError,
} from "../use-case-errors";
import { TransactionProcessSessionUseCaseResponse } from "./use-case-response";

type UseCaseExecuteResult = Promise<
  Result<
    TransactionProcessSessionUseCaseResponse,
    AppIsNotConfiguredResponse | MalformedRequestResponse
  >
>;

export class TransactionProcessSessionUseCase extends BaseUseCase {
  protected logger = createLogger("TransactionProcessSessionUseCase");
  private atobaraiApiClientFactory: IAtobaraiApiClientFactory;

  constructor(deps: {
    appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
    atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  }) {
    super(deps.appConfigRepo);
    this.atobaraiApiClientFactory = deps.atobaraiApiClientFactory;
  }

  private prepareChangeTransactionPayload(
    event: TransactionProcessSessionEventFragment,
    config: AppChannelConfig,
  ): AtobaraiChangeTransactionPayload {
    return createAtobaraiChangeTransactionPayload({
      atobaraiTransactionId: createAtobaraiTransactionId(event.transaction.pspReference),
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

  private handleMultipleTransactionResults(transactionResult: AtobaraiTransactionSuccessResponse) {
    this.logger.warn("Multiple transaction results found", {
      transactionResult,
    });

    return ok(
      new TransactionProcessSessionUseCaseResponse.Failure({
        transactionResult: new ChargeFailureResult(),
        error: new AtobaraiMultipleFailureTransactionError("Multiple transaction results found"),
      }),
    );
  }

  private mapAtobaraiResponseToUseCaseResponse(
    transaction: AtobaraiTransactionSuccessResponse["results"][number],
  ) {
    const atobaraiTransactionId = createAtobaraiTransactionId(transaction.np_transaction_id);

    switch (transaction.authori_result) {
      case CreditCheckResult.Success:
        return ok(
          new TransactionProcessSessionUseCaseResponse.Success({
            transactionResult: new ChargeSuccessResult(),
            atobaraiTransactionId,
          }),
        );
      case CreditCheckResult.Pending:
        return ok(
          new TransactionProcessSessionUseCaseResponse.Success({
            transactionResult: new ChargeActionRequiredResult(),
            atobaraiTransactionId,
          }),
        );
      case CreditCheckResult.Failed:
      case CreditCheckResult.BeforeReview:
        return ok(
          new TransactionProcessSessionUseCaseResponse.Failure({
            transactionResult: new ChargeFailureResult(),
            error: new AtobaraiFailureTransactionError(
              `Atobarai transaction failed with result: ${transaction.authori_result}`,
            ),
          }),
        );
    }
  }

  async execute(params: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionProcessSessionEventFragment;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event } = params;

    if (!event.issuedAt) {
      this.logger.warn("Missing issuedAt in event", {
        event,
      });

      return err(new MalformedRequestResponse(new BaseError("Missing issuedAt in event")));
    }

    const atobaraiConfigResult = await this.getAtobaraiConfigForChannel({
      channelId: event.sourceObject.channel.id,
      appId,
      saleorApiUrl,
    });

    if (atobaraiConfigResult.isErr()) {
      return err(atobaraiConfigResult.error);
    }

    const apiClient = this.atobaraiApiClientFactory.create({
      atobaraiTerminalId: atobaraiConfigResult.value.terminalId,
      atobaraiMerchantCode: atobaraiConfigResult.value.merchantCode,
      atobaraiSecretSpCode: atobaraiConfigResult.value.secretSpCode,
      atobaraiEnvironment: atobaraiConfigResult.value.useSandbox ? "sandbox" : "production",
    });

    const changeTransactionResult = await apiClient.changeTransaction(
      this.prepareChangeTransactionPayload(event, atobaraiConfigResult.value),
    );

    if (changeTransactionResult.isErr()) {
      this.logger.error("Failed to change transaction with Atobarai", {
        error: changeTransactionResult.error,
      });

      return ok(
        new TransactionProcessSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          error: changeTransactionResult.error,
        }),
      );
    }

    const transactionResult = changeTransactionResult.value;

    if (transactionResult.results.length > 1) {
      return this.handleMultipleTransactionResults(changeTransactionResult.value);
    }

    return this.mapAtobaraiResponseToUseCaseResponse(transactionResult.results[0]);
  }
}
