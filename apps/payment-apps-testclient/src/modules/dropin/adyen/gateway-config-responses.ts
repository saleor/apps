import { type z } from "zod";

import { createLogger } from "@/lib/logger";

import type {
  GiftCardBalanceResponseSchema,
  InitalizePaymentGatewaySchemaType,
  OrderCancelResponseSchema,
  OrderCreateResponseSchema,
} from "../schemas/initalize-payment-gateway";

const logger = createLogger("AdyenGatewayConfigResponse");

export class AdyenGiftCardBalanceResponse {
  private constructor(private response: z.infer<typeof GiftCardBalanceResponseSchema>) {}

  static createFromInitializePaymentGateway(data: InitalizePaymentGatewaySchemaType) {
    if (data.paymentGatewayInitialize.gatewayConfigs.length > 1) {
      logger.warn(
        "More than one gateway config found - initializing AdyenGiftCardBalanceResponse with the",
      );
    }

    return new AdyenGiftCardBalanceResponse(
      data.paymentGatewayInitialize.gatewayConfigs[0]?.data.giftCardBalanceResponse,
    );
  }

  getResponse() {
    return this.response;
  }
}

export class AdyenOrderCreateResponse {
  private constructor(private response: z.infer<typeof OrderCreateResponseSchema>) {}

  static createFromInitializePaymentGateway(data: InitalizePaymentGatewaySchemaType) {
    if (data.paymentGatewayInitialize.gatewayConfigs.length > 1) {
      logger.warn(
        "More than one gateway config found - initializing AdyenOrderCreateResponse with the first one",
      );
    }

    return new AdyenOrderCreateResponse(
      data.paymentGatewayInitialize.gatewayConfigs[0]?.data.orderCreateResponse,
    );
  }

  getResponse() {
    return this.response;
  }
}

export class AdyenOrderCancelledResponse {
  private constructor(private response: z.infer<typeof OrderCancelResponseSchema>) {}

  static createFromInitializePaymentGateway(data: InitalizePaymentGatewaySchemaType) {
    if (data.paymentGatewayInitialize.gatewayConfigs.length > 1) {
      logger.warn(
        "More than one gateway config found - initializing AdyenOrderCancelledResponse with the first one",
      );
    }

    return new AdyenOrderCancelledResponse(
      data.paymentGatewayInitialize.gatewayConfigs[0]?.data.orderCancelResponse,
    );
  }

  isOrderNotCancelled() {
    return !this.response || this.response.resultCode !== "Received";
  }
}
