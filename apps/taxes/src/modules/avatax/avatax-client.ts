import Avatax from "avatax";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import packageJson from "../../../package.json";
import { createLogger, Logger } from "../../lib/logger";
import { AvataxConfig } from "./avatax-config";
import { CommitTransactionModel } from "avatax/lib/models/CommitTransactionModel";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";

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
    this.logger = createLogger({ service: "AvataxClient" });
    this.logger.trace("AvataxClient constructor");
    const settings = createAvataxSettings(config);
    const avataxClient = new Avatax(settings).withSecurity(config.credentials);

    this.logger.trace({ client: avataxClient }, "External Avatax client created");
    this.client = avataxClient;
  }

  async createTransaction({ model }: CreateTransactionArgs) {
    this.logger.trace({ model }, "createTransaction called with:");

    return this.client.createTransaction({ model });
  }

  async commitTransaction(args: CommitTransactionArgs) {
    this.logger.trace(args, "commitTransaction called with:");

    return this.client.commitTransaction(args);
  }

  async ping() {
    this.logger.trace("ping called");
    try {
      const result = await this.client.ping();

      return {
        authenticated: result.authenticated,
        ...(!result.authenticated && {
          error: "Avatax was not able to authenticate with the provided credentials.",
        }),
      };
    } catch (error) {
      return {
        authenticated: false,
        error: "Avatax was not able to authenticate with the provided credentials.",
      };
    }
  }

  async validateAddress({ address }: ValidateAddressArgs) {
    this.logger.trace({ address }, "validateAddress called with:");

    return this.client.resolveAddress(address);
  }
}
