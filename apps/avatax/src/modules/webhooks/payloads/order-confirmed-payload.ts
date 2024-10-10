import { ResultOf } from "@/graphql";

import { OrderConfirmedEventFragment } from "../../../../graphql/subscriptions/OrderConfirmed";

export type OrderConfirmedPayload = Extract<
  ResultOf<typeof OrderConfirmedEventFragment>,
  { __typename: "OrderConfirmed" }
>;
