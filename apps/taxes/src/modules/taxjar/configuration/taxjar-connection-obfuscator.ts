import { Obfuscator } from "../../../lib/obfuscator";
import { TaxJarConfig, TaxJarConnection } from "../taxjar-connection-schema";

export class TaxJarConnectionObfuscator {
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

  obfuscateTaxJarConnection = (connection: TaxJarConnection): TaxJarConnection => ({
    ...connection,
    config: this.obfuscateTaxJarConfig(connection.config),
  });

  obfuscateTaxJarConnections = (connections: TaxJarConnection[]): TaxJarConnection[] =>
    connections.map(this.obfuscateTaxJarConnection);

  filterOutObfuscated = (data: TaxJarConfig) => {
    const { credentials, ...rest } = data;
    const isApiKeyObfuscated = this.obfuscator.isObfuscated(credentials.apiKey);

    if (isApiKeyObfuscated) {
      return rest;
    }

    return data;
  };
}
