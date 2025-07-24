import { NoRefundGoodsBuilder } from "@/modules/atobarai/atobarai-goods/no-refund-goods-builder";

import { mockedAppChannelConfig } from "../app-config/mocked-app-config";
import { mockedSourceObject } from "../saleor-events/mocked-source-object";

const builder = new NoRefundGoodsBuilder();

export const mockedAtobaraiGoods = builder.build({
  sourceObject: mockedSourceObject,
  useSkuAsName: mockedAppChannelConfig.skuAsName,
});
