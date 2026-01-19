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
  payment_source?: {
    paypal?: {
      email_address?: string;
      account_id?: string;
      account_status?: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
      phone_type?: string;
      phone_number?: {
        national_number?: string;
      };
      address?: any;
    };
    venmo?: {
      email_address?: string;
      account_id?: string;
      user_name?: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
      phone_number?: {
        national_number?: string;
      };
      address?: any;
    };
    card?: {
      name?: string;
      last_digits?: string;
      brand?: string;
      available_networks?: string[];
      type?: string;
      authentication_result?: any;
      attributes?: any;
      from_request?: any;
      expiry?: string;
      billing_address?: any;
    };
  };
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
    softDescriptor?: string;
    payer?: {
      email_address?: string;
      phone?: {
        phone_type?: "FAX" | "HOME" | "MOBILE" | "OTHER" | "PAGER";
        phone_number?: {
          national_number: string;
        };
      };
      name?: {
        given_name?: string;
        surname?: string;
      };
    };
    shipping?: {
      name?: {
        full_name?: string;
      };
      address?: {
        address_line_1?: string;
        address_line_2?: string;
        admin_area_2?: string;
        admin_area_1?: string;
        postal_code?: string;
        country_code?: string;
      };
      email_address?: string;
      phone_number?: {
        national_number?: string;
      };
    };
    experienceContext?: {
      brand_name?: string;
      locale?: string;
      landing_page?: "LOGIN" | "BILLING" | "NO_PREFERENCE";
      shipping_preference?: "GET_FROM_FILE" | "NO_SHIPPING" | "SET_PROVIDED_ADDRESS";
      user_action?: "CONTINUE" | "PAY_NOW";
      return_url?: string;
      cancel_url?: string;
    };
    paymentSource?: {
      paypal?: {
        experience_context?: {
          payment_method_preference?: "IMMEDIATE_PAYMENT_REQUIRED" | "UNRESTRICTED";
          brand_name?: string;
          locale?: string;
          landing_page?: "LOGIN" | "BILLING" | "NO_PREFERENCE";
          shipping_preference?: "GET_FROM_FILE" | "NO_SHIPPING" | "SET_PROVIDED_ADDRESS";
          user_action?: "CONTINUE" | "PAY_NOW";
          return_url?: string;
          cancel_url?: string;
          app_switch_preference?: boolean;
          callback_configuration?: {
            callback_url: string;
            callback_events?: Array<
              | "SHIPPING_CHANGE"
              | "SHIPPING_OPTIONS_CHANGE"
              | "BILLING_ADDRESS_CHANGE"
              | "PHONE_NUMBER_CHANGE"
            >;
          };
        };
        vault_id?: string;
      };
      card?: {
        vault_id?: string;
      };
      venmo?: {
        experience_context?: {
          brand_name?: string;
          shipping_preference?: "GET_FROM_FILE" | "NO_SHIPPING" | "SET_PROVIDED_ADDRESS";
        };
        vault_id?: string;
      };
    };
  }): Promise<Result<PayPalOrder, unknown>>;

  captureOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>>;

  authorizeOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>>;

  getOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>>;

  patchOrder(args: {
    orderId: PayPalOrderId;
    operations: Array<{
      op: "add" | "replace" | "remove";
      path: string;
      value?: any;
      from?: string;
    }>;
  }): Promise<Result<void, unknown>>;
}

export interface IPayPalRefundsApi {
  refundCapture(args: {
    captureId: string;
    amount?: PayPalMoney;
    metadata?: Record<string, string>;
    requestId?: string;
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
