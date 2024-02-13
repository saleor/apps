import { Obfuscator } from "../../lib/obfuscator";
import { AvataxConfig, AvataxConnection } from "./avatax-connection-schema";

export class AvataxObfuscator {
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

  obfuscateAvataxConnection = (connection: AvataxConnection): AvataxConnection => ({
    ...connection,
    config: this.obfuscateAvataxConfig(connection.config),
  });

  obfuscateAvataxConnections = (connections: AvataxConnection[]): AvataxConnection[] =>
    connections.map((connection) => this.obfuscateAvataxConnection(connection));

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
