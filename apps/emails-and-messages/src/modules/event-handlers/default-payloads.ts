import { MessageEventTypes } from "./message-event-types";
import {
  OrderDetailsFragment,
  OrderCreatedWebhookPayloadFragment,
  OrderConfirmedWebhookPayloadFragment,
  OrderCancelledWebhookPayloadFragment,
  OrderFulfilledWebhookPayloadFragment,
  OrderFullyPaidWebhookPayloadFragment,
  InvoiceSentWebhookPayloadFragment,
  GiftCardSentWebhookPayloadFragment,
} from "../../../generated/graphql";
import { NotifyEventPayload } from "../../pages/api/webhooks/notify";

const exampleOrderPayload: OrderDetailsFragment = {
  id: "T3JkZXI6NTdiNTBhNDAtYzRmYi00YjQzLWIxODgtM2JhZmRlMTc3MGQ5",
  number: "198",
  userEmail: "adrian.king@example.com",
  channel: {
    slug: "default-channel",
  },
  user: {
    email: "adrian.king@example.com",
    firstName: "Adrian",
    lastName: "King",
  },
  billingAddress: {
    streetAddress1: "59314 Mary Well Suite 281",
    city: "METROPOLIS",
    postalCode: "71653",
    country: {
      country: "United States of America",
    },
  },
  shippingAddress: {
    streetAddress1: "59314 Mary Well Suite 281",
    city: "METROPOLIS",
    postalCode: "71653",
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
      },
      totalPrice: {
        gross: {
          currency: "USD",
          amount: 5,
        },
      },
    },
    {
      id: "T3JkZXJMaW5lOjVhYmEzMTBkLTZkMzEtNDNlNy1hZjAyLTdlNGUwM2UzYmI4ZA==",
      productName: "Code Division T-shirt",
      variantName: "L",
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
      },
      totalPrice: {
        gross: {
          currency: "USD",
          amount: 5,
        },
      },
    },
  ],
  subtotal: {
    gross: {
      amount: 10,
      currency: "USD",
    },
  },
  shippingPrice: {
    gross: {
      amount: 61.62,
      currency: "USD",
    },
  },
  total: {
    gross: {
      amount: 71.62,
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

const invoiceSentPayload: InvoiceSentWebhookPayloadFragment = {
  invoice: {
    id: "SW52b2ljZToxMDE=",
    message: null,
    externalUrl: null,
    url: "https://example.com/media/invoices/invoice-1032023-order-57b50a40-c4fb-4b43-b188-3bafde1770d9-fa968541-02fa-4317-b121-7205.pdf",
    order: {
      id: "T3JkZXI6NTdiNTBhNDAtYzRmYi00YjQzLWIxODgtM2JhZmRlMTc3MGQ5",
    },
  },
  order: exampleOrderPayload,
};

const accountConfirmationPayload: NotifyEventPayload = {
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

const accountPasswordResetPayload: NotifyEventPayload = {
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

const accountChangeEmailRequestPayload: NotifyEventPayload = {
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
  redirect_url:
    "http://example.com?email=user%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "demo.saleor.cloud",
  site_name: "Saleor e-commerce",
  logo_url: "",
};

const accountChangeEmailConfirmPayload: NotifyEventPayload = {
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
  channel_slug: "default-channel",
  domain: "demo.saleor.cloud",
  site_name: "Saleor e-commerce",
  logo_url: "",
};

const accountDeletePayload: NotifyEventPayload = {
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

// TODO: UPDATE WITH BETTER DATA
const giftCardSentPayload: GiftCardSentWebhookPayloadFragment = {
  channel: "default_channel",
  sentToEmail: "user@example.com",
  giftCard: {
    code: "XXXX",
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
  ORDER_CREATED: orderCreatedPayload,
  ORDER_CONFIRMED: orderConfirmedPayload,
  ORDER_CANCELLED: orderCancelledPayload,
  ORDER_FULFILLED: orderFulfilledPayload,
  ORDER_FULLY_PAID: orderFullyPaidPayload,
  INVOICE_SENT: invoiceSentPayload,
  GIFT_CARD_SENT: giftCardSentPayload,
  ACCOUNT_CONFIRMATION: accountConfirmationPayload,
  ACCOUNT_PASSWORD_RESET: accountPasswordResetPayload,
  ACCOUNT_CHANGE_EMAIL_REQUEST: accountChangeEmailRequestPayload,
  ACCOUNT_CHANGE_EMAIL_CONFIRM: accountChangeEmailConfirmPayload,
  ACCOUNT_DELETE: accountDeletePayload,
};
