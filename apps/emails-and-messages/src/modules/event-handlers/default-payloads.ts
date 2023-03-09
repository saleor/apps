import { MessageEventTypes } from "./message-event-types";
import {
  OrderDetailsFragment,
  OrderCreatedWebhookPayloadFragment,
  OrderConfirmedWebhookPayloadFragment,
  OrderCancelledWebhookPayloadFragment,
  OrderFulfilledWebhookPayloadFragment,
  OrderFullyPaidWebhookPayloadFragment,
  InvoiceSentWebhookPayloadFragment,
} from "../../../generated/graphql";

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

export const examplePayloads: Record<MessageEventTypes, any> = {
  ORDER_CREATED: orderCreatedPayload,
  ORDER_CONFIRMED: orderConfirmedPayload,
  ORDER_CANCELLED: orderCancelledPayload,
  ORDER_FULFILLED: orderFulfilledPayload,
  ORDER_FULLY_PAID: orderFullyPaidPayload,
  INVOICE_SENT: invoiceSentPayload,
};
