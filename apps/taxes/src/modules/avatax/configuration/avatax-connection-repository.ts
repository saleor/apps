import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { TaxProvidersV1toV2MigrationManager } from "../../../../scripts/migrations/tax-providers-migration-v1-to-v2";
import { createLogger, Logger } from "../../../lib/logger";
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

const getSchema = avataxConnectionSchema.strict();

export class AvataxConnectionRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(private settingsManager: EncryptedMetadataManager, private saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager(
      settingsManager,
      saleorApiUrl,
      TAX_PROVIDER_KEY
    );
    this.logger = createLogger({
      name: "AvataxConnectionRepository",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  private filterAvataxConnections(connections: ProviderConnections): AvataxConnection[] {
    return connections.filter(
      (connection) => connection.provider === "avatax"
    ) as AvataxConnection[];
  }

  async getAll(): Promise<AvataxConnection[]> {
    const { data } = await this.crudSettingsManager.readAll();
    /*
     * * migration logic start
     * // todo: remove after migration
     */
    const migrationManager = new TaxProvidersV1toV2MigrationManager(
      this.settingsManager,
      this.saleorApiUrl
    );

    const migratedConfig = await migrationManager.migrateIfNeeded();

    if (migratedConfig) {
      this.logger.info("Config migrated", migratedConfig);
      return this.filterAvataxConnections(migratedConfig);
    }

    this.logger.info("Config is up to date, no need to migrate.");
    /*
     * * migration logic end
     */

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
