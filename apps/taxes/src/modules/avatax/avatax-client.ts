import Avatax from "avatax";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import packageJson from "../../../package.json";
import { createLogger, Logger } from "../../lib/logger";
import { AvataxConfig } from "./avatax-connection-schema";
import { CommitTransactionModel } from "avatax/lib/models/CommitTransactionModel";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";
import { AvataxClientTaxCodeService } from "./avatax-client-tax-code.service";

type AvataxSettings = {
  appName: string;
  appVersion: string;
  environment: "sandbox" | "production";
  machineName: string;
  timeout: number;
  logOptions?: {
    logEnabled: boolean;
    logLevel: number;
    logRequestAndResponseInfo: boolean;
  };
};

const defaultAvataxSettings: AvataxSettings = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  environment: "sandbox",
  machineName: "tax-app",
  timeout: 5000,
};

const createAvataxSettings = (config: AvataxConfig): AvataxSettings => {
  const settings: AvataxSettings = {
    ...defaultAvataxSettings,
    environment: config.isSandbox ? "sandbox" : "production",
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

export class AvataxClient {
  private client: Avatax;
  private logger: Logger;

  constructor(config: AvataxConfig) {
    this.logger = createLogger({ name: "AvataxClient" });
    const settings = createAvataxSettings(config);
    const avataxClient = new Avatax(settings).withSecurity(config.credentials);

    this.client = avataxClient;
  }

  async createTransaction({ model }: CreateTransactionArgs) {
    return this.client.createTransaction({ model });
  }

  async commitTransaction(args: CommitTransactionArgs) {
    return this.client.commitTransaction(args);
  }

  async validateAddress({ address }: ValidateAddressArgs) {
    return this.client.resolveAddress(address);
  }

  async getTaxCodes() {
    const taxCodeService = new AvataxClientTaxCodeService(this.client);

    return taxCodeService.getTaxCodes();
  }
}
