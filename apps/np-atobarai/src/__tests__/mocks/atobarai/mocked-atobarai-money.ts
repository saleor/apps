import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";

export const mockedAtobaraiMoney = createAtobaraiMoney({
  amount: 1000,
  currency: "JPY",
});
