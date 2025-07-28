import { TransactionGoodBuilder } from "@/modules/atobarai/atobarai-goods/transaction-goods-builder";

import { mockedAppChannelConfig } from "../app-config/mocked-app-config";
import { mockedSourceObject } from "../saleor-events/mocked-source-object";

const builder = new TransactionGoodBuilder();

export const mockedAtobaraiGoods = builder.build({
  sourceObject: mockedSourceObject,
  useSkuAsName: mockedAppChannelConfig.skuAsName,
});
