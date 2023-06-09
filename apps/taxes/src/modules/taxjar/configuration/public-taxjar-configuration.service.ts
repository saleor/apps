import { DeepPartial } from "@trpc/server";
import { Client } from "urql";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarConfigObfuscator } from "./taxjar-config-obfuscator";
import { TaxJarConnectionService } from "./taxjar-connection.service";

export class PublicTaxJarConfigurationService {
  private readonly connectionService: TaxJarConnectionService;
  private readonly obfuscator = new TaxJarConfigObfuscator();
  constructor(client: Client, saleorApiUrl: string) {
    this.connectionService = new TaxJarConnectionService(client, saleorApiUrl);
    this.obfuscator = new TaxJarConfigObfuscator();
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
}
