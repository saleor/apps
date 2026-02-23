import { type DeepPartial } from "@trpc/server";
import { Client } from "urql";

import { type AvataxConfig } from "../avatax-connection-schema";
import { type AvataxObfuscator } from "../avatax-obfuscator";
import { type AvataxConnectionService } from "./avatax-connection.service";

export class PublicAvataxConnectionService {
  constructor(
    private avataxConnectionService: AvataxConnectionService,
    private avataxObfuscator: AvataxObfuscator,
  ) {}

  async getAll() {
    const connections = await this.avataxConnectionService.getAll();

    return this.avataxObfuscator.obfuscateAvataxConnections(connections);
  }

  async getById(id: string) {
    const connection = await this.avataxConnectionService.getById(id);

    return this.avataxObfuscator.obfuscateAvataxConnection(connection);
  }

  async create(config: AvataxConfig) {
    return this.avataxConnectionService.create(config);
  }

  async update(id: string, config: DeepPartial<AvataxConfig>) {
    return this.avataxConnectionService.update(id, config);
  }

  async delete(id: string) {
    return this.avataxConnectionService.delete(id);
  }

  async verifyConnections() {
    const connections = await this.avataxConnectionService.getAll();

    if (connections.length === 0) {
      throw new Error("No AvaTax connections found");
    }
  }
}
