import { AtobaraiMerchantCode } from "../atobarai-merchant-code";
import { AtobaraiSecretSpCode } from "../atobarai-secret-sp-code";
import { AtobaraiTerminalId } from "../atobarai-terminal-id";
import { AtobaraiApiClient } from "./atobarai-api-client";
import { AtobaraiEnvironment, IAtobaraiApiClient, IAtobaraiApiClientFactory } from "./types";

export class AtobaraiApiClientFactory implements IAtobaraiApiClientFactory {
  create(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSecretSpCode: AtobaraiSecretSpCode;
    atobaraiEnvironment: AtobaraiEnvironment;
  }): IAtobaraiApiClient {
    return AtobaraiApiClient.create({
      atobaraiTerminalId: args.atobaraiTerminalId,
      atobaraiMerchantCode: args.atobaraiMerchantCode,
      atobaraiSecretSpCode: args.atobaraiSecretSpCode,
      atobaraiEnvironment: args.atobaraiEnvironment,
    });
  }
}
