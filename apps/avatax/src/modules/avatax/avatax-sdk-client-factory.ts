import Avatax from "avatax";
import { LogOptions } from "avatax/lib/utils/logger";

import { env } from "@/env";

type AvataxSettings = {
  appName: string;
  appVersion: string;
  environment: "sandbox" | "production";
  machineName: string;
  timeout: number;
  logOptions?: LogOptions;
};

const defaultAvataxSettings: AvataxSettings = {
  appName: env.AVATAX_CLIENT_APP_NAME,
  appVersion: env.AVATAX_CLIENT_APP_VERSION,
  environment: "sandbox",
  machineName: "tax-app",
  timeout: env.AVATAX_CLIENT_TIMEOUT,
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
