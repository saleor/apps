import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import { FulfillmentTrackingNumberUpdatedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { createAtobaraiFulfillmentReportPayload } from "@/modules/atobarai/atobarai-fulfillment-report-payload";
import { AtobaraiFulfillmentReportSuccessResponse } from "@/modules/atobarai/atobarai-fulfillment-report-success-response";
import { createAtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/types";

import { AppIsNotConfiguredResponse, MalformedRequestResponse } from "../saleor-webhook-responses";
import { AtobaraiMultipleFailureTransactionError } from "../use-case-errors";
import { FulfillmentTrackingNumberUpdatedUseCaseResponse } from "./use-case-response";

type UseCaseExecuteResult = Promise<
  Result<
    FulfillmentTrackingNumberUpdatedUseCaseResponse,
    AppIsNotConfiguredResponse | MalformedRequestResponse
  >
>;

export class FulfillmentTrackingNumberUpdatedUseCase {
  private appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
  private logger = createLogger("FulfillmentTrackingNumberUpdatedUseCase");
  private atobaraiApiClientFactory: IAtobaraiApiClientFactory;

  constructor(deps: {
    appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
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

  private handleMultipleTransactionResults(
    transactionResult: AtobaraiFulfillmentReportSuccessResponse,
  ) {
    this.logger.warn("Multiple transaction results found", {
      transactionResult,
    });

    return ok(
      new FulfillmentTrackingNumberUpdatedUseCaseResponse.Failure(
        new AtobaraiMultipleFailureTransactionError("Multiple transaction results found"),
      ),
    );
  }

  private parseEvent({
    event,
    appId,
  }: {
    event: FulfillmentTrackingNumberUpdatedEventFragment;
    appId: string;
  }) {
    if (!event.fulfillment?.trackingNumber) {
      this.logger.warn("Fulfillment tracking number is missing", {
        event: {
          orderId: event.order?.id,
        },
      });

      return err(
        new MalformedRequestResponse(new BaseError("Fulfillment tracking number is missing")),
      );
    }

    if (!event.order?.transactions?.length) {
      this.logger.warn("Order transactions are missing", {
        event: {
          orderId: event.order?.id,
        },
      });

      return err(new MalformedRequestResponse(new BaseError("Order transactions are missing")));
    }

    if (event.order.transactions.length > 1) {
      this.logger.warn("Multiple transactions found for the order", {
        event: { orderId: event.order.id },
      });

      return err(
        new MalformedRequestResponse(new BaseError("Multiple transactions found for the order")),
      );
    }

    const transaction = event.order.transactions[0];

    if (transaction.createdBy?.__typename !== "App") {
      this.logger.warn("Transaction was not created by the app", {
        event: {
          orderId: event.order.id,
          transactionPspReference: transaction.pspReference,
          createdBy: transaction.createdBy?.__typename,
        },
      });

      return err(
        new MalformedRequestResponse(new BaseError("Transaction was not created by the app")),
      );
    }

    if (transaction.createdBy.id !== appId) {
      this.logger.warn("Transaction was not created by the current app installation", {
        event: {
          orderId: event.order.id,
          transactionPspReference: transaction.pspReference,
          appId,
          transactionCreatedById: transaction.createdBy.id,
        },
      });

      return err(
        new MalformedRequestResponse(
          new BaseError("Transaction was not created by the current app installation"),
        ),
      );
    }

    return ok({
      orderId: event.order.id,
      channelId: event.order.channel.id,
      pspReference: transaction.pspReference,
      trackingNumber: event.fulfillment.trackingNumber,
    });
  }

  async execute(params: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: FulfillmentTrackingNumberUpdatedEventFragment;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event } = params;

    const parsingResult = this.parseEvent({ event, appId });

    if (parsingResult.isErr()) {
      return err(parsingResult.error);
    }

    const { orderId, channelId, pspReference, trackingNumber } = parsingResult.value;

    const atobaraiConfigResult = await this.getAtobaraiConfig({
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
      atobaraiSpCode: atobaraiConfigResult.value.spCode,
      atobaraiEnvironment: atobaraiConfigResult.value.useSandbox ? "sandbox" : "production",
    });

    const reportFulfillmentResult = await apiClient.reportFulfillment(
      createAtobaraiFulfillmentReportPayload({
        trackingNumber,
        atobaraiTransactionId: createAtobaraiTransactionId(pspReference),
        shippingCompanyCode: atobaraiConfigResult.value.shippingCompanyCode,
      }),
    );

    if (reportFulfillmentResult.isErr()) {
      this.logger.error("Failed to report fulfillment", {
        error: reportFulfillmentResult.error,
        orderId,
        trackingNumber,
      });

      return ok(
        new FulfillmentTrackingNumberUpdatedUseCaseResponse.Failure(reportFulfillmentResult.error),
      );
    }

    const fulfillmentResult = reportFulfillmentResult.value;

    if (fulfillmentResult.results.length > 1) {
      return this.handleMultipleTransactionResults(fulfillmentResult);
    }

    return ok(new FulfillmentTrackingNumberUpdatedUseCaseResponse.Success());
  }
}
