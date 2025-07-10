import { AtobaraiConfig } from "@/modules/app-config/types";

import { mockedAtobaraiMerchantCode } from "../atobarai/mocked-atobarai-merchant-code";
import { mockedAtobaraiSpCode } from "../atobarai/mocked-atobarai-sp-code";
import { mockedAtobaraiTerminalId } from "../atobarai/mocked-atobarai-terminal-id";

export const mockedAppConfig = new AtobaraiConfig({
  atobaraiEnviroment: "sandbox",
  atobaraiMerchantCode: mockedAtobaraiMerchantCode,
  atobaraiSpCode: mockedAtobaraiSpCode,
  atobaraiTerminalId: mockedAtobaraiTerminalId,
});
