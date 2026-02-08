import {
  GiftCardSentWebhookPayloadFragment,
  InvoiceSentWebhookPayloadFragment,
  OrderCancelledWebhookPayloadFragment,
  OrderConfirmedWebhookPayloadFragment,
  OrderCreatedWebhookPayloadFragment,
  OrderDetailsFragment,
  OrderFulfilledWebhookPayloadFragment,
  OrderFullyPaidWebhookPayloadFragment,
  OrderRefundedWebhookPayloadFragment,
} from "../../../generated/graphql";
import {
  NotifyPayloadAccountChangeEmailConfirmation,
  NotifyPayloadAccountChangeEmailRequest,
  NotifyPayloadAccountConfirmation,
  NotifyPayloadAccountDelete,
  NotifyPayloadAccountPasswordReset,
  NotifyPayloadFulfillmentUpdate,
} from "../../lib/notify-event-types";
import { MessageEventTypes } from "./message-event-types";

/*
 * =============================================================================
 * ORDER WEBHOOKS PAYLOAD (GraphQL schema - camelCase)
 * =============================================================================
 * Used for: ORDER_CREATED, ORDER_CONFIRMED, ORDER_CANCELLED, ORDER_FULFILLED,
 *           ORDER_FULLY_PAID, ORDER_REFUNDED, INVOICE_SENT
 *
 * This payload represents a realistic multi-item order with:
 * - 3 order lines (tests iteration in templates)
 * - Different billing and shipping addresses
 * - One item with quantity > 1
 * - One item with a discount applied
 * - Realistic pricing that adds up correctly
 * - Company name and address line 2 populated (tests full address rendering)
 * =============================================================================
 */

const exampleOrderPayload: OrderDetailsFragment = {
  id: "T3JkZXI6NTdiNTBhNDAtYzRmYi00YjQzLWIxODgtM2JhZmRlMTc3MGQ5",
  number: "1042",
  status: "UNFULFILLED",
  languageCodeEnum: "EN",
  created: "2024-01-15T14:32:00+00:00",
  redirectUrl: "https://example.com/order/57b50a40-c4fb-4b43-b188-3bafde1770d9",
  displayGrossPrices: true,
  isShippingRequired: true,
  shippingMethodName: "Standard Shipping (3-5 business days)",
  userEmail: "adrian.king@example.com",
  metadata: [
    {
      key: "loyalty_points_earned",
      value: "213",
    },
  ],
  privateMetadata: [
    {
      key: "internal_order_source",
      value: "web_checkout",
    },
  ],
  channel: {
    slug: "default-channel",
    name: "Acme Store",
  },
  user: {
    email: "adrian.king@example.com",
    firstName: "Adrian",
    lastName: "King",
    languageCode: "EN",
  },
  // Billing address: includes company name and address line 2 (B2B scenario)
  billingAddress: {
    firstName: "Adrian",
    lastName: "King",
    companyName: "King Enterprises LLC",
    streetAddress1: "350 Fifth Avenue",
    streetAddress2: "Suite 4200",
    city: "New York",
    cityArea: "Manhattan",
    postalCode: "10118",
    countryArea: "NY",
    country: {
      country: "United States of America",
    },
    phone: "+1 212-555-0198",
  },
  // Shipping address: different from billing (common real-world scenario)
  shippingAddress: {
    firstName: "Adrian",
    lastName: "King",
    companyName: "",
    streetAddress1: "742 Evergreen Terrace",
    streetAddress2: "",
    city: "Springfield",
    cityArea: "",
    postalCode: "62704",
    countryArea: "IL",
    country: {
      country: "United States of America",
    },
    phone: "+1 555-123-4567",
  },
  lines: [
    // Line 1: Standard product with variant, quantity 2
    {
      id: "T3JkZXJMaW5lOjNkNjc4OWE3LWUyNWItNDBlMi1iNjk2LTdmMzA0ZWFjOWI2OQ==",
      productName: "Organic Cotton T-Shirt",
      variantName: "Navy / Large",
      productSku: "OCT-NVY-L",
      quantity: 2,
      thumbnail: {
        url: "https://picsum.photos/seed/tshirt/150/150",
        alt: "Organic Cotton T-Shirt",
      },
      digitalContentUrl: null,
      // Unit price: $40.00 gross (10% tax)
      unitPrice: {
        gross: {
          currency: "USD",
          amount: 40,
        },
        net: {
          currency: "USD",
          amount: 36.36,
        },
        tax: {
          currency: "USD",
          amount: 3.64,
        },
      },
      // Total: $80.00 gross (qty 2 × $40)
      totalPrice: {
        gross: {
          currency: "USD",
          amount: 80,
        },
        net: {
          currency: "USD",
          amount: 72.73,
        },
        tax: {
          currency: "USD",
          amount: 7.27,
        },
      },
      isShippingRequired: true,
      translatedProductName: "Organic Cotton T-Shirt",
      translatedVariantName: "Navy / Large",
      quantityFulfilled: 0,
      taxRate: 10,
      unitDiscountValue: 0,
      unitDiscountReason: null,
      unitDiscountType: null,
      unitDiscount: {
        amount: 0,
        currency: "USD",
      },
      undiscountedUnitPrice: {
        gross: {
          currency: "USD",
          amount: 40,
        },
        net: {
          currency: "USD",
          amount: 36.36,
        },
        tax: {
          currency: "USD",
          amount: 3.64,
        },
      },
      variant: {
        preorder: null,
        weight: {
          unit: "KG",
          value: 0.25,
        },
        attributes: [
          {
            attribute: {
              id: "QXR0cmlidXRlOjE=",
              name: "Size",
              slug: "size",
            },
            values: [
              {
                id: "QXR0cmlidXRlVmFsdWU6MQ==",
                name: "Large",
                slug: "large",
                file: null,
              },
            ],
          },
        ],
        product: {
          attributes: [
            {
              attribute: {
                id: "QXR0cmlidXRlOjI=",
                name: "Color",
                slug: "color",
              },
              values: [
                {
                  id: "QXR0cmlidXRlVmFsdWU6Mg==",
                  name: "Navy",
                  slug: "navy",
                  file: null,
                },
              ],
            },
          ],
        },
      },
      metadata: [],
      privateMetadata: [],
    },
    // Line 2: Simple product with long name (tests text wrapping), no variant
    {
      id: "T3JkZXJMaW5lOjRlNzg5MGI4LWYzNmMtNTFmMy1jNzA3LThmNDE1ZmJkMGM3MA==",
      productName: "Limited Edition Anniversary Collection Ceramic Mug with Gold Trim",
      variantName: "",
      productSku: "MUG-ANNIVERSARY-GOLD",
      quantity: 1,
      thumbnail: {
        url: "https://picsum.photos/seed/mug/150/150",
        alt: "Anniversary Ceramic Mug",
      },
      digitalContentUrl: null,
      // Unit price: $25.00 gross
      unitPrice: {
        gross: {
          currency: "USD",
          amount: 25,
        },
        net: {
          currency: "USD",
          amount: 22.73,
        },
        tax: {
          currency: "USD",
          amount: 2.27,
        },
      },
      totalPrice: {
        gross: {
          currency: "USD",
          amount: 25,
        },
        net: {
          currency: "USD",
          amount: 22.73,
        },
        tax: {
          currency: "USD",
          amount: 2.27,
        },
      },
      isShippingRequired: true,
      translatedProductName: "Limited Edition Anniversary Collection Ceramic Mug with Gold Trim",
      translatedVariantName: "",
      quantityFulfilled: 0,
      taxRate: 10,
      unitDiscountValue: 0,
      unitDiscountReason: null,
      unitDiscountType: null,
      unitDiscount: {
        amount: 0,
        currency: "USD",
      },
      undiscountedUnitPrice: {
        gross: {
          currency: "USD",
          amount: 25,
        },
        net: {
          currency: "USD",
          amount: 22.73,
        },
        tax: {
          currency: "USD",
          amount: 2.27,
        },
      },
      variant: {
        preorder: null,
        weight: {
          unit: "KG",
          value: 0.4,
        },
        attributes: [],
        product: {
          attributes: [
            {
              attribute: {
                id: "QXR0cmlidXRlOjM=",
                name: "Material",
                slug: "material",
              },
              values: [
                {
                  id: "QXR0cmlidXRlVmFsdWU6Mw==",
                  name: "Ceramic",
                  slug: "ceramic",
                  file: null,
                },
              ],
            },
          ],
        },
      },
      metadata: [],
      privateMetadata: [],
    },
    // Line 3: Product with discount applied (tests discount display)
    {
      id: "T3JkZXJMaW5lOjVmODkwMWM5LWc0N2QtNjJnNC1kODA4LTlnNTI2Z2NlMWQ4MQ==",
      productName: "Wireless Earbuds Pro",
      variantName: "Matte Black",
      productSku: "WEP-BLK-001",
      quantity: 1,
      thumbnail: {
        url: "https://picsum.photos/seed/earbuds/150/150",
        alt: "Wireless Earbuds Pro",
      },
      digitalContentUrl: null,
      // Discounted price: $96.00 gross (was $120.00, 20% off)
      unitPrice: {
        gross: {
          currency: "USD",
          amount: 96,
        },
        net: {
          currency: "USD",
          amount: 87.27,
        },
        tax: {
          currency: "USD",
          amount: 8.73,
        },
      },
      totalPrice: {
        gross: {
          currency: "USD",
          amount: 96,
        },
        net: {
          currency: "USD",
          amount: 87.27,
        },
        tax: {
          currency: "USD",
          amount: 8.73,
        },
      },
      isShippingRequired: true,
      translatedProductName: "Wireless Earbuds Pro",
      translatedVariantName: "Matte Black",
      quantityFulfilled: 0,
      taxRate: 10,
      // Discount: 20% off ($24 saved)
      unitDiscountValue: 20,
      unitDiscountReason: "Summer Sale - 20% off electronics",
      unitDiscountType: "PERCENTAGE",
      unitDiscount: {
        amount: 24,
        currency: "USD",
      },
      // Original price before discount
      undiscountedUnitPrice: {
        gross: {
          currency: "USD",
          amount: 120,
        },
        net: {
          currency: "USD",
          amount: 109.09,
        },
        tax: {
          currency: "USD",
          amount: 10.91,
        },
      },
      variant: {
        preorder: null,
        weight: {
          unit: "KG",
          value: 0.05,
        },
        attributes: [
          {
            attribute: {
              id: "QXR0cmlidXRlOjQ=",
              name: "Color",
              slug: "color",
            },
            values: [
              {
                id: "QXR0cmlidXRlVmFsdWU6NA==",
                name: "Matte Black",
                slug: "matte-black",
                file: null,
              },
            ],
          },
        ],
        product: {
          attributes: [
            {
              attribute: {
                id: "QXR0cmlidXRlOjU=",
                name: "Connectivity",
                slug: "connectivity",
              },
              values: [
                {
                  id: "QXR0cmlidXRlVmFsdWU6NQ==",
                  name: "Bluetooth 5.3",
                  slug: "bluetooth-53",
                  file: null,
                },
              ],
            },
          ],
        },
      },
      metadata: [],
      privateMetadata: [],
    },
  ],
  // Subtotal: $80 + $25 + $96 = $201.00 gross
  subtotal: {
    gross: {
      amount: 201,
      currency: "USD",
    },
    net: {
      amount: 182.73,
      currency: "USD",
    },
    tax: {
      amount: 18.27,
      currency: "USD",
    },
  },
  // Shipping: $12.00 gross
  shippingPrice: {
    gross: {
      amount: 12,
      currency: "USD",
    },
    net: {
      amount: 10.91,
      currency: "USD",
    },
    tax: {
      amount: 1.09,
      currency: "USD",
    },
  },
  /*
   * Undiscounted total: if earbuds were full price ($120 instead of $96)
   * = $80 + $25 + $120 + $12 = $237.00
   */
  undiscountedTotal: {
    gross: {
      amount: 237,
      currency: "USD",
    },
    net: {
      amount: 215.45,
      currency: "USD",
    },
    tax: {
      amount: 21.55,
      currency: "USD",
    },
  },
  // Total: $201 + $12 = $213.00 gross
  total: {
    gross: {
      amount: 213,
      currency: "USD",
    },
    net: {
      amount: 193.64,
      currency: "USD",
    },
    tax: {
      amount: 19.36,
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
        key: "invoice_type",
        value: "standard",
      },
    ],
    privateMetadata: [
      {
        key: "accounting_id",
        value: "INV-2024-001042",
      },
    ],
    message: null,
    externalUrl: null,
    url: "https://example.com/media/invoices/invoice-2024-order-1042.pdf",
    order: {
      id: "T3JkZXI6NTdiNTBhNDAtYzRmYi00YjQzLWIxODgtM2JhZmRlMTc3MGQ5",
    },
  },
  order: exampleOrderPayload,
};

/*
 * =============================================================================
 * ACCOUNT NOTIFY PAYLOADS (Saleor Notify webhook - snake_case)
 * =============================================================================
 * Used for: ACCOUNT_CONFIRMATION, ACCOUNT_PASSWORD_RESET, ACCOUNT_DELETE,
 *           ACCOUNT_CHANGE_EMAIL_REQUEST, ACCOUNT_CHANGE_EMAIL_CONFIRM
 *
 * These payloads use snake_case field names as they come from Saleor's
 * built-in Notify webhook (not GraphQL subscriptions).
 * =============================================================================
 */

const accountConfirmationPayload: NotifyPayloadAccountConfirmation = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "sarah.johnson@example.com",
    first_name: "Sarah",
    last_name: "Johnson",
    is_staff: false,
    is_active: false,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "sarah.johnson@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  confirm_url:
    "https://example.com/account/confirm?email=sarah.johnson%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "acme-store.example.com",
  site_name: "Acme Store",
  logo_url: "",
};

const accountPasswordResetPayload: NotifyPayloadAccountPasswordReset = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "sarah.johnson@example.com",
    first_name: "Sarah",
    last_name: "Johnson",
    is_staff: false,
    is_active: true,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "sarah.johnson@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  reset_url:
    "https://example.com/account/reset-password?email=sarah.johnson%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "acme-store.example.com",
  site_name: "Acme Store",
  logo_url: "",
};

const accountChangeEmailRequestPayload: NotifyPayloadAccountChangeEmailRequest = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "sarah.johnson@example.com",
    first_name: "Sarah",
    last_name: "Johnson",
    is_staff: false,
    is_active: true,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "sarah.johnson@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  old_email: "sarah.johnson@example.com",
  new_email: "sarah.j.johnson@example.com",
  redirect_url:
    "https://example.com/account/change-email?email=sarah.johnson%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "acme-store.example.com",
  site_name: "Acme Store",
  logo_url: "",
};

const accountChangeEmailConfirmPayload: NotifyPayloadAccountChangeEmailConfirmation = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "sarah.j.johnson@example.com",
    first_name: "Sarah",
    last_name: "Johnson",
    is_staff: false,
    is_active: true,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "sarah.j.johnson@example.com",
  old_email: "sarah.johnson@example.com",
  new_email: "sarah.j.johnson@example.com",
  channel_slug: "default-channel",
  domain: "acme-store.example.com",
  site_name: "Acme Store",
  logo_url: "",
};

const accountDeletePayload: NotifyPayloadAccountDelete = {
  user: {
    id: "VXNlcjoxOTY=",
    email: "sarah.johnson@example.com",
    first_name: "Sarah",
    last_name: "Johnson",
    is_staff: false,
    is_active: true,
    private_metadata: {},
    metadata: {},
    language_code: "en",
  },
  recipient_email: "sarah.johnson@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  delete_url:
    "https://example.com/account/delete?email=sarah.johnson%40example.com&token=bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "acme-store.example.com",
  site_name: "Acme Store",
  logo_url: "",
};

/*
 * =============================================================================
 * FULFILLMENT UPDATE PAYLOAD (Saleor Notify webhook - snake_case)
 * =============================================================================
 * Used for: ORDER_FULFILLMENT_UPDATE
 *
 * This payload represents a fulfilled order with tracking information.
 * Uses snake_case as it comes from Saleor's Notify webhook.
 * =============================================================================
 */

// Helper: Create image size mapping for Notify payload format
const createImageSizeMapping = (seed: string) => ({
  "32": `https://picsum.photos/seed/${seed}/32/32`,
  "64": `https://picsum.photos/seed/${seed}/64/64`,
  "128": `https://picsum.photos/seed/${seed}/128/128`,
  "256": `https://picsum.photos/seed/${seed}/256/256`,
  "512": `https://picsum.photos/seed/${seed}/512/512`,
  "1024": `https://picsum.photos/seed/${seed}/1024/1024`,
  "2048": `https://picsum.photos/seed/${seed}/2048/2048`,
  "4096": `https://picsum.photos/seed/${seed}/4096/4096`,
});

const fulfillmentOrderLineTShirt: NotifyPayloadFulfillmentUpdate["order"]["lines"][0] = {
  id: "T3JkZXJMaW5lOjNkNjc4OWE3LWUyNWItNDBlMi1iNjk2LTdmMzA0ZWFjOWI2OQ==",
  product: {
    id: "UHJvZHVjdDoxMzQ=",
    attributes: [
      {
        assignment: {
          attribute: {
            slug: "color",
            name: "Color",
          },
        },
        values: [
          {
            name: "Navy",
            value: "",
            slug: "navy",
            file_url: null,
          },
        ],
      },
    ],
    weight: "0.25",
    first_image: {
      original: createImageSizeMapping("tshirt"),
    },
    images: [
      {
        original: createImageSizeMapping("tshirt"),
      },
    ],
  },
  product_name: "Organic Cotton T-Shirt",
  translated_product_name: "Organic Cotton T-Shirt",
  variant_name: "Navy / Large",
  variant: {
    id: "UHJvZHVjdFZhcmlhbnQ6MzQ4",
    weight: "0.25",
    is_preorder: false,
    preorder_end_date: null,
    first_image: {
      original: createImageSizeMapping("tshirt"),
    },
    images: [
      {
        original: createImageSizeMapping("tshirt"),
      },
    ],
  },
  translated_variant_name: "Navy / Large",
  product_sku: "OCT-NVY-L",
  product_variant_id: "UHJvZHVjdFZhcmlhbnQ6MzQ4",
  quantity: 2,
  quantity_fulfilled: 2,
  currency: "USD",
  unit_price_net_amount: "36.36",
  unit_price_gross_amount: "40.00",
  unit_tax_amount: "3.64",
  total_gross_amount: "80.00",
  total_net_amount: "72.73",
  total_tax_amount: "7.27",
  tax_rate: "0.1000",
  is_shipping_required: true,
  is_digital: false,
  digital_url: null,
  unit_discount_value: "0.000",
  unit_discount_reason: null,
  unit_discount_type: "fixed",
  unit_discount_amount: "0.000",
  metadata: {},
};

const fulfillmentOrderLineMug: NotifyPayloadFulfillmentUpdate["order"]["lines"][0] = {
  id: "T3JkZXJMaW5lOjRlNzg5MGI4LWYzNmMtNTFmMy1jNzA3LThmNDE1ZmJkMGM3MA==",
  product: {
    id: "UHJvZHVjdDoxMzU=",
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
            name: "Ceramic",
            value: "",
            slug: "ceramic",
            file_url: null,
          },
        ],
      },
    ],
    weight: "0.4",
    first_image: {
      original: createImageSizeMapping("mug"),
    },
    images: [
      {
        original: createImageSizeMapping("mug"),
      },
    ],
  },
  product_name: "Limited Edition Anniversary Collection Ceramic Mug with Gold Trim",
  translated_product_name: "Limited Edition Anniversary Collection Ceramic Mug with Gold Trim",
  variant_name: "",
  variant: {
    id: "UHJvZHVjdFZhcmlhbnQ6MzQ5",
    weight: "0.4",
    is_preorder: false,
    preorder_end_date: null,
    first_image: {
      original: createImageSizeMapping("mug"),
    },
    images: [
      {
        original: createImageSizeMapping("mug"),
      },
    ],
  },
  translated_variant_name: "",
  product_sku: "MUG-ANNIVERSARY-GOLD",
  product_variant_id: "UHJvZHVjdFZhcmlhbnQ6MzQ5",
  quantity: 1,
  quantity_fulfilled: 1,
  currency: "USD",
  unit_price_net_amount: "22.73",
  unit_price_gross_amount: "25.00",
  unit_tax_amount: "2.27",
  total_gross_amount: "25.00",
  total_net_amount: "22.73",
  total_tax_amount: "2.27",
  tax_rate: "0.1000",
  is_shipping_required: true,
  is_digital: false,
  digital_url: null,
  unit_discount_value: "0.000",
  unit_discount_reason: null,
  unit_discount_type: "fixed",
  unit_discount_amount: "0.000",
  metadata: {},
};

const fulfillmentOrderLineEarbuds: NotifyPayloadFulfillmentUpdate["order"]["lines"][0] = {
  id: "T3JkZXJMaW5lOjVmODkwMWM5LWc0N2QtNjJnNC1kODA4LTlnNTI2Z2NlMWQ4MQ==",
  product: {
    id: "UHJvZHVjdDoxMzY=",
    attributes: [
      {
        assignment: {
          attribute: {
            slug: "connectivity",
            name: "Connectivity",
          },
        },
        values: [
          {
            name: "Bluetooth 5.3",
            value: "",
            slug: "bluetooth-53",
            file_url: null,
          },
        ],
      },
    ],
    weight: "0.05",
    first_image: {
      original: createImageSizeMapping("earbuds"),
    },
    images: [
      {
        original: createImageSizeMapping("earbuds"),
      },
    ],
  },
  product_name: "Wireless Earbuds Pro",
  translated_product_name: "Wireless Earbuds Pro",
  variant_name: "Matte Black",
  variant: {
    id: "UHJvZHVjdFZhcmlhbnQ6MzUw",
    weight: "0.05",
    is_preorder: false,
    preorder_end_date: null,
    first_image: {
      original: createImageSizeMapping("earbuds"),
    },
    images: [
      {
        original: createImageSizeMapping("earbuds"),
      },
    ],
  },
  translated_variant_name: "Matte Black",
  product_sku: "WEP-BLK-001",
  product_variant_id: "UHJvZHVjdFZhcmlhbnQ6MzUw",
  quantity: 1,
  quantity_fulfilled: 1,
  currency: "USD",
  unit_price_net_amount: "87.27",
  unit_price_gross_amount: "96.00",
  unit_tax_amount: "8.73",
  total_gross_amount: "96.00",
  total_net_amount: "87.27",
  total_tax_amount: "8.73",
  tax_rate: "0.1000",
  is_shipping_required: true,
  is_digital: false,
  digital_url: null,
  unit_discount_value: "20.000",
  unit_discount_reason: "Summer Sale - 20% off electronics",
  unit_discount_type: "percentage",
  unit_discount_amount: "24.000",
  metadata: {},
};

const fulfillmentBillingAddress: NotifyPayloadFulfillmentUpdate["order"]["billing_address"] = {
  first_name: "Adrian",
  last_name: "King",
  company_name: "King Enterprises LLC",
  street_address_1: "350 Fifth Avenue",
  street_address_2: "Suite 4200",
  city: "New York",
  city_area: "Manhattan",
  postal_code: "10118",
  country: "US",
  country_area: "NY",
  phone: "+1 212-555-0198",
};

const fulfillmentShippingAddress: NotifyPayloadFulfillmentUpdate["order"]["shipping_address"] = {
  first_name: "Adrian",
  last_name: "King",
  company_name: "",
  street_address_1: "742 Evergreen Terrace",
  street_address_2: "",
  city: "Springfield",
  city_area: "",
  postal_code: "62704",
  country: "US",
  country_area: "IL",
  phone: "+1 555-123-4567",
};

const fulfillmentOrderPayload: NotifyPayloadFulfillmentUpdate["order"] = {
  private_metadata: {},
  metadata: {},
  status: "fulfilled",
  language_code: "en",
  currency: "USD",
  // Totals matching the GraphQL payload
  total_net_amount: "193.64",
  undiscounted_total_net_amount: "215.45",
  total_gross_amount: "213.00",
  undiscounted_total_gross_amount: "237.00",
  display_gross_prices: true,
  id: "T3JkZXI6NTdiNTBhNDAtYzRmYi00YjQzLWIxODgtM2JhZmRlMTc3MGQ5",
  token: "57b50a40-c4fb-4b43-b188-3bafde1770d9",
  number: 1042,
  channel_slug: "default-channel",
  created: "2024-01-15T14:32:00+00:00",
  shipping_price_net_amount: "10.91",
  shipping_price_gross_amount: "12.00",
  order_details_url: "https://example.com/account/orders/1042",
  email: "adrian.king@example.com",
  subtotal_gross_amount: "201.00",
  subtotal_net_amount: "182.73",
  tax_amount: "19.36",
  lines: [fulfillmentOrderLineTShirt, fulfillmentOrderLineMug, fulfillmentOrderLineEarbuds],
  billing_address: fulfillmentBillingAddress,
  shipping_address: fulfillmentShippingAddress,
  shipping_method_name: "Standard Shipping (3-5 business days)",
  collection_point_name: null,
  voucher_discount: null,
  discount_amount: 24,
};

const fulfillmentUpdatePayload: NotifyPayloadFulfillmentUpdate = {
  fulfillment: {
    is_tracking_number_url: true,
    tracking_number: "https://track.example.com/1Z999AA10123456784",
  },
  order: fulfillmentOrderPayload,
  physical_lines: [
    {
      id: "RnVsZmlsbG1lbnRMaW5lOjE=",
      order_line: fulfillmentOrderLineTShirt,
      quantity: 2,
    },
    {
      id: "RnVsZmlsbG1lbnRMaW5lOjI=",
      order_line: fulfillmentOrderLineMug,
      quantity: 1,
    },
    {
      id: "RnVsZmlsbG1lbnRMaW5lOjM=",
      order_line: fulfillmentOrderLineEarbuds,
      quantity: 1,
    },
  ],
  digital_lines: [],
  recipient_email: "adrian.king@example.com",
  token: "bmt4kc-d6e379b762697f6aa357527af36bb9f6",
  channel_slug: "default-channel",
  domain: "acme-store.example.com",
  site_name: "Acme Store",
  logo_url: "",
};

/*
 * =============================================================================
 * GIFT CARD PAYLOAD
 * =============================================================================
 */

const giftCardSentPayload: GiftCardSentWebhookPayloadFragment = {
  channel: "default-channel",
  sentToEmail: "gift.recipient@example.com",
  giftCard: {
    code: "GIFT-ABCD-1234-EFGH",
    metadata: [
      {
        key: "occasion",
        value: "Birthday",
      },
      {
        key: "sender_name",
        value: "Adrian King",
      },
    ],
    privateMetadata: [
      {
        key: "internal_note",
        value: "VIP customer gift",
      },
    ],
    tags: [
      { id: "R2lmdENhcmRUYWc6MQ==", name: "birthday" },
      { id: "R2lmdENhcmRUYWc6Mg==", name: "premium" },
    ],
    created: "2024-01-15T10:30:00+00:00",
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
    displayCode: "ABCD-1234-EFGH",
    last4CodeChars: "EFGH",
    expiryDate: "2025-01-15",
    usedByEmail: null,
    usedBy: null,
  },
};

/*
 * =============================================================================
 * EXPORT: All example payloads mapped by event type
 * =============================================================================
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
