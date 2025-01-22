import { OrderBaseFragment } from "@/generated/graphql";

export const mockedOrderBase: OrderBaseFragment = {
  id: "order-id",
  userEmail: "user-email",
  total: {
    gross: {
      amount: 37,
      currency: "USD",
    },
    tax: {
      amount: 0.21,
    },
  },
  undiscountedTotal: {
    gross: {
      amount: 30,
    },
  },
  shippingPrice: {
    gross: {
      amount: 5,
    },
  },
  lines: [
    {
      id: "line-id",
      quantity: 1,
      totalPrice: {
        gross: {
          amount: 37,
        },
      },
      productSku: "sku",
      variant: {
        name: "variantName",
        product: {
          name: "productName",
          category: {
            name: "categoryName",
          },
        },
      },
    },
  ],
};
