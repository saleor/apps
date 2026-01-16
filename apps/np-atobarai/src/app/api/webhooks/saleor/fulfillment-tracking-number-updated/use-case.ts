import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { err, fromThrowable, ok, Result } from "neverthrow";
import { Client } from "urql";

import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { FulfillmentTrackingNumberUpdatedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { createAtobaraiFulfillmentReportPayload } from "@/modules/atobarai/api/atobarai-fulfillment-report-payload";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/api/types";
import {
  AtobaraiShippingCompanyCode,
  AtobaraiShippingCompanyCodeValidationError,
  createAtobaraiShippingCompanyCode,
} from "@/modules/atobarai/atobarai-shipping-company-code";
import { createAtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { IOrderNoteService } from "@/modules/saleor/order-note-service";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";
import { TransactionRecordRepo } from "@/modules/transactions-recording/types";

import { BaseUseCase } from "../base-use-case";
import { AppIsNotConfiguredResponse, BrokenAppResponse } from "../saleor-webhook-responses";
import { FulfillmentTrackingNumberUpdatedUseCaseResponse } from "./use-case-response";

type UseCaseExecuteResult = Promise<
  Result<
    FulfillmentTrackingNumberUpdatedUseCaseResponse,
    AppIsNotConfiguredResponse | BrokenAppResponse
  >
>;

export type SaleorOrderNoteServiceFactory = (graphqlClient: Client) => IOrderNoteService;

export class FulfillmentTrackingNumberUpdatedUseCase extends BaseUseCase {
  protected logger = createLogger("FulfillmentTrackingNumberUpdatedUseCase");
  protected appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
  private atobaraiApiClientFactory: IAtobaraiApiClientFactory;
  private transactionRecordRepo: TransactionRecordRepo;
  private orderNoteServiceFactory: SaleorOrderNoteServiceFactory;

  constructor(deps: {
    appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
    atobaraiApiClientFactory: IAtobaraiApiClientFactory;
    transactionRecordRepo: TransactionRecordRepo;
    orderNoteServiceFactory: SaleorOrderNoteServiceFactory;
  }) {
    super();
    this.appConfigRepo = deps.appConfigRepo;
    this.atobaraiApiClientFactory = deps.atobaraiApiClientFactory;
    this.transactionRecordRepo = deps.transactionRecordRepo;
    this.orderNoteServiceFactory = deps.orderNoteServiceFactory;
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

      return err(new InvalidEventValidationError("Fulfillment tracking number is missing"));
    }

    if (!event.order?.transactions?.length) {
      this.logger.warn("Order transactions are missing", {
        event: {
          orderId: event.order?.id,
        },
      });

      return err(new InvalidEventValidationError("Order transactions are missing"));
    }

    if (event.order.transactions.length > 1) {
      // App support only single transaction per order / checkout. This is a limitation of how we send goods to Atobarai. If there are multiple transactions, we would need to report goods prices minus prices from other transactions.
      this.logger.warn("Multiple transactions found for the order", {
        event: { orderId: event.order.id },
      });

      return err(new InvalidEventValidationError("Multiple transactions found for the order"));
    }

    const transaction = event.order.transactions[0];

    if (transaction.createdBy?.__typename !== "App") {
      this.logger.warn("Transaction was not created by the app. Skipping.", {
        event: {
          orderId: event.order.id,
          transactionPspReference: transaction.pspReference,
          createdBy: transaction.createdBy?.__typename,
        },
      });

      return err(new InvalidEventValidationError("Transaction was not created by the app"));
    }

    if (transaction.createdBy.id !== appId) {
      this.logger.warn("Transaction was not created by the current app installation. Skipping.", {
        event: {
          orderId: event.order.id,
          transactionPspReference: transaction.pspReference,
          appId,
          transactionCreatedById: transaction.createdBy.id,
        },
      });

      return err(
        new InvalidEventValidationError(
          "Transaction was not created by the current app installation",
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

  private resolveAtobaraiPDCompanyCodeFromMetadata(
    event: FulfillmentTrackingNumberUpdatedEventFragment,
  ): Result<
    AtobaraiShippingCompanyCode | null,
    InstanceType<typeof AtobaraiShippingCompanyCodeValidationError>
  > {
    if (event.fulfillment?.atobaraiPDCompanyCode) {
      this.logger.info("Using Atobarai PD company code from private metadata", {
        atobaraiPDCompanyCode: event.fulfillment.atobaraiPDCompanyCode,
      });

      return fromThrowable(
        createAtobaraiShippingCompanyCode,
        AtobaraiShippingCompanyCodeValidationError.normalize,
      )(event.fulfillment.atobaraiPDCompanyCode);
    }

    return ok(null);
  }

  async execute(params: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: FulfillmentTrackingNumberUpdatedEventFragment;
    graphqlClient: Client;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event, graphqlClient } = params;

    const parsingResult = this.parseEvent({ event, appId });

    if (parsingResult.isErr()) {
      return ok(
        new FulfillmentTrackingNumberUpdatedUseCaseResponse.Failure(
          new InvalidEventValidationError("Failed to parse Saleor event", {
            cause: parsingResult.error,
            props: {
              publicMessage: parsingResult.error.message,
            },
          }),
        ),
      );
    }

    const { orderId, channelId, pspReference, trackingNumber } = parsingResult.value;

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

    const metadataShippingCompanyCodeResult = this.resolveAtobaraiPDCompanyCodeFromMetadata(event);

    if (metadataShippingCompanyCodeResult.isErr()) {
      return ok(
        new FulfillmentTrackingNumberUpdatedUseCaseResponse.Failure(
          new InvalidEventValidationError(metadataShippingCompanyCodeResult.error.message, {
            cause: metadataShippingCompanyCodeResult.error,
            props: {
              publicMessage: metadataShippingCompanyCodeResult.error.message,
            },
          }),
        ),
      );
    }

    const reportFulfillmentResult = await apiClient.reportFulfillment(
      createAtobaraiFulfillmentReportPayload({
        trackingNumber,
        atobaraiTransactionId: createAtobaraiTransactionId(pspReference),
        shippingCompanyCode:
          metadataShippingCompanyCodeResult.value || atobaraiConfigResult.value.shippingCompanyCode,
      }),
      {
        rejectMultipleResults: true,
      },
    );

    if (reportFulfillmentResult.isErr()) {
      this.logger.warn("Failed to report fulfillment", {
        error: reportFulfillmentResult.error,
        orderId,
        trackingNumber,
      });

      await this.addOrderNote({
        orderId,
        graphqlClient,
        message: `Failed to report fulfillment for tracking number ${trackingNumber}`,
      });

      return ok(
        new FulfillmentTrackingNumberUpdatedUseCaseResponse.Failure(reportFulfillmentResult.error),
      );
    }

    await this.addOrderNote({
      orderId,
      graphqlClient,
      message: `Successfully reported fulfillment for tracking number ${trackingNumber}`,
    });

    const fulfillmentResult = reportFulfillmentResult.value;

    const atobaraiTransactionId = createAtobaraiTransactionId(
      fulfillmentResult.results[0].np_transaction_id,
    );

    const appTransaction = new TransactionRecord({
      atobaraiTransactionId,
      saleorTrackingNumber: trackingNumber,
      fulfillmentMetadataShippingCompanyCode: metadataShippingCompanyCodeResult.value,
    });

    const updateTransactionResult = await this.transactionRecordRepo.updateTransaction(
      {
        saleorApiUrl,
        appId,
      },
      appTransaction,
    );

    if (updateTransactionResult.isErr()) {
      this.logger.error("Failed to update transaction in app transaction repo", {
        error: updateTransactionResult.error,
      });

      return err(new BrokenAppResponse(updateTransactionResult.error));
    }

    return ok(new FulfillmentTrackingNumberUpdatedUseCaseResponse.Success());
  }

  private async addOrderNote({
    orderId,
    message,
    graphqlClient,
  }: {
    orderId: string;
    message: string;
    graphqlClient: Client;
  }): Promise<void> {
    const orderNoteService = this.orderNoteServiceFactory(graphqlClient);

    const result = await orderNoteService.addOrderNote({
      orderId,
      message,
    });

    if (result.isErr()) {
      this.logger.warn("Failed to add order note", {
        orderId,
        message,
        error: result.error,
      });
    }
  }
}
