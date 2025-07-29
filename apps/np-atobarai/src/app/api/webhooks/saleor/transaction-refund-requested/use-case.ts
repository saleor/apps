import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { err, ok, Result } from "neverthrow";

import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/api/types";
import { createAtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { TransactionRecordRepo } from "@/modules/transactions-recording/types";

import { BaseUseCase } from "../base-use-case";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "../saleor-webhook-responses";
import { RefundEventParser } from "./refund-event-parser";
import { RefundOrchestrator } from "./refund-orchestrator";
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

  private readonly atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  private readonly transactionRecordRepo: TransactionRecordRepo;
  private readonly eventParser = new RefundEventParser();
  private readonly refundOrchestrator = new RefundOrchestrator();

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

  async execute(params: {
    appId: string;
    event: TransactionRefundRequestedEventFragment;
    saleorApiUrl: SaleorApiUrl;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event } = params;

    const parsingResult = this.eventParser.parse(event);

    if (parsingResult.isErr()) {
      return err(parsingResult.error);
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

    const refundResult = await this.refundOrchestrator.processRefund({
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      transactionRecord,
    });

    if (refundResult.isErr()) {
      return err(refundResult.error);
    }

    return ok(refundResult.value);
  }
}
