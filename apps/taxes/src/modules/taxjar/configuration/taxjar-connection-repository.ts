import { Client } from "urql";
import { createLogger, Logger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import { providerConnectionsSchema } from "../../provider-connections/provider-connections";
import { TAX_PROVIDER_KEY } from "../../provider-connections/public-provider-connections.service";
import { TaxJarConfig, TaxJarConnection, taxJarConnection } from "../taxjar-connection-schema";

const getSchema = taxJarConnection;

export class TaxJarConnectionRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(client: Client, saleorApiUrl: string) {
    const settingsManager = createSettingsManager(client);

    this.crudSettingsManager = new CrudSettingsManager(
      settingsManager,
      saleorApiUrl,
      TAX_PROVIDER_KEY
    );
    this.logger = createLogger({
      location: "TaxJarConnectionRepository",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll(): Promise<TaxJarConnection[]> {
    const { data } = await this.crudSettingsManager.readAll();

    const connections = providerConnectionsSchema.parse(data);

    const taxJarConnections = connections.filter(
      (connection) => connection.provider === "taxjar"
    ) as TaxJarConnection[];

    return taxJarConnections;
  }

  async get(id: string): Promise<TaxJarConnection> {
    const { data } = await this.crudSettingsManager.read(id);

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

  async patch(id: string, input: TaxJarConfig): Promise<void> {
    return this.crudSettingsManager.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.crudSettingsManager.delete(id);
  }
}
