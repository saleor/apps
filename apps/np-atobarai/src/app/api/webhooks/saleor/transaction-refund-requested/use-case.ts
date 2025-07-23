import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/api/types";
import { createAtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { RefundFailureResult } from "@/modules/transaction-result/refund-result";
import { TransactionRecordRepo } from "@/modules/transactions-recording/types";

import { BaseUseCase } from "../base-use-case";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "../saleor-webhook-responses";
import { NoFullfillmentRefundHandler } from "./no-fulfillment-refund-handler";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

type UseCaseExecuteResult = Promise<
  Result<
    TransactionRefundRequestedUseCaseResponse,
    AppIsNotConfiguredResponse | MalformedRequestResponse | BrokenAppResponse
  >
>;

export class TransactionRefundRequestedUseCase extends BaseUseCase {
  protected logger = createLogger("TransactionRefundRequestedUseCase");
  protected appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
  private atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  private transactionRecordRepo: TransactionRecordRepo;

  constructor(deps: {
    appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
    atobaraiApiClientFactory: IAtobaraiApiClientFactory;
    transactionRecordRepo: TransactionRecordRepo;
  }) {
    super();
    this.appConfigRepo = deps.appConfigRepo;
    this.atobaraiApiClientFactory = deps.atobaraiApiClientFactory;
    this.transactionRecordRepo = deps.transactionRecordRepo;
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

    const sourceObjectTotalAmount =
      event.transaction.checkout?.totalPrice.gross.amount ||
      event.transaction.order?.total.gross.amount;

    if (!sourceObjectTotalAmount) {
      this.logger.warn("Total amount is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Total amount is required")));
    }

    const channelId =
      event.transaction.checkout?.channel?.id || event.transaction.order?.channel?.id;

    if (!channelId) {
      this.logger.warn("Channel ID is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Channel ID is required")));
    }

    return ok({
      refundedAmount: event.action.amount,
      channelId,
      pspReference: event.transaction.pspReference,
      sourceObjectTotalAmount,
    });
  }

  private isEventForFullAmount({
    refundedAmount,
    sourceObjectTotalAmount,
  }: {
    refundedAmount: number;
    sourceObjectTotalAmount: number;
  }): boolean {
    return refundedAmount === sourceObjectTotalAmount;
  }

  private isEventForPartialAmountWithoutLineItems({
    refundedAmount,
    sourceObjectTotalAmount,
    grantedRefund,
  }: {
    refundedAmount: number;
    sourceObjectTotalAmount: number;
    grantedRefund: TransactionRefundRequestedEventFragment["grantedRefund"];
  }): boolean {
    return refundedAmount < sourceObjectTotalAmount && !grantedRefund;
  }

  private isEventForPartialAmountWithLineItems({
    refundedAmount,
    sourceObjectTotalAmount,
    grantedRefund,
  }: {
    refundedAmount: number;
    sourceObjectTotalAmount: number;
    grantedRefund: TransactionRefundRequestedEventFragment["grantedRefund"];
  }): boolean {
    return refundedAmount < sourceObjectTotalAmount && grantedRefund !== null;
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

    const { refundedAmount, channelId, pspReference, sourceObjectTotalAmount } =
      parsingResult.value;

    const atobaraiConfigResult = await this.getAtobaraiConfigForChannel({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (atobaraiConfigResult.isErr()) {
      return err(atobaraiConfigResult.error);
    }

    const atobaraiTransactionId = createAtobaraiTransactionId(pspReference);

    const transactionRecordResult =
      await this.transactionRecordRepo.getTransactionByAtobaraiTransactionId(
        {
          saleorApiUrl,
          appId,
        },
        atobaraiTransactionId,
      );

    if (transactionRecordResult.isErr()) {
      this.logger.error("Failed to get transaction from transaction record repo", {
        error: transactionRecordResult.error,
      });

      return err(new BrokenAppResponse(transactionRecordResult.error));
    }

    const transactionRecord = transactionRecordResult.value;

    const apiClient = this.atobaraiApiClientFactory.create({
      atobaraiTerminalId: atobaraiConfigResult.value.terminalId,
      atobaraiMerchantCode: atobaraiConfigResult.value.merchantCode,
      atobaraiSecretSpCode: atobaraiConfigResult.value.secretSpCode,
      atobaraiEnvironment: atobaraiConfigResult.value.useSandbox ? "sandbox" : "production",
    });

    if (transactionRecord.hasFulfillmentReported()) {
      // TODO: handle fulfillment reported case
    } else {
      const handler = new NoFullfillmentRefundHandler(apiClient);

      if (this.isEventForFullAmount({ refundedAmount, sourceObjectTotalAmount })) {
        return handler.handleFullRefund({ atobaraiTransactionId });
      }

      if (
        this.isEventForPartialAmountWithLineItems({
          refundedAmount,
          sourceObjectTotalAmount,
          grantedRefund: event.grantedRefund,
        })
      ) {
        return handler.handlePartialRefundWithLineItems({
          event,
          appConfig: atobaraiConfigResult.value,
          refundedAmount,
          sourceObjectTotalAmount,
          atobaraiTransactionId,
        });
      }

      if (
        this.isEventForPartialAmountWithoutLineItems({
          refundedAmount,
          sourceObjectTotalAmount,
          grantedRefund: event.grantedRefund,
        })
      ) {
        return handler.handlePartialRefundWithoutLineItems({
          event,
          appConfig: atobaraiConfigResult.value,
          refundedAmount,
          sourceObjectTotalAmount,
          atobaraiTransactionId,
        });
      }
    }

    return ok(
      new TransactionRefundRequestedUseCaseResponse.Failure({
        transactionResult: new RefundFailureResult(),
      }),
    );
  }
}
