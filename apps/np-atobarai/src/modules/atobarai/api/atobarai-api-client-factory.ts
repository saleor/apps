import { type AtobaraiMerchantCode } from "../atobarai-merchant-code";
import { type AtobaraiSecretSpCode } from "../atobarai-secret-sp-code";
import { type AtobaraiTerminalId } from "../atobarai-terminal-id";
import { AtobaraiApiClient } from "./atobarai-api-client";
import {
  type AtobaraiEnvironment,
  type IAtobaraiApiClient,
  type IAtobaraiApiClientFactory,
} from "./types";

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
