import { OrderConfirmedSubscriptionFragment, OrderStatus } from "../generated/graphql";

const commonOrderFields = {
  id: "T3JkZXI6ZTUzZTBlM2MtMjk5Yi00OWYxLWIyZDItY2Q4NWExYTgxYjY2",
  user: {
    id: "VXNlcjoyMDg0NTEwNDEw",
    email: "happy.customer@saleor.io",
  },
  number: "1234",
  avataxEntityCode: null,
  created: "2023-05-25T09:18:55.203440+00:00",
  status: OrderStatus.Unfulfilled,
  channel: {
    id: "Q2hhbm5lbDox",
    slug: "default-channel",
  },
  shippingAddress: {
    streetAddress1: "600 Montgomery St",
    streetAddress2: "",
    city: "SAN FRANCISCO",
    countryArea: "CA",
    postalCode: "94111",
    country: {
      code: "US",
    },
  },
  billingAddress: {
    streetAddress1: "600 Montgomery St",
    streetAddress2: "",
    city: "SAN FRANCISCO",
    countryArea: "CA",
    postalCode: "94111",
    country: {
      code: "US",
    },
  },
  total: {
    currency: "USD",
    net: {
      amount: 239.17,
    },
    tax: {
      amount: 15.54,
    },
  },
  discounts: [],
};

const shippingPriceFactory = ({ gross, net }: { gross: number; net: number }) => ({
  gross: {
    amount: gross,
  },
  net: {
    amount: net,
  },
});

const productLineFactory = ({
  sku,
  name,
  quantity,
  unitPrice,
  net,
  tax,
  gross,
}: {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  net: number;
  tax: number;
  gross: number;
}) => ({
  productSku: sku,
  productName: name,
  quantity,
  unitPrice: {
    net: {
      amount: unitPrice,
    },
  },
  totalPrice: {
    net: {
      amount: net,
    },
    tax: {
      amount: tax,
    },
    gross: {
      amount: gross,
    },
  },
});

export const defaultOrder: OrderConfirmedSubscriptionFragment = {
  ...commonOrderFields,
  shippingPrice: shippingPriceFactory({ gross: 59.17, net: 50 }),
  lines: [
    productLineFactory({
      sku: "328223580",
      name: "Monospace Tee",
      quantity: 3,
      unitPrice: 20,
      net: 60,
      tax: 5.18,
      gross: 65.18,
    }),
    productLineFactory({
      sku: "328223581",
      name: "Monospace Tee",
      quantity: 1,
      unitPrice: 20,
      net: 20,
      tax: 1.73,
      gross: 21.73,
    }),
    productLineFactory({
      sku: "118223581",
      name: "Paul's Balance 420",
      quantity: 2,
      unitPrice: 50,
      net: 100,
      tax: 8.63,
      gross: 108.63,
    }),
  ],
};

export const orderWithTaxIncluded: OrderConfirmedSubscriptionFragment = {
  ...commonOrderFields,
  shippingPrice: shippingPriceFactory({ gross: 59.17, net: 59.17 }),
  lines: [
    productLineFactory({
      sku: "328223580",
      name: "Monospace Tee",
      quantity: 3,
      unitPrice: 20,
      net: 65.18,
      tax: 5.18,
      gross: 65.18,
    }),
    productLineFactory({
      sku: "328223581",
      name: "Monospace Tee",
      quantity: 1,
      unitPrice: 20,
      net: 21.73,
      tax: 1.73,
      gross: 21.73,
    }),
    productLineFactory({
      sku: "118223581",
      name: "Paul's Balance 420",
      quantity: 2,
      unitPrice: 50,
      net: 108.63,
      tax: 8.63,
      gross: 108.63,
    }),
  ],
};
