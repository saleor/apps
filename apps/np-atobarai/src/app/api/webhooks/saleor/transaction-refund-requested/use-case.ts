import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { err, ok, Result } from "neverthrow";

import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/api/types";
import { createAtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { RefundFailureResult } from "@/modules/transaction-result/refund-result";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";
import { TransactionRecordRepo } from "@/modules/transactions-recording/types";

import { BaseUseCase } from "../base-use-case";
import { AppIsNotConfiguredResponse, BrokenAppResponse } from "../saleor-webhook-responses";
import { RefundEventParser } from "./refund-event-parser";
import { AfterFulfillmentRefundOrchestrator } from "./refund-orchestrator/after-fulfillment-refund-orchestrator";
import { BeforeFulfillmentRefundOrchestrator } from "./refund-orchestrator/before-fulfillment-refund-orchestrator";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

type UseCaseExecuteResult = Promise<
  Result<TransactionRefundRequestedUseCaseResponse, AppIsNotConfiguredResponse | BrokenAppResponse>
>;

export class TransactionRefundRequestedUseCase extends BaseUseCase {
  protected logger = createLogger("TransactionRefundRequestedUseCase");
  protected appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;

  private readonly atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  private readonly transactionRecordRepo: TransactionRecordRepo;
  private readonly eventParser = new RefundEventParser();
  private readonly beforeFulfillmentRefundOrchestrator = new BeforeFulfillmentRefundOrchestrator();
  private readonly afterFulfillmentRefundOrchestrator = new AfterFulfillmentRefundOrchestrator();

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

  private selectRefundOrchestrator(
    transactionRecord: TransactionRecord,
  ): BeforeFulfillmentRefundOrchestrator | AfterFulfillmentRefundOrchestrator {
    if (transactionRecord.hasFulfillmentReported()) {
      return this.afterFulfillmentRefundOrchestrator;
    }

    return this.beforeFulfillmentRefundOrchestrator;
  }

  async execute(params: {
    appId: string;
    event: TransactionRefundRequestedEventFragment;
    saleorApiUrl: SaleorApiUrl;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event } = params;

    const parsingResult = this.eventParser.parse(event);

    if (parsingResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({
            reason: "missingData",
          }),
        }),
      );
    }
    const parsedEvent = parsingResult.value;

    const atobaraiConfigResult = await this.getAtobaraiConfigForChannel({
      channelId: parsedEvent.channelId,
      appId,
      saleorApiUrl,
    });

    if (atobaraiConfigResult.isErr()) {
      return err(atobaraiConfigResult.error);
    }
    const appConfig = atobaraiConfigResult.value;

    const atobaraiTransactionId = createAtobaraiTransactionId(parsedEvent.pspReference);
    const transactionRecordResult =
      await this.transactionRecordRepo.getTransactionByAtobaraiTransactionId(
        { saleorApiUrl, appId },
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
      atobaraiTerminalId: appConfig.terminalId,
      atobaraiMerchantCode: appConfig.merchantCode,
      atobaraiSecretSpCode: appConfig.secretSpCode,
      atobaraiEnvironment: appConfig.useSandbox ? "sandbox" : "production",
    });

    const orchestrator = this.selectRefundOrchestrator(transactionRecord);

    const refundResult = await orchestrator.processRefund({
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      transactionRecord,
    });

    if (refundResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({
            reason: "registerFailure",
          }),
        }),
      );
    }

    return ok(refundResult.value);
  }
}
