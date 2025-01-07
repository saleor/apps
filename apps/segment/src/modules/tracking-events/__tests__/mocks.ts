import { OrderBaseFragment } from "@/generated/graphql";

export const mockedOrderBase: OrderBaseFragment = {
  id: "order-id",
  userEmail: "user-email",
  number: "order-number",
  channel: {
    id: "channel-id",
    slug: "channel-slug",
    name: "channel-name",
  },
  lines: [],
  total: {
    gross: {
      amount: 37,
      currency: "USD",
    },
    net: {
      amount: 21,
      currency: "USD",
    },
  },
};
