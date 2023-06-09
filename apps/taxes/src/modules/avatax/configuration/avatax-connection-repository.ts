import { Client } from "urql";
import { createLogger, Logger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import { providerConnectionsSchema } from "../../provider-connections/provider-connections";
import { TAX_PROVIDER_KEY } from "../../provider-connections/public-provider-connections.service";
import {
  AvataxConfig,
  AvataxConnection,
  avataxConnectionSchema,
} from "../avatax-connection-schema";

const getSchema = avataxConnectionSchema;

export class AvataxConnectionRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(client: Client, appId: string, saleorApiUrl: string) {
    const settingsManager = createSettingsManager(client, appId);

    this.crudSettingsManager = new CrudSettingsManager(
      settingsManager,
      saleorApiUrl,
      TAX_PROVIDER_KEY
    );
    this.logger = createLogger({
      location: "AvataxConnectionRepository",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll(): Promise<AvataxConnection[]> {
    const { data } = await this.crudSettingsManager.readAll();
    const connections = providerConnectionsSchema.parse(data);

    const avataxConnections = connections.filter(
      (connection) => connection.provider === "avatax"
    ) as AvataxConnection[];

    return avataxConnections;
  }

  async get(id: string): Promise<AvataxConnection> {
    const { data } = await this.crudSettingsManager.read(id);

    const connection = getSchema.parse(data);

    return connection;
  }

  async post(config: AvataxConfig): Promise<{ id: string }> {
    const result = await this.crudSettingsManager.create({
      provider: "avatax",
      config: config,
    });

    return result.data;
  }

  async patch(id: string, input: AvataxConfig): Promise<void> {
    return this.crudSettingsManager.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.crudSettingsManager.delete(id);
  }
}
