import Avatax from "avatax";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";
import { CommitTransactionModel } from "avatax/lib/models/CommitTransactionModel";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import { LogOptions } from "avatax/lib/utils/logger";
import packageJson from "../../../package.json";
import { AvataxClientTaxCodeService } from "./avatax-client-tax-code.service";
import { BaseAvataxConfig } from "./avatax-connection-schema";
import { VoidReasonCode } from "avatax/lib/enums/VoidReasonCode";

type AvataxSettings = {
  appName: string;
  appVersion: string;
  environment: "sandbox" | "production";
  machineName: string;
  timeout: number;
  logOptions?: LogOptions;
};

const defaultAvataxSettings: AvataxSettings = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  environment: "sandbox",
  machineName: "tax-app",
  timeout: 5000,
};

const createAvataxSettings = ({ isSandbox }: { isSandbox: boolean }): AvataxSettings => {
  const settings: AvataxSettings = {
    ...defaultAvataxSettings,
    environment: isSandbox ? "sandbox" : "production",
  };

  return settings;
};

export type CommitTransactionArgs = {
  companyCode: string;
  transactionCode: string;
  model: CommitTransactionModel;
  documentType: DocumentType;
};

export type CreateTransactionArgs = {
  model: CreateTransactionModel;
};

export type ValidateAddressArgs = {
  address: AvataxAddress;
};

export type VoidTransactionArgs = {
  transactionCode: string;
  companyCode: string;
};

export class AvataxClient {
  private client: Avatax;

  constructor(baseConfig: BaseAvataxConfig) {
    const settings = createAvataxSettings({ isSandbox: baseConfig.isSandbox });
    const avataxClient = new Avatax(settings).withSecurity(baseConfig.credentials);

    this.client = avataxClient;
  }

  async createTransaction({ model }: CreateTransactionArgs) {
    return this.client.createTransaction({ model });
  }

  async commitTransaction(args: CommitTransactionArgs) {
    return this.client.commitTransaction(args);
  }

  async voidTransaction({
    transactionCode,
    companyCode,
  }: {
    transactionCode: string;
    companyCode: string;
  }) {
    return this.client.voidTransaction({
      transactionCode,
      companyCode,
      model: { code: VoidReasonCode.DocVoided },
    });
  }

  async validateAddress({ address }: ValidateAddressArgs) {
    return this.client.resolveAddress(address);
  }

  async getTaxCodes() {
    const taxCodeService = new AvataxClientTaxCodeService(this.client);

    return taxCodeService.getTaxCodes();
  }

  async ping() {
    return this.client.ping();
  }

  async getEntityUseCode(useCode: string) {
    return this.client.listEntityUseCodes({
      // https://developer.avalara.com/avatax/filtering-in-rest/
      filter: `code eq ${useCode}`,
    });
  }
}
