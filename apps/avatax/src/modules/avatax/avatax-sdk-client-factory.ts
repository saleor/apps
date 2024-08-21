import Avatax from "avatax";
import { LogOptions } from "avatax/lib/utils/logger";

import packageJson from "../../../package.json";

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
  timeout: parseInt(process.env.AVATAX_CLIENT_TIMEOUT ?? "15000", 10),
};

const createAvataxSettings = ({ isSandbox }: { isSandbox: boolean }): AvataxSettings => {
  const settings: AvataxSettings = {
    ...defaultAvataxSettings,
    environment: isSandbox ? "sandbox" : "production",
  };

  return settings;
};

export interface IAvataxSdkClientFactory {
  createClient(opts: {
    isSandbox: boolean;
    credentials: {
      username: string;
      password: string;
    };
  }): Avatax;
}

export class AvataxSdkClientFactory implements IAvataxSdkClientFactory {
  createClient(config: {
    isSandbox: boolean;
    credentials: {
      username: string;
      password: string;
    };
  }): Avatax {
    const settings = createAvataxSettings({ isSandbox: config.isSandbox });
    const avataxClient = new Avatax(settings).withSecurity(config.credentials);

    return avataxClient;
  }
}
