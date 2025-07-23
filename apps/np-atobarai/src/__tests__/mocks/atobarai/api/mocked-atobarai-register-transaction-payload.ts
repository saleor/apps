import { createAtobaraiRegisterTransactionPayload } from "@/modules/atobarai/api/atobarai-register-transaction-payload";

import { mockedSaleorTransactionToken } from "../../saleor/mocked-saleor-transaction-token";
import { mockedAtobaraiCustomer } from "../mocked-atobarai-customer";
import { mockedAtobaraiDeliveryDestination } from "../mocked-atobarai-delivery-destination";
import { mockedAtobaraiGoods } from "../mocked-atobarai-goods";
import { mockedAtobaraiMoney } from "../mocked-atobarai-money";
import { mockedAtobaraiShopOrderDate } from "../mocked-atobarai-shop-order-date";

export const mockedAtobaraiRegisterTransactionPayload = createAtobaraiRegisterTransactionPayload({
  saleorTransactionToken: mockedSaleorTransactionToken,
  atobaraiMoney: mockedAtobaraiMoney,
  atobaraiCustomer: mockedAtobaraiCustomer,
  atobaraiDeliveryDestination: mockedAtobaraiDeliveryDestination,
  atobaraiGoods: mockedAtobaraiGoods,
  atobaraiShopOrderDate: mockedAtobaraiShopOrderDate,
});
