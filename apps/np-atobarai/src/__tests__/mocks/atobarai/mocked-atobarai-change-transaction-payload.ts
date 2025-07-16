import { createAtobaraiChangeTransactionPayload } from "@/modules/atobarai/atobarai-change-transaction-payload";

import { mockedSaleorTransactionToken } from "../saleor/mocked-saleor-transaction-token";
import { mockedAtobaraiCustomer } from "./mocked-atobarai-customer";
import { mockedAtobaraiDeliveryDestination } from "./mocked-atobarai-delivery-destination";
import { mockedAtobaraiGoods } from "./mocked-atobarai-goods";
import { mockedAtobaraiMoney } from "./mocked-atobarai-money";
import { mockedAtobaraiShopOrderDate } from "./mocked-atobarai-shop-order-date";
import { mockedAtobaraiTransactionId } from "./mocked-atobarai-transaction-id";

export const mockedAtobaraiChangeTransactionPayload = createAtobaraiChangeTransactionPayload({
  atobaraiTransactionId: mockedAtobaraiTransactionId,
  saleorTransactionToken: mockedSaleorTransactionToken,
  atobaraiMoney: mockedAtobaraiMoney,
  atobaraiCustomer: mockedAtobaraiCustomer,
  atobaraiDeliveryDestination: mockedAtobaraiDeliveryDestination,
  atobaraiGoods: mockedAtobaraiGoods,
  atobaraiShopOrderDate: mockedAtobaraiShopOrderDate,
});
