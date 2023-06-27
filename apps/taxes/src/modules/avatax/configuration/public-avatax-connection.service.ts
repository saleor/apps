import { DeepPartial } from "@trpc/server";
import { Client } from "urql";
import { AvataxConnectionObfuscator } from "../avatax-connection-obfuscator";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxConnectionService } from "./avatax-connection.service";

export class PublicAvataxConnectionService {
  private readonly connectionService: AvataxConnectionService;
  private readonly obfuscator: AvataxConnectionObfuscator;
  constructor(client: Client, appId: string, saleorApiUrl: string) {
    this.connectionService = new AvataxConnectionService(client, appId, saleorApiUrl);
    this.obfuscator = new AvataxConnectionObfuscator();
  }

  async getAll() {
    const connections = await this.connectionService.getAll();

    return this.obfuscator.obfuscateAvataxConnections(connections);
  }

  async getById(id: string) {
    const connection = await this.connectionService.getById(id);

    return this.obfuscator.obfuscateAvataxConnection(connection);
  }

  async create(config: AvataxConfig) {
    return this.connectionService.create(config);
  }

  async update(id: string, config: DeepPartial<AvataxConfig>) {
    return this.connectionService.update(id, config);
  }

  async delete(id: string) {
    return this.connectionService.delete(id);
  }

  async verifyConnections() {
    const connections = await this.connectionService.getAll();

    if (connections.length === 0) {
      throw new Error("No Avatax connections found");
    }
  }
}
