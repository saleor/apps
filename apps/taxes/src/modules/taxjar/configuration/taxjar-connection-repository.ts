import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import {
  ProviderConnections,
  providerConnectionsSchema,
} from "../../provider-connections/provider-connections";
import { TAX_PROVIDER_KEY } from "../../provider-connections/public-provider-connections.service";
import { TaxJarConfig, TaxJarConnection, taxJarConnection } from "../taxjar-connection-schema";
import { createLogger } from "../../../logger";

const getSchema = taxJarConnection.strict();

export class TaxJarConnectionRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger = createLogger("TaxJarConnectionRepository", {
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

  private filterTaxJarConnections(connections: ProviderConnections): TaxJarConnection[] {
    return connections.filter(
      (connection) => connection.provider === "taxjar",
    ) as TaxJarConnection[];
  }

  async getAll(): Promise<TaxJarConnection[]> {
    const { data } = await this.crudSettingsManager.readAll();

    const connections = providerConnectionsSchema.parse(data);

    const taxJarConnections = this.filterTaxJarConnections(connections);

    return taxJarConnections;
  }

  async getById(id: string): Promise<TaxJarConnection> {
    const { data } = await this.crudSettingsManager.readById(id);

    const connection = getSchema.parse(data);

    return connection;
  }

  async post(config: TaxJarConfig): Promise<{ id: string }> {
    const result = await this.crudSettingsManager.create({
      provider: "taxjar",
      config: config,
    });

    return result.data;
  }

  async patch(id: string, input: Pick<TaxJarConnection, "config">): Promise<void> {
    return this.crudSettingsManager.updateById(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.crudSettingsManager.delete(id);
  }
}
