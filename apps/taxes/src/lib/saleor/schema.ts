import { z } from "zod";
import { CalculateTaxesEventFragment } from "../../../generated/graphql";

export type ExpectedWebhookPayload = Extract<
  CalculateTaxesEventFragment,
  { __typename: "CalculateTaxes" }
>;

const taxDiscountSchema = z.object({
  name: z.string(),
  amount: z.object({
    amount: z.number(),
  }),
});
const checkoutBaseLineSchema = z.object({
  __typename: z.literal("CheckoutLine"),
  id: z.string(),
  productVariant: z.object({
    id: z.string(),
    product: z.object({
      metafield: z.string().nullable(),
      productType: z.object({
        metafield: z.string().nullable(),
      }),
    }),
  }),
});

const orderBaseLineSchema = z.object({
  __typename: z.literal("OrderLine"),
  id: z.string(),
  variant: z.object({
    id: z.string(),
    product: z.object({
      metafield: z.string().nullable(),
      productType: z.object({
        metafield: z.string().nullable(),
      }),
    }),
  }),
});

const taxAddressSchema = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string(),
  city: z.string(),
  country: z.object({
    code: z.string(),
  }),
  countryArea: z.string(),
  postalCode: z.string(),
});

const taxBaseLineSchema = z.object({
  chargeTaxes: z.boolean(),
  quantity: z.number(),
  unitPrice: z.object({
    amount: z.number(),
  }),
  totalPrice: z.object({
    amount: z.number(),
  }),
  sourceLine: z.union([checkoutBaseLineSchema, orderBaseLineSchema]),
});

export const calculateTaxesPayloadSchema: z.ZodType<ExpectedWebhookPayload> = z.object({
  __typename: z.literal("CalculateTaxes"),
  recipient: z.object({
    privateMetadata: z.array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    ),
  }),
  taxBase: z.object({
    currency: z.string(),
    channel: z.object({
      slug: z.string(),
    }),
    __typename: z.literal("TaxableObject").optional(),
    discounts: z.array(taxDiscountSchema),
    address: taxAddressSchema,
    shippingPrice: z.object({
      amount: z.number(),
    }),
    lines: z.array(taxBaseLineSchema).min(1),
  }),
});
