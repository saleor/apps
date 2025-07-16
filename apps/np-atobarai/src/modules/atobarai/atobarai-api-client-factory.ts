import { AtobaraiApiClient } from "./atobarai-api-client";
import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { AtobaraiSpCode } from "./atobarai-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";
import { AtobaraiEnvironment, IAtobaraiApiClient, IAtobaraiApiClientFactory } from "./types";

export class AtobaraiApiClientFactory implements IAtobaraiApiClientFactory {
  create(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSpCode: AtobaraiSpCode;
    atobaraiEnvironment: AtobaraiEnvironment;
  }): IAtobaraiApiClient {
    return AtobaraiApiClient.create({
      atobaraiTerminalId: args.atobaraiTerminalId,
      atobaraiMerchantCode: args.atobaraiMerchantCode,
      atobaraiSpCode: args.atobaraiSpCode,
      atobaraiEnvironment: args.atobaraiEnvironment,
    });
  }
}
