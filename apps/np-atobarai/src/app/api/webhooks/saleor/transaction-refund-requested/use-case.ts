import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { createAtobaraiCancelTransactionPayload } from "@/modules/atobarai/api/atobarai-cancel-transaction-payload";
import { AtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";
import { IAtobaraiApiClient, IAtobaraiApiClientFactory } from "@/modules/atobarai/api/types";
import {
  AtobaraiTransactionId,
  createAtobaraiTransactionId,
} from "@/modules/atobarai/atobarai-transaction-id";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { BaseUseCase } from "../base-use-case";
import { AppIsNotConfiguredResponse, MalformedRequestResponse } from "../saleor-webhook-responses";
import { AtobaraiMultipleFailureTransactionError } from "../use-case-errors";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

type UseCaseExecuteResult = Promise<
  Result<
    TransactionRefundRequestedUseCaseResponse,
    AppIsNotConfiguredResponse | MalformedRequestResponse
  >
>;

export class TransactionRefundRequestedUseCase extends BaseUseCase {
  protected logger = createLogger("TransactionRefundRequestedUseCase");
  protected appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
  private atobaraiApiClientFactory: IAtobaraiApiClientFactory;

  constructor(deps: {
    appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
    atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  }) {
    super();
    this.appConfigRepo = deps.appConfigRepo;
    this.atobaraiApiClientFactory = deps.atobaraiApiClientFactory;
  }

  private parseEvent(event: TransactionRefundRequestedEventFragment) {
    if (!event.action.amount) {
      this.logger.warn("Refund amount is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Refund amount is required")));
    }

    if (!event.transaction?.pspReference) {
      this.logger.warn("PSP reference is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("PSP reference is required")));
    }

    const totalAmount =
      event.transaction.checkout?.totalPrice.gross.amount ||
      event.transaction.order?.total.gross.amount;

    if (!totalAmount) {
      this.logger.warn("Total amount is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Total amount is required")));
    }

    const channelId =
      event.transaction?.checkout?.channel.id || event.transaction?.order?.channel.id;

    if (!channelId) {
      this.logger.warn("Channel ID is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Channel ID is required")));
    }

    return ok({
      actionAmount: event.action.amount,
      pspReference: event.transaction.pspReference,
      totalAmount,
      channelId,
    });
  }

  private handleMultipleTransactionResults(
    transactionResult: AtobaraiCancelTransactionSuccessResponse,
  ) {
    this.logger.warn("Multiple transaction results found", {
      transactionResult,
    });

    return err(
      new AtobaraiMultipleFailureTransactionError("Atobarai returned multiple transactions"),
    );
  }

  private async cancelAtobaraiTransaction({
    atobaraiTransactionId,
    apiClient,
  }: {
    atobaraiTransactionId: AtobaraiTransactionId;
    apiClient: IAtobaraiApiClient;
  }) {
    const cancelResult = await apiClient.cancelTransaction(
      createAtobaraiCancelTransactionPayload({
        atobaraiTransactionId,
      }),
    );

    if (cancelResult.isErr()) {
      this.logger.error("Failed to cancel Atobarai transaction", {
        error: cancelResult.error,
      });

      return err(cancelResult.error);
    }

    if (cancelResult.value.results.length > 1) {
      return this.handleMultipleTransactionResults(cancelResult.value);
    }

    return ok(null);
  }

  private async handleFullRefund({
    atobaraiTransactionId,
    apiClient,
  }: {
    atobaraiTransactionId: AtobaraiTransactionId;
    apiClient: IAtobaraiApiClient;
  }) {
    const cancelResult = await this.cancelAtobaraiTransaction({
      atobaraiTransactionId,
      apiClient,
    });

    if (cancelResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    return ok(
      new TransactionRefundRequestedUseCaseResponse.Success({
        transactionResult: new RefundSuccessResult(),
        atobaraiTransactionId,
      }),
    );
  }

  async execute(params: {
    appId: string;
    event: TransactionRefundRequestedEventFragment;
    saleorApiUrl: SaleorApiUrl;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event } = params;

    const parsingResult = this.parseEvent(event);

    if (parsingResult.isErr()) {
      return err(parsingResult.error);
    }

    const { actionAmount, channelId, pspReference, totalAmount } = parsingResult.value;

    const atobaraiConfigResult = await this.getAtobaraiConfigForChannel({
      channelId,
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

    /*
     * 1. Cancel the transaction in NP Atobarai (if the refund is full)
     * 2. If there is partial refund (actionAmount is not equal to totalAmount and there is orderGrantedRefund), cancel the transaction and send re-register request to NP Atobarai
     * 3. If refund is partial and there is orderGrantedRefund, return failure result
     */

    const atobaraiTransactionId = createAtobaraiTransactionId(pspReference);

    if (actionAmount === totalAmount) {
      return this.handleFullRefund({
        atobaraiTransactionId,
        apiClient,
      });
    }

    // TODO: Handle partial refunds if needed

    return ok(
      new TransactionRefundRequestedUseCaseResponse.Failure({
        transactionResult: new RefundFailureResult(),
      }),
    );
  }
}
