import {
  type SaleorCheckoutContact,
  type SquareStoreCardVerificationDetails,
} from "./store-card-verification-details";

export type SquareTokenizedPaymentMethod =
  | "card"
  | "gift-card"
  | "apple-pay"
  | "cash-app-pay"
  | "afterpay-clearpay";

export type SquareTokenResult = {
  status: "OK" | string;
  token?: string;
  errors?: Array<{ message?: string; detail?: string }>;
};

type SquareBillingContact = SquareStoreCardVerificationDetails["billingContact"];

export type SquareChargeVerificationDetails = {
  amount: string;
  currencyCode: string;
  intent: "CHARGE";
  customerInitiated: true;
  sellerKeyedIn: false;
  billingContact: SquareBillingContact;
};

export type SquarePaymentRequest = {
  destroy?(): Promise<boolean>;
};

type SquarePaymentRequestMethod = Exclude<SquareTokenizedPaymentMethod, "card" | "gift-card">;

type SquarePaymentRequestOptions = {
  countryCode: string;
  currencyCode: string;
  total: {
    amount: string;
    label: string;
  };
  requestShippingContact?: boolean;
};

export type SquareCard = {
  attach(selector: string): Promise<void>;
  tokenize(
    verificationDetails?: SquareChargeVerificationDetails | SquareStoreCardVerificationDetails,
  ): Promise<SquareTokenResult>;
  destroy?(): Promise<boolean>;
};

export type SquareApplePay = {
  tokenize(): Promise<SquareTokenResult>;
  destroy?(): Promise<boolean>;
};

export type SquareGiftCard = {
  attach(selector: string): Promise<void>;
  tokenize(): Promise<SquareTokenResult>;
  destroy?(): Promise<boolean>;
};

export type SquareCashAppPay = {
  attach(selector: string): Promise<void>;
  addEventListener(
    event: "customerInteraction",
    listener: (event: { detail: { isMobile: boolean } }) => void,
  ): void;
  addEventListener(event: "customerDismissed", listener: () => void): void;
  addEventListener(
    event: "ontokenization",
    listener: (event: {
      detail: {
        tokenResult?: SquareTokenResult;
        error?: unknown;
      };
    }) => void,
  ): void;
  destroy?(): Promise<boolean>;
};

export type SquareAfterpayClearpay = {
  attach(selector: string): Promise<void>;
  tokenize(): Promise<SquareTokenResult>;
  destroy?(): Promise<boolean>;
};

export type InitializedSquareMethod =
  | { method: "card"; instance: SquareCard }
  | { method: "gift-card"; instance: SquareGiftCard }
  | { method: "apple-pay"; instance: SquareApplePay }
  | { method: "cash-app-pay"; instance: SquareCashAppPay }
  | { method: "afterpay-clearpay"; instance: SquareAfterpayClearpay };

export type SquarePayments = {
  paymentRequest(options: SquarePaymentRequestOptions): SquarePaymentRequest;
  card(): Promise<SquareCard>;
  giftCard(): Promise<SquareGiftCard>;
  applePay(paymentRequest: SquarePaymentRequest): Promise<SquareApplePay>;
  cashAppPay(
    paymentRequest: SquarePaymentRequest,
    options: {
      redirectURL: string;
      referenceId: string;
    },
  ): Promise<SquareCashAppPay>;
  afterpayClearpay(paymentRequest: SquarePaymentRequest): Promise<SquareAfterpayClearpay>;
  verifyBuyer(
    sourceId: string,
    verificationDetails: SquareChargeVerificationDetails,
  ): Promise<{ token?: string } | null>;
};

export const createSquarePaymentRequest = ({
  payments,
  method,
  countryCode,
  currencyCode,
  amount,
}: {
  payments: SquarePayments;
  method: SquarePaymentRequestMethod;
  countryCode: string;
  currencyCode: string;
  amount: number;
}) => {
  const options: SquarePaymentRequestOptions = {
    countryCode,
    currencyCode,
    total: {
      amount: amount.toFixed(2),
      label: "Total",
    },
  };

  if (method === "afterpay-clearpay") {
    options.requestShippingContact = false;
  }

  return payments.paymentRequest(options);
};

declare global {
  interface Window {
    Square?: {
      payments(applicationId: string, locationId: string): SquarePayments;
    };
  }
}

const normalize = (value: string | null | undefined) => value?.trim() || undefined;

export const createSquareChargeVerificationDetails = ({
  amount,
  currency,
  contact,
}: {
  amount: number;
  currency: string;
  contact: SaleorCheckoutContact;
}): SquareChargeVerificationDetails => {
  const addressLines = [
    normalize(contact.billingAddress?.streetAddress1),
    normalize(contact.billingAddress?.streetAddress2),
  ].filter((line): line is string => Boolean(line));

  return {
    amount: amount.toFixed(2),
    currencyCode: currency,
    intent: "CHARGE",
    customerInitiated: true,
    sellerKeyedIn: false,
    billingContact: {
      givenName: normalize(contact.billingAddress?.firstName),
      familyName: normalize(contact.billingAddress?.lastName),
      email: normalize(contact.email),
      phone: normalize(contact.billingAddress?.phone),
      addressLines: addressLines.length > 0 ? addressLines : undefined,
      city: normalize(contact.billingAddress?.city),
      state: normalize(contact.billingAddress?.countryArea),
      countryCode: normalize(contact.billingAddress?.country?.code),
      postalCode: normalize(contact.billingAddress?.postalCode),
    },
  };
};

export const findInitializedSquareMethod = <Method extends SquareTokenizedPaymentMethod>(
  methods: InitializedSquareMethod[],
  method: Method,
): Extract<InitializedSquareMethod, { method: Method }> | undefined =>
  methods.find(
    (candidate): candidate is Extract<InitializedSquareMethod, { method: Method }> =>
      candidate.method === method,
  );

export const getSquareTokenizeErrorMessage = (result: SquareTokenResult) =>
  result.errors?.[0]?.message ??
  result.errors?.[0]?.detail ??
  "Square payment authorization failed.";
