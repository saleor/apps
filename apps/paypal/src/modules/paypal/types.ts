import { Result } from "neverthrow";

import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalMerchantId } from "./paypal-merchant-id";
import { PayPalEnv } from "./paypal-env";
import { PayPalMoney } from "./paypal-money";
import { PayPalOrderId } from "./paypal-order-id";

/**
 * PayPal Order Item
 * Represents a line item in a PayPal order
 */
export interface PayPalOrderItem {
  name: string; // Item name (max 127 chars)
  quantity: string; // Item quantity
  unit_amount: PayPalMoney; // Item unit price
  description?: string; // Item description (max 127 chars)
  sku?: string; // Stock keeping unit
  category?: "DIGITAL_GOODS" | "PHYSICAL_GOODS" | "DONATION"; // Item category
  image_url?: string; // Item image URL (max 2048 chars)
}

export interface PayPalOrder {
  id: PayPalOrderId;
  status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED";
  purchase_units: Array<{
    amount: PayPalMoney;
    items?: PayPalOrderItem[];
    payment_instruction?: {
      platform_fees?: Array<{
        amount: PayPalMoney;
        payee: {
          merchant_id: string;
        };
      }>;
    };
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
    payeeMerchantId?: string;
    metadata?: Record<string, string>;
    items?: PayPalOrderItem[];
    amountBreakdown?: {
      itemTotal?: number;
      shipping?: number;
      taxTotal?: number;
    };
    platformFees?: Array<{
      amount: PayPalMoney;
      payee?: {
        merchant_id: string;
      };
    }>;
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
    partnerMerchantId?: string | null;
    merchantId?: PayPalMerchantId | null;
    merchantEmail?: string | null;
    bnCode?: string | null;
    env: PayPalEnv;
  }): IPayPalOrdersApi;
}

export interface IPayPalRefundsApiFactory {
  create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    merchantId?: PayPalMerchantId | null;
    merchantEmail?: string | null;
    bnCode?: string | null;
    env: PayPalEnv;
  }): IPayPalRefundsApi;
}
