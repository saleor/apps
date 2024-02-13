import { DeepPartial } from "@trpc/server";
import { Client } from "urql";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarConnectionObfuscator } from "./taxjar-connection-obfuscator";
import { TaxJarConnectionService } from "./taxjar-connection.service";

export class PublicTaxJarConnectionService {
  private readonly connectionService: TaxJarConnectionService;
  private readonly obfuscator = new TaxJarConnectionObfuscator();
  constructor({
    client,
    appId,
    saleorApiUrl,
  }: {
    client: Client;
    appId: string;
    saleorApiUrl: string;
  }) {
    this.connectionService = new TaxJarConnectionService({ client, appId, saleorApiUrl });
    this.obfuscator = new TaxJarConnectionObfuscator();
  }

  async getAll() {
    const connections = await this.connectionService.getAll();

    return this.obfuscator.obfuscateTaxJarConnections(connections);
  }

  async getById(id: string) {
    const connection = await this.connectionService.getById(id);

    return this.obfuscator.obfuscateTaxJarConnection(connection);
  }

  async create(config: TaxJarConfig) {
    return this.connectionService.create(config);
  }

  async update(id: string, config: DeepPartial<TaxJarConfig>) {
    return this.connectionService.update(id, config);
  }

  async delete(id: string) {
    return this.connectionService.delete(id);
  }

  async verifyConnections() {
    const connections = await this.connectionService.getAll();

    if (connections.length === 0) {
      throw new Error("No TaxJar connections found");
    }
  }
}
