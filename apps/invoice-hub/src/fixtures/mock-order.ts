import { OrderPayloadFragment, OrderStatus } from "../../generated/graphql";

export const mockOrder: OrderPayloadFragment = {
  channel: {
    slug: "default-channel",
  },
  shippingPrice: {
    currency: "USD",
    gross: {
      amount: 1,
      currency: "USD",
    },
    net: {
      amount: 1,
      currency: "USD",
    },
    tax: {
      amount: 0,
      currency: "USD",
    },
  },
  shippingMethodName: "CyCreateVariants-1462",
  number: "3991",
  id: "T3JkZXI6OTFiZjM5ZDQtZjRiMC00M2QyLTgwMjEtZjVkMTMwNDVlMjkx",
  billingAddress: {
    id: "QWRkcmVzczoxNzE4Ng==",
    country: {
      country: "Poland",
      code: "PL",
    },
    companyName: "Fajna firma lol",
    cityArea: "",
    countryArea: "",
    streetAddress1: "street 1",
    streetAddress2: "Street 2",
    postalCode: "55-123",
    phone: "+48690563008",
    firstName: "MAdzia",
    lastName: "Markusik",
    city: "WRO",
  },
  created: "2022-12-02T15:05:56.637068+00:00",
  fulfillments: [],
  status: OrderStatus.Unfulfilled,
  total: {
    currency: "USD",
    gross: {
      amount: 207.15,
      currency: "USD",
    },
    net: {
      amount: 206,
      currency: "USD",
    },
    tax: {
      amount: 1.15,
      currency: "USD",
    },
  },
  lines: [
    {
      productName: "Tales of pirate kittycat",
      variantName: "Signed: Yes / vinyl",
      quantity: 2,
      totalPrice: {
        currency: "USD",
        gross: {
          amount: 200,
          currency: "USD",
        },
        net: {
          amount: 200,
          currency: "USD",
        },
        tax: {
          amount: 0,
          currency: "USD",
        },
      },
    },
    {
      productName: "White Hoodie",
      variantName: "10404946",
      quantity: 1,
      totalPrice: {
        currency: "USD",
        gross: {
          amount: 6.15,
          currency: "USD",
        },
        net: {
          amount: 5,
          currency: "USD",
        },
        tax: {
          amount: 1.15,
          currency: "USD",
        },
      },
    },
  ],
};
