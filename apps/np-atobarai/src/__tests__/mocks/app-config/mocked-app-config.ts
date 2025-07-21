import { AppChannelConfig } from "@/modules/app-config/app-config";
import { createAtobaraiMerchantCode } from "@/modules/atobarai/atobarai-merchant-code";
import { createAtobaraiSecretSpCode } from "@/modules/atobarai/atobarai-secret-sp-code";
import { createAtobaraiShippingCompanyCode } from "@/modules/atobarai/atobarai-shipping-company-code";
import { createAtobaraiTerminalId } from "@/modules/atobarai/atobarai-terminal-id";

export const mockedAppChannelConfig = AppChannelConfig.create({
  name: "Config 1",
  id: "111",
  merchantCode: createAtobaraiMerchantCode("merchant-code-1"),
  shippingCompanyCode: createAtobaraiShippingCompanyCode("50000"),
  skuAsName: true,
  secretSpCode: createAtobaraiSecretSpCode("sp1"),
  useSandbox: true,
  terminalId: createAtobaraiTerminalId("id"),
})._unsafeUnwrap();
