import Avatax from "avatax";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import packageJson from "../../../package.json";
import { logger } from "../../lib/logger";
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

  constructor(config: AvataxConfig) {
    logger.debug("AvataxClient constructor");
    const { username, password } = config;
    const credentials = {
      username,
      password,
    };
    const settings = createAvataxSettings(config);
    const avataxClient = new Avatax(settings).withSecurity(credentials);
    logger.info({ client: avataxClient }, "External Avatax client created");
    this.client = avataxClient;
  }

  async fetchTaxesForOrder(model: CreateTransactionModel) {
    return this.client.createTransaction({ model });
  }

  async ping() {
    try {
      const result = await this.client.ping();

      return {
        authenticated: result.authenticated,
        ...(!result.authenticated && {
          error: "Avalara was not able to authenticate with the provided credentials.",
        }),
      };
    } catch (error) {}
    return {
      authenticated: false,
      error: "Avalara was not able to authenticate with the provided credentials.",
    };
  }
}
