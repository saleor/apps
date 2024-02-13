import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import {
  ProviderConnections,
  providerConnectionsSchema,
} from "../../provider-connections/provider-connections";
import { TAX_PROVIDER_KEY } from "../../provider-connections/public-provider-connections.service";
import {
  AvataxConfig,
  AvataxConnection,
  avataxConnectionSchema,
} from "../avatax-connection-schema";
import { createLogger } from "../../../logger";

const getSchema = avataxConnectionSchema.strict();

export class AvataxConnectionRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger = createLogger("AvataxConnectionRepository", {
    metadataKey: TAX_PROVIDER_KEY,
  });
  constructor(
    private settingsManager: EncryptedMetadataManager,
    private saleorApiUrl: string,
  ) {
    this.crudSettingsManager = new CrudSettingsManager(
      settingsManager,
      saleorApiUrl,
      TAX_PROVIDER_KEY,
    );
  }

  private filterAvataxConnections(connections: ProviderConnections): AvataxConnection[] {
    return connections.filter(
      (connection) => connection.provider === "avatax",
    ) as AvataxConnection[];
  }

  async getAll(): Promise<AvataxConnection[]> {
    const { data } = await this.crudSettingsManager.readAll();

    const connections = providerConnectionsSchema.parse(data);

    const avataxConnections = this.filterAvataxConnections(connections);

    return avataxConnections;
  }

  async get(id: string): Promise<AvataxConnection> {
    const { data } = await this.crudSettingsManager.readById(id);

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

  async patch(id: string, input: Pick<AvataxConnection, "config">): Promise<void> {
    return this.crudSettingsManager.updateById(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.crudSettingsManager.delete(id);
  }
}
