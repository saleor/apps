import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import { SourceObjectFragment, TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { createAtobaraiCancelTransactionPayload } from "@/modules/atobarai/api/atobarai-cancel-transaction-payload";
import { createAtobaraiChangeTransactionPayload } from "@/modules/atobarai/api/atobarai-change-transaction-payload";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { createAtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";
import {
  AtobaraiGoodsSchema,
  getDiscountLine,
  getProductLines,
  getShippingLine,
  getVoucherLine,
} from "@/modules/atobarai/atobarai-goods";
import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";
import { createAtobaraiShopOrderDate } from "@/modules/atobarai/atobarai-shop-order-date";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { MalformedRequestResponse } from "../saleor-webhook-responses";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

interface RefundHandler {
  handleFullRefund({
    atobaraiTransactionId,
  }: {
    atobaraiTransactionId: AtobaraiTransactionId;
  }): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>>;
  handlePartialRefundWithoutLineItems({
    event,
    appConfig,
    refundedAmount,
    sourceObjectTotalAmount,
    atobaraiTransactionId,
  }: {
    event: TransactionRefundRequestedEventFragment;
    appConfig: AppChannelConfig;
    refundedAmount: number;
    sourceObjectTotalAmount: number;
    atobaraiTransactionId: AtobaraiTransactionId;
  }): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>>;
  handlePartialRefundWithLineItems({
    event,
    appConfig,
  }: {
    event: TransactionRefundRequestedEventFragment;
    appConfig: AppChannelConfig;
  }): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>>;
}

export class NoFullfillmentRefundHandler implements RefundHandler {
  private readonly apiClient: IAtobaraiApiClient;
  private logger = createLogger("NoFullfillmentRefundHandler");

  constructor(apiClient: IAtobaraiApiClient) {
    this.apiClient = apiClient;
  }

  async handleFullRefund({
    atobaraiTransactionId,
  }: {
    atobaraiTransactionId: AtobaraiTransactionId;
  }): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    const payload = createAtobaraiCancelTransactionPayload({
      atobaraiTransactionId,
    });

    const cancelResult = await this.apiClient.cancelTransaction(payload);

    if (cancelResult.isErr()) {
      this.logger.error("Failed to cancel Atobarai transaction", {
        error: cancelResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (cancelResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai cancel transaction", {
        results: cancelResult.value.results,
      });

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

  private createAtobaraiGoodsForPartialRefundsWithoutLineItems({
    sourceObject,
    useSkuAsName,
    amountAdjusted,
  }: {
    sourceObject: SourceObjectFragment;
    useSkuAsName: boolean;
    amountAdjusted: number;
  }) {
    const productLines = getProductLines({
      lines: sourceObject.lines,
      useSkuAsName,
    });
    const voucherLine = getVoucherLine(sourceObject.discount?.amount);
    const shippingLine = getShippingLine(sourceObject.shippingPrice.gross.amount);
    const discountLine = getDiscountLine(amountAdjusted);

    return AtobaraiGoodsSchema.parse(
      [...productLines, voucherLine, shippingLine, discountLine].filter(Boolean),
    );
  }

  private createAtobaraiGoodsForPartialRefundsWithLineItems({
    sourceObject,
    useSkuAsName,
    grantedRefund,
  }: {
    sourceObject: SourceObjectFragment;
    useSkuAsName: boolean;
    grantedRefund: NonNullable<TransactionRefundRequestedEventFragment["grantedRefund"]>;
  }) {
    const refundedLinesMap = new Map(
      grantedRefund.lines?.map((line) => [line.orderLine.id, line.quantity]),
    );

    const newOrderLines = sourceObject.lines
      .map((line) => {
        const refundedQuantity = refundedLinesMap.get(line.id);

        if (!refundedQuantity) {
          return line;
        }

        return {
          ...line,
          quantity: line.quantity - refundedQuantity,
        };
      })
      .filter((line) => line.quantity > 0) as SourceObjectFragment["lines"];

    const productLines = getProductLines({
      lines: newOrderLines,
      useSkuAsName,
    });
    const voucherLine = getVoucherLine(sourceObject.discount?.amount);
    const shippingLine = getShippingLine(sourceObject.shippingPrice.gross.amount);

    const discountLine = grantedRefund.shippingCostsIncluded
      ? getDiscountLine(sourceObject.shippingPrice.gross.amount)
      : null;

    return AtobaraiGoodsSchema.parse(
      [...productLines, voucherLine, shippingLine, discountLine].filter(Boolean),
    );
  }

  async handlePartialRefundWithoutLineItems({
    event,
    refundedAmount,
    sourceObjectTotalAmount,
    appConfig,
    atobaraiTransactionId,
  }: {
    event: TransactionRefundRequestedEventFragment;
    refundedAmount: number;
    sourceObjectTotalAmount: number;
    appConfig: AppChannelConfig;
    atobaraiTransactionId: AtobaraiTransactionId;
  }): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    if (!event.transaction?.token) {
      this.logger.warn("Transaction token is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Transaction token is required")));
    }

    const sourceObject = event.transaction?.checkout || event.transaction?.order;

    if (!sourceObject) {
      this.logger.warn("Source object is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Source object is required")));
    }

    if (!event.issuedAt) {
      this.logger.warn("Issued at date is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Issued at date is required")));
    }

    const amountAdjusted = sourceObjectTotalAmount - refundedAmount;

    const payload = createAtobaraiChangeTransactionPayload({
      atobaraiTransactionId,
      saleorTransactionToken: createSaleorTransactionToken(event.transaction?.token),
      atobaraiMoney: createAtobaraiMoney({
        amount: amountAdjusted,
        currency: event.action.currency,
      }),
      atobaraiCustomer: createAtobaraiCustomer({ sourceObject }),
      atobaraiDeliveryDestination: createAtobaraiDeliveryDestination({ sourceObject }),
      atobaraiGoods: this.createAtobaraiGoodsForPartialRefundsWithoutLineItems({
        sourceObject,
        useSkuAsName: appConfig.skuAsName,
        amountAdjusted,
      }),
      atobaraiShopOrderDate: createAtobaraiShopOrderDate(event.issuedAt),
    });

    const changeTransactionResult = await this.apiClient.changeTransaction(payload);

    if (changeTransactionResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (changeTransactionResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai change transaction", {
        results: changeTransactionResult.value.results,
      });

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

  async handlePartialRefundWithLineItems({
    event,
    appConfig,
    refundedAmount,
    sourceObjectTotalAmount,
    atobaraiTransactionId,
  }: {
    event: TransactionRefundRequestedEventFragment;
    appConfig: AppChannelConfig;
    refundedAmount: number;
    sourceObjectTotalAmount: number;
    atobaraiTransactionId: AtobaraiTransactionId;
  }): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    if (!event.transaction?.token) {
      this.logger.warn("Transaction token is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Transaction token is required")));
    }

    const sourceObject = event.transaction?.checkout || event.transaction?.order;

    if (!sourceObject) {
      this.logger.warn("Source object is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Source object is required")));
    }

    if (!event.issuedAt) {
      this.logger.warn("Issued at date is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Issued at date is required")));
    }

    if (!event.grantedRefund) {
      this.logger.warn("Granted refund is missing in the event");

      return err(new MalformedRequestResponse(new BaseError("Granted refund is required")));
    }

    const amountAdjusted = sourceObjectTotalAmount - refundedAmount;

    const payload = createAtobaraiChangeTransactionPayload({
      atobaraiTransactionId,
      saleorTransactionToken: createSaleorTransactionToken(event.transaction?.token),
      atobaraiMoney: createAtobaraiMoney({
        amount: amountAdjusted,
        currency: event.action.currency,
      }),
      atobaraiCustomer: createAtobaraiCustomer({ sourceObject }),
      atobaraiDeliveryDestination: createAtobaraiDeliveryDestination({ sourceObject }),
      atobaraiGoods: this.createAtobaraiGoodsForPartialRefundsWithLineItems({
        sourceObject,
        useSkuAsName: appConfig.skuAsName,
        grantedRefund: event.grantedRefund,
      }),
      atobaraiShopOrderDate: createAtobaraiShopOrderDate(event.issuedAt),
    });

    const changeTransactionResult = await this.apiClient.changeTransaction(payload);

    if (changeTransactionResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (changeTransactionResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai change transaction", {
        results: changeTransactionResult.value.results,
      });

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
}
