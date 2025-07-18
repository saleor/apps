import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import { FulfillmentTrackingNumberUpdatedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { createAtobaraiFulfillmentReportPayload } from "@/modules/atobarai/atobarai-fulfillment-report-payload";
import { createAtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/types";

import { AppIsNotConfiguredResponse, MalformedRequestResponse } from "../saleor-webhook-responses";
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

  async execute(params: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: FulfillmentTrackingNumberUpdatedEventFragment;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event } = params;

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

    const atobaraiConfigForThisChannel = await this.appConfigRepo.getChannelConfig({
      channelId: event.order.channel.id,
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
        channelId: event.order.channel.id,
      });

      return err(
        new AppIsNotConfiguredResponse(new BaseError("Configuration not found for channel")),
      );
    }

    const apiClient = this.atobaraiApiClientFactory.create({
      atobaraiTerminalId: atobaraiConfigForThisChannel.value.terminalId,
      atobaraiMerchantCode: atobaraiConfigForThisChannel.value.merchantCode,
      atobaraiSpCode: atobaraiConfigForThisChannel.value.spCode,
      atobaraiEnvironment: atobaraiConfigForThisChannel.value.useSandbox ? "sandbox" : "production",
    });

    const reportFulfillmentResult = await apiClient.reportFulfillment(
      createAtobaraiFulfillmentReportPayload({
        trackingNumber: event.fulfillment.trackingNumber,
        atobaraiTransactionId: createAtobaraiTransactionId(transaction.pspReference),
        // TODO: convert to value object
        shippingCompanyCode: atobaraiConfigForThisChannel.value.shippingCompanyCode,
      }),
    );

    if (reportFulfillmentResult.isErr()) {
      this.logger.error("Failed to report fulfillment", {
        error: reportFulfillmentResult.error,
        orderId: event.order.id,
        trackingNumber: event.fulfillment.trackingNumber,
      });

      // TODO: change response
      return err(
        new MalformedRequestResponse(
          new BaseError("Failed to report fulfillment", { cause: reportFulfillmentResult.error }),
        ),
      );
    }

    const transactionResult = reportFulfillmentResult.value;

    if (transactionResult.results.length > 1) {
      return err(
        new MalformedRequestResponse(
          new BaseError("Multiple transaction results found", {
            cause: new Error("Multiple transaction results found"),
          }),
        ),
      );
    }

    return ok(new FulfillmentTrackingNumberUpdatedUseCaseResponse());
  }
}
