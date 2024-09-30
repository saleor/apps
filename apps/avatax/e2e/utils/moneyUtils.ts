import { MoneyFragment } from "../generated/graphql";

const CURRENCY = "USD";

export const getMoney = (amount: number): MoneyFragment => {
  return {
    amount,
    currency: CURRENCY,
  };
};

export const getCompleteMoney = ({
  gross,
  net,
  tax,
}: {
  gross: number;
  net: number;
  tax: number;
}) => ({
  gross: getMoney(gross),
  net: getMoney(net),
  tax: getMoney(tax),
});
