import Avatax from "avatax";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import pino from "pino";
import packageJson from "../../../package.json";
import { createLogger } from "../../lib/logger";
import { AvataxConfig } from "./avatax-config";
import { CommitTransactionModel } from "avatax/lib/models/CommitTransactionModel";
import { DocumentType } from "avatax/lib/enums/DocumentType";

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

export class AvataxClient {
  private client: Avatax;
  private logger: pino.Logger;

  constructor(config: AvataxConfig) {
    this.logger = createLogger({ service: "AvataxClient" });
    this.logger.trace("AvataxClient constructor");
    const { username, password } = config;
    const credentials = {
      username,
      password,
    };
    const settings = createAvataxSettings(config);
    const avataxClient = new Avatax(settings).withSecurity(credentials);

    this.logger.trace({ client: avataxClient }, "External Avatax client created");
    this.client = avataxClient;
  }

  async createTransaction({ model }: CreateTransactionArgs) {
    this.logger.debug({ model }, "createTransaction called with:");

    return this.client.createTransaction({ model });
  }

  async commitTransaction(args: CommitTransactionArgs) {
    this.logger.debug(args, "commitTransaction called with:");

    return this.client.commitTransaction(args);
  }

  async ping() {
    this.logger.debug("ping called");
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
}
