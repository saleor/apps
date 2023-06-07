import { Obfuscator } from "../../lib/obfuscator";
import { AvataxConfig, AvataxInstanceConfig } from "./avatax-config";

export class AvataxConfigObfuscator {
  private obfuscator = new Obfuscator();

  obfuscateAvataxConfig = (config: AvataxConfig): AvataxConfig => {
    return {
      ...config,
      credentials: {
        ...config.credentials,
        username: this.obfuscator.obfuscate(config.credentials.username),
        password: this.obfuscator.obfuscate(config.credentials.password),
      },
    };
  };

  obfuscateAvataxInstance = (instance: AvataxInstanceConfig): AvataxInstanceConfig => ({
    ...instance,
    config: this.obfuscateAvataxConfig(instance.config),
  });

  obfuscateAvataxInstances = (instances: AvataxInstanceConfig[]): AvataxInstanceConfig[] =>
    instances.map((instance) => this.obfuscateAvataxInstance(instance));

  filterOutObfuscated = (data: AvataxConfig) => {
    const { credentials, ...rest } = data;
    const isPasswordObfuscated = this.obfuscator.isObfuscated(credentials.password);
    const isUsernameObfuscated = this.obfuscator.isObfuscated(credentials.username);
    const isBothObfuscated = isPasswordObfuscated && isUsernameObfuscated;

    if (isBothObfuscated) {
      return rest;
    }

    return {
      ...rest,
      credentials: {
        ...(!isPasswordObfuscated && { password: credentials.password }),
        ...(!isUsernameObfuscated && { username: credentials.username }),
      },
    };
  };
}
