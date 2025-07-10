import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { Result } from "neverthrow";

import { AtobaraiMerchantCode } from "../atobarai/atobarai-merchant-code";
import { AtobaraiSpCode } from "../atobarai/atobarai-sp-code";
import { AtobaraiTerminalId } from "../atobarai/atobarai-terminal-id";
import { AtobaraiEnviroment } from "../atobarai/types";

export class AtobaraiConfig {
  public atobaraiTerminalId: AtobaraiTerminalId;
  public atobaraiMerchantCode: AtobaraiMerchantCode;
  public atobaraiSpCode: AtobaraiSpCode;
  public atobaraiEnviroment: AtobaraiEnviroment;

  constructor(params: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSpCode: AtobaraiSpCode;
    atobaraiEnviroment: AtobaraiEnviroment;
  }) {
    this.atobaraiTerminalId = params.atobaraiTerminalId;
    this.atobaraiMerchantCode = params.atobaraiMerchantCode;
    this.atobaraiSpCode = params.atobaraiSpCode;
    this.atobaraiEnviroment = params.atobaraiEnviroment;
  }
}

export type BaseAccessPattern = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

export type AtobaraiConfigByChannelIdAccessPattern = BaseAccessPattern & {
  channelId: string;
};

export type AtobaraiConfigByConfigIdAccessPattern = BaseAccessPattern & {
  configId: string;
};

export type GetAtobaraiConfigAccessPattern =
  | AtobaraiConfigByChannelIdAccessPattern
  | AtobaraiConfigByConfigIdAccessPattern;

export interface AppConfigRepo {
  getAtobaraiConfig: (
    access: GetAtobaraiConfigAccessPattern,
    // TODO: Define strict errors
  ) => Promise<Result<AtobaraiConfig | null, Error>>;
}
