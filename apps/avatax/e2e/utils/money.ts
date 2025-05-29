import { MoneyFragment } from "../generated/graphql";

export const getMoney = (amount: number, currency: string): MoneyFragment => {
  return {
    amount,
    currency,
  };
};

export const getCompleteMoney = ({
  gross,
  net,
  tax,
  currency,
}: {
  gross: number;
  net: number;
  tax: number;
  currency: string;
}) => ({
  gross: getMoney(gross, currency),
  net: getMoney(net, currency),
  tax: getMoney(tax, currency),
});
