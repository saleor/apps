import { Result } from "neverthrow";

import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalEnv } from "./paypal-env";
import { PayPalMoney } from "./paypal-money";
import { PayPalOrderId } from "./paypal-order-id";

export interface PayPalOrder {
  id: PayPalOrderId;
  status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED";
  purchase_units: Array<{
    amount: PayPalMoney;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: PayPalMoney;
      }>;
      authorizations?: Array<{
        id: string;
        status: string;
        amount: PayPalMoney;
      }>;
    };
  }>;
}

export interface PayPalRefund {
  id: string;
  status: "COMPLETED" | "CANCELLED" | "PENDING";
  amount: PayPalMoney;
}

export interface IPayPalOrdersApi {
  createOrder(args: {
    amount: PayPalMoney;
    intent: "CAPTURE" | "AUTHORIZE";
    metadata?: Record<string, string>;
  }): Promise<Result<PayPalOrder, unknown>>;

  captureOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>>;

  authorizeOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>>;

  getOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>>;
}

export interface IPayPalRefundsApi {
  refundCapture(args: {
    captureId: string;
    amount?: PayPalMoney;
    metadata?: Record<string, string>;
  }): Promise<Result<PayPalRefund, unknown>>;
}

export interface IPayPalOrdersApiFactory {
  create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    env: PayPalEnv;
  }): IPayPalOrdersApi;
}

export interface IPayPalRefundsApiFactory {
  create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    env: PayPalEnv;
  }): IPayPalRefundsApi;
}
