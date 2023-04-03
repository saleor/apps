import Avatax from "avatax";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import pino from "pino";
import packageJson from "../../../package.json";
import { createLogger } from "../../lib/logger";
import { AvataxConfig } from "./avatax-config";

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

  async createTransaction(model: CreateTransactionModel) {
    this.logger.debug({ model }, "fetchTaxesForOrder called with:");

    return this.client.createTransaction({ model });
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
