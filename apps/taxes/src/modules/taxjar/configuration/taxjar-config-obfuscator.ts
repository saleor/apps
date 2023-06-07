import { Obfuscator } from "../../../lib/obfuscator";
import { TaxJarConfig, TaxJarInstanceConfig } from "../taxjar-config";

export class TaxJarConfigObfuscator {
  private obfuscator = new Obfuscator();
  obfuscateTaxJarConfig = (config: TaxJarConfig): TaxJarConfig => {
    return {
      ...config,
      credentials: {
        ...config.credentials,
        apiKey: this.obfuscator.obfuscate(config.credentials.apiKey),
      },
    };
  };

  obfuscateInstance = (instance: TaxJarInstanceConfig): TaxJarInstanceConfig => ({
    ...instance,
    config: this.obfuscateTaxJarConfig(instance.config),
  });

  obfuscateInstances = (instances: TaxJarInstanceConfig[]): TaxJarInstanceConfig[] =>
    instances.map(this.obfuscateInstance);

  filterOutObfuscated = (data: TaxJarConfig) => {
    const { credentials, ...rest } = data;
    const isApiKeyObfuscated = this.obfuscator.isObfuscated(credentials.apiKey);

    if (isApiKeyObfuscated) {
      return rest;
    }

    return data;
  };
}
