import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { err, ok, Result } from "neverthrow";

import { TransactionProcessSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import {
  AtobaraiChangeTransactionPayload,
  createAtobaraiChangeTransactionPayload,
} from "@/modules/atobarai/api/atobarai-change-transaction-payload";
import {
  AtobaraiTransactionSuccessResponse,
  CreditCheckResult,
} from "@/modules/atobarai/api/atobarai-transaction-success-response";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/api/types";
import { createAtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";
import { TransactionGoodBuilder } from "@/modules/atobarai/atobarai-goods/transaction-goods-builder";
import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";
import { createAtobaraiShopOrderDate } from "@/modules/atobarai/atobarai-shop-order-date";
import { createAtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { SaleorPaymentMethodDetails } from "@/modules/saleor/saleor-payment-method-details";
import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import { BaseUseCase } from "../base-use-case";
import { AppIsNotConfiguredResponse } from "../saleor-webhook-responses";
import { AtobaraiFailureTransactionError, InvalidEventValidationError } from "../use-case-errors";
import { TransactionProcessSessionUseCaseResponse } from "./use-case-response";

type UseCaseExecuteResult = Promise<
  Result<TransactionProcessSessionUseCaseResponse, AppIsNotConfiguredResponse>
>;

export class TransactionProcessSessionUseCase extends BaseUseCase {
  protected logger = createLogger("TransactionProcessSessionUseCase");
  protected appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
  private atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  private goodsBuilder = new TransactionGoodBuilder();

  constructor(deps: {
    appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
    atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  }) {
    super();
    this.atobaraiApiClientFactory = deps.atobaraiApiClientFactory;
    this.appConfigRepo = deps.appConfigRepo;
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
      atobaraiGoods: this.goodsBuilder.build({
        sourceObject: event.sourceObject,
        useSkuAsName: config.skuAsName,
      }),
      atobaraiShopOrderDate: createAtobaraiShopOrderDate(event.issuedAt!), // checked if exists in execute method
    });
  }

  private mapAtobaraiResponseToUseCaseResponse(
    transaction: AtobaraiTransactionSuccessResponse["results"][number],
  ) {
    const atobaraiTransactionId = createAtobaraiTransactionId(transaction.np_transaction_id);

    const saleorPaymentMethodDetails = new SaleorPaymentMethodDetails();

    switch (transaction.authori_result) {
      case CreditCheckResult.Success:
        return ok(
          new TransactionProcessSessionUseCaseResponse.Success({
            transactionResult: new ChargeSuccessResult(),
            atobaraiTransactionId,
            saleorPaymentMethodDetails,
          }),
        );
      case CreditCheckResult.Pending:
        return ok(
          new TransactionProcessSessionUseCaseResponse.Success({
            transactionResult: new ChargeActionRequiredResult(),
            atobaraiTransactionId,
            saleorPaymentMethodDetails,
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
      default:
        return ok(
          new TransactionProcessSessionUseCaseResponse.Failure({
            transactionResult: new ChargeFailureResult(),
            error: new AtobaraiFailureTransactionError(
              `Unexpected Atobarai transaction result: ${transaction.authori_result}`,
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

    // TODO Is missing issuedAt invalid payload? Isn't it Saleor error?
    if (!event.issuedAt) {
      this.logger.warn("Missing issuedAt in event", {
        event,
      });

      return ok(
        new TransactionProcessSessionUseCaseResponse.Failure({
          error: new InvalidEventValidationError("Missing issuedAt in event", {
            props: {
              publicMessage: "Missing issuedAt in event",
            },
          }),
          transactionResult: new ChargeFailureResult(),
        }),
      );
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
      {
        rejectMultipleResults: true,
      },
    );

    if (changeTransactionResult.isErr()) {
      this.logger.warn("Failed to change transaction with Atobarai", {
        error: changeTransactionResult.error,
      });

      return ok(
        new TransactionProcessSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          error: changeTransactionResult.error,
          apiError:
            "apiError" in changeTransactionResult.error
              ? changeTransactionResult.error.apiError
              : undefined,
        }),
      );
    }

    const transactionResult = changeTransactionResult.value;

    return this.mapAtobaraiResponseToUseCaseResponse(transactionResult.results[0]);
  }
}
