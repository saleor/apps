import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { err, fromThrowable, ok, Result } from "neverthrow";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import {
  AtobaraiRegisterTransactionPayload,
  AtobaraiRegisterTransactionPayloadValidationError,
  createAtobaraiRegisterTransactionPayload,
} from "@/modules/atobarai/api/atobarai-register-transaction-payload";
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
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";
import { TransactionRecordRepo } from "@/modules/transactions-recording/types";

import { BaseUseCase } from "../base-use-case";
import { AppIsNotConfiguredResponse, BrokenAppResponse } from "../saleor-webhook-responses";
import { AtobaraiFailureTransactionError, InvalidEventValidationError } from "../use-case-errors";
import { TransactionInitializeSessionUseCaseResponse } from "./use-case-response";

type UseCaseExecuteResult = Promise<
  Result<
    TransactionInitializeSessionUseCaseResponse,
    AppIsNotConfiguredResponse | BrokenAppResponse
  >
>;

export class TransactionInitializeSessionUseCase extends BaseUseCase {
  protected appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
  protected logger = createLogger("TransactionInitializeSessionUseCase");
  private atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  private appTransactionRepo: TransactionRecordRepo;
  private goodsBuilder = new TransactionGoodBuilder();

  constructor(deps: {
    appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
    atobaraiApiClientFactory: IAtobaraiApiClientFactory;
    appTransactionRepo: TransactionRecordRepo;
  }) {
    super();
    this.atobaraiApiClientFactory = deps.atobaraiApiClientFactory;
    this.appConfigRepo = deps.appConfigRepo;
    this.appTransactionRepo = deps.appTransactionRepo;
  }

  private prepareRegisterTransactionPayload(
    event: TransactionInitializeSessionEventFragment,
    config: AppChannelConfig,
  ): Result<
    AtobaraiRegisterTransactionPayload,
    InstanceType<typeof AtobaraiRegisterTransactionPayloadValidationError>
  > {
    try {
      const atobaraiCustomer = createAtobaraiCustomer(event);
      const atobaraiDeliveryDestination = createAtobaraiDeliveryDestination(event);

      const transactionPayloadResult = fromThrowable(
        createAtobaraiRegisterTransactionPayload,
        AtobaraiRegisterTransactionPayloadValidationError.normalize,
      )({
        saleorTransactionToken: createSaleorTransactionToken(event.transaction.token),
        atobaraiMoney: createAtobaraiMoney({
          amount: event.action.amount,
          currency: event.action.currency,
        }),
        atobaraiCustomer,
        atobaraiDeliveryDestination,
        atobaraiGoods: this.goodsBuilder.build({
          sourceObject: event.sourceObject,
          useSkuAsName: config.skuAsName,
        }),
        atobaraiShopOrderDate: createAtobaraiShopOrderDate(event.issuedAt!), // checked if exists in execute method
      });

      return transactionPayloadResult;
    } catch (error) {
      return err(AtobaraiRegisterTransactionPayloadValidationError.normalize(error));
    }
  }

  private async mapAtobaraiResponseToUseCaseResponse({
    transaction,
    saleorApiUrl,
    appId,
  }: {
    transaction: AtobaraiTransactionSuccessResponse["results"][number];
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) {
    const atobaraiTransactionId = createAtobaraiTransactionId(transaction.np_transaction_id);

    const appTransaction = new TransactionRecord({
      atobaraiTransactionId,
      saleorTrackingNumber: null,
      fulfillmentMetadataShippingCompanyCode: null,
    });

    const createTransactionResult = await this.appTransactionRepo.createTransaction(
      {
        saleorApiUrl,
        appId,
      },
      appTransaction,
    );

    if (createTransactionResult.isErr()) {
      this.logger.error("Failed to create transaction in app transaction repo", {
        error: createTransactionResult.error,
      });

      return err(new BrokenAppResponse(createTransactionResult.error));
    }

    const saleorPaymentMethodDetails = new SaleorPaymentMethodDetails();

    switch (transaction.authori_result) {
      case CreditCheckResult.Success:
        return ok(
          new TransactionInitializeSessionUseCaseResponse.Success({
            transactionResult: new ChargeSuccessResult(),
            atobaraiTransactionId,
            saleorPaymentMethodDetails,
          }),
        );
      case CreditCheckResult.Pending:
        return ok(
          new TransactionInitializeSessionUseCaseResponse.Success({
            transactionResult: new ChargeActionRequiredResult(),
            atobaraiTransactionId,
            saleorPaymentMethodDetails,
          }),
        );
      case CreditCheckResult.Failed:
      case CreditCheckResult.BeforeReview:
        return ok(
          new TransactionInitializeSessionUseCaseResponse.Failure({
            apiError: transaction.authori_result,
            transactionResult: new ChargeFailureResult(),
            error: new AtobaraiFailureTransactionError(
              `Atobarai transaction failed with result: ${transaction.authori_result}`,
            ),
          }),
        );
      default:
        return ok(
          new TransactionInitializeSessionUseCaseResponse.Failure({
            apiError: transaction.authori_result,
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
    event: TransactionInitializeSessionEventFragment;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event } = params;

    const atobaraiConfigResult = await this.getAtobaraiConfigForChannel({
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

      return ok(
        new TransactionInitializeSessionUseCaseResponse.Failure({
          error: new InvalidEventValidationError("Missing issuedAt in event", {
            props: {
              publicMessage: "Missing issuedAt in event",
            },
          }),
          transactionResult: new ChargeFailureResult(),
        }),
      );
    }

    const apiClient = this.atobaraiApiClientFactory.create({
      atobaraiTerminalId: atobaraiConfigResult.value.terminalId,
      atobaraiMerchantCode: atobaraiConfigResult.value.merchantCode,
      atobaraiSecretSpCode: atobaraiConfigResult.value.secretSpCode,
      atobaraiEnvironment: atobaraiConfigResult.value.useSandbox ? "sandbox" : "production",
    });

    const payloadResult = this.prepareRegisterTransactionPayload(event, atobaraiConfigResult.value);

    if (payloadResult.isErr()) {
      this.logger.warn("Failed to prepare transaction payload", {
        error: payloadResult.error,
      });

      return ok(
        new TransactionInitializeSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          error: new InvalidEventValidationError(payloadResult.error.message, {
            cause: payloadResult.error,
            props: {
              publicMessage: payloadResult.error.message,
            },
          }),
        }),
      );
    }

    const registerTransactionResult = await apiClient.registerTransaction(payloadResult.value, {
      rejectMultipleResults: true,
    });

    if (registerTransactionResult.isErr()) {
      /**
       * We do not log error, because it's likely on of expected errors from the API
       * TODO: Consider adding exact mapping of every available error - some of them can be actually errors, some of them not
       */
      this.logger.warn("Failed to register transaction with Atobarai", {
        error: registerTransactionResult.error,
      });

      return ok(
        new TransactionInitializeSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          error: registerTransactionResult.error,
          apiError:
            "apiError" in registerTransactionResult.error
              ? registerTransactionResult.error.apiError
              : undefined,
        }),
      );
    }

    const transactionResult = registerTransactionResult.value;

    return this.mapAtobaraiResponseToUseCaseResponse({
      transaction: transactionResult.results[0],
      saleorApiUrl,
      appId,
    });
  }
}
