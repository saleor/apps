import { AppChannelConfig } from "@/modules/app-config/app-config";
import { createAtobaraiMerchantCode } from "@/modules/atobarai/atobarai-merchant-code";
import { createAtobaraiSpCode } from "@/modules/atobarai/atobarai-sp-code";
import { createAtobaraiTerminalId } from "@/modules/atobarai/atobarai-terminal-id";

export const mockedAppChannelConfig = AppChannelConfig.create({
  name: "Config 1",
  id: "111",
  merchantCode: createAtobaraiMerchantCode("merchant-code-1"),
  shippingCompanyCode: "5000",
  skuAsName: true,
  spCode: createAtobaraiSpCode("sp1"),
  useSandbox: true,
  terminalId: createAtobaraiTerminalId("id"),
})._unsafeUnwrap();
