import { OrderFulfilledSubscriptionFragment } from "../../../generated/graphql";
import { CommitTransactionArgs } from "./avatax-client";

const transformPayload = (order: OrderFulfilledSubscriptionFragment): CommitTransactionArgs => {
  return {
    companyCode: "0",
    transactionCode: "",
  };
};

export const avataxOrderFulfilled = {
  transformPayload,
};
