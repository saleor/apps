import * as Typesense from "typesense";
import { createLogger } from "../logger";

export interface ITypesenseCredentialsVerifier {
  verifyCredentials(params: {
    apiKey: string;
    host: string;
    port: number;
    protocol: string;
    connectionTimeoutSeconds: number;
  }): Promise<void>;
}

export class TypesenseCredentialsVerifier implements ITypesenseCredentialsVerifier {
  private logger = createLogger("TypesenseCredentialsVerifier");

  async verifyCredentials(params: {
    apiKey: string;
    host: string;
    port: number;
    protocol: string;
    connectionTimeoutSeconds: number;
  }) {
    this.logger.debug("Verifying Typesense credentials");
    console.log("Verifying Typesense credentials");
    console.log(params);
    const client = new Typesense.Client({
      nodes: [
        {
          host: params.host,
          port: params.port,
          protocol: params.protocol,
        },
      ],
      apiKey: params.apiKey,
      connectionTimeoutSeconds: params.connectionTimeoutSeconds,
    });

    try {
      await client.health.retrieve();
    } catch (error) {
      this.logger.debug("Typesense call failed");

      throw new Error("Failed to verify Typesense credentials");
    }
  }
}

export const typesenseCredentialsVerifier = new TypesenseCredentialsVerifier();
