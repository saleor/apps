import { MessageEventTypes } from "./message-event-types";
import {
  GiftCardSentWebhookPayloadFragment,
  InvoiceSentWebhookPayloadFragment,
  LanguageCodeEnum,
  OrderCancelledWebhookPayloadFragment,
  OrderConfirmedWebhookPayloadFragment,
  OrderCreatedWebhookPayloadFragment,
  OrderDetailsFragment,
  OrderFulfilledWebhookPayloadFragment,
  OrderFullyPaidWebhookPayloadFragment,
  OrderRefundedWebhookPayloadFragment,
  OrderStatus,
} from "../../../generated/graphql";
import {
  NotifyPayloadAccountChangeEmailRequest,
  NotifyPayloadAccountConfirmation,
  NotifyPayloadAccountDelete,
  NotifyPayloadAccountPasswordReset,
  NotifyPayloadFulfillmentUpdate,
} from "../../lib/notify-event-types";

const exampleOrderPayload: OrderDetailsFragment = {
  id: "T3JkZXI6NTdiNTBhNDAtYzRmYi00YjQzLWIxODgtM2JhZmRlMTc3MGQ5",
  number: "198",
  status: OrderStatus.Unfulfilled,
  languageCodeEnum: LanguageCodeEnum.En,
  created: "",
  displayGrossPrices: true,
  isShippingRequired: true,
  userEmail: "adrian.king@example.com",
  metadata: [
    {
      key: "metadata-example",
      value: "Example value",
    },
  ],
  privateMetadata: [
    {
      key: "private-metadata-example",
      value: "Example value for private metadata",
    },
  ],
  channel: {
    slug: "default-channel",
  },
  user: {
    email: "adrian.king@example.com",
    firstName: "Adrian",
    lastName: "King",
    languageCode: LanguageCodeEnum.En,
  },
  billingAddress: {
    firstName: "Adrian",
    lastName: "King",
    streetAddress1: "59314 Mary Well Suite 281",
    streetAddress2: "",
    companyName: "",
    cityArea: "",
    city: "METROPOLIS",
    postalCode: "71653",
    countryArea: "PL",
    country: {
      country: "United States of America",
    },
  },
  shippingAddress: {
    firstName: "Adrian",
    lastName: "King",
    streetAddress1: "59314 Mary Well Suite 281",
    streetAddress2: "",
    companyName: "",
    cityArea: "",
    city: "METROPOLIS",
    postalCode: "71653",
    countryArea: "PL",
    country: {
      country: "United States of America",
    },
  },
  lines: [
    {
      id: "T3JkZXJMaW5lOjNkNjc4OWE3LWUyNWItNDBlMi1iNjk2LTdmMzA0ZWFjOWI2OQ==",
      productName: "Black Hoodie",
      variantName: "XL",
      quantity: 1,
      thumbnail: {
        url: "https://placehold.jp/150x150.png",
        alt: "",
      },
      unitPrice: {
        gross: {
          currency: "USD",
          amount: 5,
        },
        net: {
          currency: "USD",
          amount: 4,
        },
        tax: {
          currency: "USD",
          amount: 1,
        },
      },
      totalPrice: {
        gross: {
          currency: "USD",
          amount: 5,
        },
        net: {
          currency: "USD",
          amount: 4,
        },
        tax: {
          currency: "USD",
          amount: 1,
        },
      },
      isShippingRequired: true,
      translatedProductName: "Black Hoodie",
      translatedVariantName: "XL",
      quantityFulfilled: 0,
      taxRate: 10,
      unitDiscountValue: 0,
      unitDiscount: {
        amount: 0,
        currency: "USD",
      },
      undiscountedUnitPrice: {
        gross: {
          currency: "USD",
          amount: 5,
        },
        net: {
          currency: "USD",
          amount: 4,
        },
        tax: {
          currency: "USD",
          amount: 1,
        },
      },
      metadata: [],
      privateMetadata: [],
    },
  ],
  subtotal: {
    gross: {
      amount: 5,
      currency: "USD",
    },
    net: {
      amount: 4,
      currency: "USD",
    },
    tax: {
      amount: 1,
      currency: "USD",
    },
  },
  shippingPrice: {
    gross: {
      amount: 10,
      currency: "USD",
    },
    net: {
      amount: 8,
      currency: "USD",
    },
    tax: {
      amount: 2,
      currency: "USD",
    },
  },
  undiscountedTotal: {
    gross: {
      amount: 15,
      currency: "USD",
    },
    net: {
      amount: 12,
      currency: "USD",
    },
    tax: {
      amount: 3,
      currency: "USD",
    },
  },
  total: {
    gross: {
      amount: 15,
      currency: "USD",
    },
    net: {
      amount: 12,
      currency: "USD",
    },
    tax: {
      amount: 3,
      currency: "USD",
    },
  },
};

const orderCreatedPayload: OrderCreatedWebhookPayloadFragment = {
  order: exampleOrderPayload,
};

const orderConfirmedPayload: OrderConfirmedWebhookPayloadFragment = {
  order: exampleOrderPayload,
};

const orderCancelledPayload: OrderCancelledWebhookPayloadFragment = {
  order: exampleOrderPayload,
};

const orderFulfilledPayload: OrderFulfilledWebhookPayloadFragment = {
  order: exampleOrderPayload,
};

const orderFullyPaidPayload: OrderFullyPaidWebhookPayloadFragment = {
  order: exampleOrderPayload,
};

const orderRefundedPayload: OrderRefundedWebhookPayloadFragment = {
  order: exampleOrderPayload,
};

const invoiceSentPayload: InvoiceSentWebhookPayloadFragment = {
  invoice: {
    id: "SW52b2ljZToxMDE=",
    metadata: [
      {
        key: "metadata-example",
        value: "Example value",
      },
    ],
    privateMetadata: [
      {
        key: "private-metadata-example",
        value: "Example value for private metadata",
      },
    ],
    message: null,
    externalUrl: null,
    url: "https://example.com/media/invoices/invoice-1032023-order-57b50a40-c4fb-4b43-b188-3bafde1770d9-fa968541-02fa-4317-b121-7205.pdf",
    order: {
      id: "T3JkZXI6NTdiNTBhNDAtYzRmYi00YjQzLWIxODgtM2JhZmRlMTc3MGQ5",
    },
  },
  order: exampleOrderPayload,
};

const accountConfirmationPayload: NotifyPayloadAccountConfirmation = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    is_staff: false,
    is_active: false,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "user@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  confirm_url:
    "http://example.com?email=user%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "demo.saleor.cloud",
  site_name: "Saleor e-commerce",
  logo_url: "",
};

const accountPasswordResetPayload: NotifyPayloadAccountPasswordReset = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    is_staff: false,
    is_active: false,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "user@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  reset_url:
    "http://example.com?email=user%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "demo.saleor.cloud",
  site_name: "Saleor e-commerce",
  logo_url: "",
};

const accountChangeEmailRequestPayload: NotifyPayloadAccountChangeEmailRequest = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    is_staff: false,
    is_active: false,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "user@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  old_email: "test@example.com1",
  new_email: "new.email@example.com1",
  reset_url:
    "http://example.com/reset?email=user%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "demo.saleor.cloud",
  site_name: "Saleor e-commerce",
  logo_url: "",
};

const accountChangeEmailConfirmPayload: NotifyPayloadAccountChangeEmailRequest = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    is_staff: false,
    is_active: false,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "user@example.com",
  old_email: "old@example.com",
  new_email: "new@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  reset_url:
    "http://example.com/reset?email=user%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "demo.saleor.cloud",
  site_name: "Saleor e-commerce",
  logo_url: "",
};

const accountDeletePayload: NotifyPayloadAccountDelete = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    is_staff: false,
    is_active: false,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "user@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  delete_url:
    "http://example.com?email=user%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "demo.saleor.cloud",
  site_name: "Saleor e-commerce",
  logo_url: "",
};

const orderLineMonospaceTeePayloadFragment: NotifyPayloadFulfillmentUpdate["order"]["lines"][0] = {
  id: "T3JkZXJMaW5lOjIwMDg4MmMzLWU3NjItNGE0NS05ZjUxLTUyZDAxYTE2ODZjOQ==",
  product: {
    id: "UHJvZHVjdDoxMzQ=",
    attributes: [
      {
        assignment: {
          attribute: {
            slug: "material",
            name: "Material",
          },
        },
        values: [
          {
            name: "Cotton",
            value: "",
            slug: "cotton",
            file_url: null,
          },
        ],
      },
    ],
    weight: "",
    first_image: {
      original: {
        "32": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/32/",
        "64": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/64/",
        "128": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/128/",
        "256": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/256/",
        "512": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/512/",
        "1024": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/1024/",
        "2048": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/2048/",
        "4096": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/4096/",
      },
    },
    images: [
      {
        original: {
          "32": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE4/32/",
          "64": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE4/64/",
          "128": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE4/128/",
          "256": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE4/256/",
          "512": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE4/512/",
          "1024": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE4/1024/",
          "2048": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE4/2048/",
          "4096": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE4/4096/",
        },
      },
    ],
  },
  product_name: "Monospace Tee",
  translated_product_name: "Monospace Tee",
  variant_name: "S",
  variant: {
    id: "UHJvZHVjdFZhcmlhbnQ6MzQ4",
    weight: "",
    is_preorder: false,
    preorder_end_date: null,
    first_image: {
      original: {
        "32": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/32/",
        "64": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/64/",
        "128": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/128/",
        "256": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/256/",
        "512": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/512/",
        "1024": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/1024/",
        "2048": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/2048/",
        "4096": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/4096/",
      },
    },
    images: [
      {
        original: {
          "32": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/32/",
          "64": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/64/",
          "128": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/128/",
          "256": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/256/",
          "512": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/512/",
          "1024": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/1024/",
          "2048": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/2048/",
          "4096": "https://example.eu.saleor.cloud/thumbnail/UHJvZHVjdE1lZGlhOjE3/4096/",
        },
      },
    ],
  },
  translated_variant_name: "S",
  product_sku: "328223580",
  product_variant_id: "UHJvZHVjdFZhcmlhbnQ6MzQ4",
  quantity: 1,
  quantity_fulfilled: 1,
  currency: "PLN",
  unit_price_net_amount: "90.00",
  unit_price_gross_amount: "90.00",
  unit_tax_amount: "0.00",
  total_gross_amount: "90.00",
  total_net_amount: "90.00",
  total_tax_amount: "0.00",
  tax_rate: "0.0000",
  is_shipping_required: true,
  is_digital: false,
  digital_url: null,
  unit_discount_value: "0.000",
  unit_discount_reason: null,
  unit_discount_type: "fixed",
  unit_discount_amount: "0.000",
  metadata: {},
};

const addressPayloadFragment: NotifyPayloadFulfillmentUpdate["order"]["billing_address"] = {
  first_name: "Caitlin",
  last_name: "Johnson",
  company_name: "",
  street_address_1: "8518 Pamela Track Apt. 164",
  street_address_2: "",
  city: "APRILSHIRE",
  city_area: "",
  postal_code: "28290",
  country: "US",
  country_area: "NC",
  phone: "",
};

const orderPayloadFragment: NotifyPayloadFulfillmentUpdate["order"] = {
  private_metadata: {},
  metadata: {},
  status: "fulfilled",
  language_code: "en",
  currency: "PLN",
  total_net_amount: "468.68",
  undiscounted_total_net_amount: "468.68",
  total_gross_amount: "468.68",
  undiscounted_total_gross_amount: "468.68",
  display_gross_prices: true,
  id: "T3JkZXI6MzU4YzcxNTktZmZlYy00ODI3LWI2MzYtYTNmYTEwMTA2MTI5",
  token: "358c7159-ffec-4827-b636-a3fa10106129",
  number: 231,
  channel_slug: "channel-pln",
  created: "2023-07-13 10:54:32.527314+00:00",
  shipping_price_net_amount: "18.680",
  shipping_price_gross_amount: "18.680",
  order_details_url: "",
  email: "caitlin.johnson@example.com",
  subtotal_gross_amount: "450.00",
  subtotal_net_amount: "450.00",
  tax_amount: "0.00",
  lines: [orderLineMonospaceTeePayloadFragment],
  billing_address: addressPayloadFragment,
  shipping_address: addressPayloadFragment,
  shipping_method_name: "FedEx",
  collection_point_name: null,
  voucher_discount: null,
  discount_amount: 0,
};

const fulfillmentPayloadFragment = {
  is_tracking_number_url: false,
  tracking_number: "1111-1111-1111-1111",
};

const fulfillmentUpdatePayload: NotifyPayloadFulfillmentUpdate = {
  fulfillment: fulfillmentPayloadFragment,
  order: orderPayloadFragment,
  physical_lines: [
    {
      id: "XXXXXXXX",
      order_line: orderLineMonospaceTeePayloadFragment,
      quantity: 1,
    },
  ],
  digital_lines: [],
  recipient_email: "user@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "demo.saleor.cloud",
  site_name: "Saleor e-commerce",
  logo_url: "",
};

// TODO: UPDATE WITH BETTER DATA
const giftCardSentPayload: GiftCardSentWebhookPayloadFragment = {
  channel: "default_channel",
  sentToEmail: "user@example.com",
  giftCard: {
    code: "XXXX",
    metadata: [
      {
        key: "metadata-example",
        value: "Example value",
      },
    ],
    privateMetadata: [
      {
        key: "private-metadata-example",
        value: "Example value for private metadata",
      },
    ],
    tags: [],
    created: "2021-03-16T13:12:00+00:00",
    currentBalance: {
      amount: 100,
      currency: "USD",
    },
    id: "R2lmdENhcmQ6MjI=",
    initialBalance: {
      amount: 100,
      currency: "USD",
    },
    isActive: true,
    lastUsedOn: null,
    displayCode: "XXXX-XXXX-XXXX-XXXX",
    last4CodeChars: "XXXX",
    expiryDate: "2021-03-16T13:12:00+00:00",
    usedByEmail: null,
    usedBy: null,
  },
};

export const examplePayloads: Record<MessageEventTypes, any> = {
  ACCOUNT_CHANGE_EMAIL_CONFIRM: accountChangeEmailConfirmPayload,
  ACCOUNT_CHANGE_EMAIL_REQUEST: accountChangeEmailRequestPayload,
  ACCOUNT_CONFIRMATION: accountConfirmationPayload,
  ACCOUNT_DELETE: accountDeletePayload,
  ACCOUNT_PASSWORD_RESET: accountPasswordResetPayload,
  GIFT_CARD_SENT: giftCardSentPayload,
  INVOICE_SENT: invoiceSentPayload,
  ORDER_CANCELLED: orderCancelledPayload,
  ORDER_CONFIRMED: orderConfirmedPayload,
  ORDER_CREATED: orderCreatedPayload,
  ORDER_FULFILLED: orderFulfilledPayload,
  ORDER_FULLY_PAID: orderFullyPaidPayload,
  ORDER_FULFILLMENT_UPDATE: fulfillmentUpdatePayload,
  ORDER_REFUNDED: orderRefundedPayload,
};
