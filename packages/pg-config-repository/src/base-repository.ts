import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { err, ok, Result } from "neverthrow";
import { Pool, PoolClient } from "pg";

import {
  BaseAccessPattern,
  BaseConfig,
  ConfigByChannelIdAccessPattern,
  ConfigByConfigIdAccessPattern,
  GenericRepo,
  GetChannelConfigAccessPattern,
  RepoError,
} from "./types";

type Settings<ChannelConfig extends BaseConfig> = {
  pool: Pool;
  tableName: string;
  mapping: {
    rowToDomainEntity: (row: Record<string, unknown>) => ChannelConfig;
    domainEntityToRow: (config: ChannelConfig) => Record<string, unknown>;
  };
};

export class PgConfigRepository<ChannelConfig extends BaseConfig>
  implements GenericRepo<ChannelConfig>
{
  private settings: Settings<ChannelConfig>;

  constructor(settings: Settings<ChannelConfig>) {
    this.settings = settings;
  }

  private getPK({ saleorApiUrl, appId }: { saleorApiUrl: SaleorApiUrl; appId: string }) {
    return `${saleorApiUrl}#${appId}`;
  }

  private getSKforSpecificItem({ configId }: { configId: string }) {
    return `CONFIG_ID#${configId}`;
  }

  private getSKforSpecificChannel({ channelId }: { channelId: string }) {
    return `CHANNEL_ID#${channelId}`;
  }

  private async fetchConfigIdFromChannelId(
    access: ConfigByChannelIdAccessPattern,
  ): Promise<string | null> {
    const pk = this.getPK(access);
    const sk = this.getSKforSpecificChannel({ channelId: access.channelId });

    const query = {
      text: `SELECT config_id FROM ${this.settings.tableName} WHERE pk = $1 AND sk = $2`,
      values: [pk, sk],
    };

    try {
      const result = await this.settings.pool.query(query);
      return result.rows[0]?.config_id ?? null;
    } catch (error) {
      throw new RepoError("Failed to fetch config ID from channel ID", { cause: error });
    }
  }

  private async fetchConfigByItsId(
    access: ConfigByConfigIdAccessPattern,
  ): Promise<Record<string, unknown> | null> {
    const pk = this.getPK(access);
    const sk = this.getSKforSpecificItem({ configId: access.configId });

    const query = {
      text: `SELECT * FROM ${this.settings.tableName} WHERE pk = $1 AND sk = $2 AND entity_type = 'config'`,
      values: [pk, sk],
    };

    try {
      const result = await this.settings.pool.query(query);
      return result.rows[0] ?? null;
    } catch (error) {
      throw new RepoError("Failed to fetch config by ID", { cause: error });
    }
  }

  async getChannelConfig(
    access: GetChannelConfigAccessPattern,
  ): Promise<Result<ChannelConfig | null, InstanceType<typeof RepoError>>> {
    try {
      const channelId = "channelId" in access ? access.channelId : undefined;
      let configId = "configId" in access ? access.configId : undefined;

      if (!configId && channelId) {
        configId = await this.fetchConfigIdFromChannelId({
          appId: access.appId,
          saleorApiUrl: access.saleorApiUrl,
          channelId,
        });

        if (!configId) {
          return ok(null);
        }
      }

      if (configId) {
        const row = await this.fetchConfigByItsId({
          appId: access.appId,
          saleorApiUrl: access.saleorApiUrl,
          configId,
        });

        if (!row) {
          return ok(null);
        }

        return ok(this.settings.mapping.rowToDomainEntity(row));
      }

      return err(
        new RepoError(
          "Invalid access pattern provided. Either channelId or configId must be provided.",
        ),
      );
    } catch (error) {
      return err(
        error instanceof RepoError ? error : new RepoError("Unexpected error", { cause: error }),
      );
    }
  }

  async saveChannelConfig(args: {
    appId: string;
    config: ChannelConfig;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    try {
      const pk = this.getPK(args);
      const sk = this.getSKforSpecificItem({ configId: args.config.id });
      const data = this.settings.mapping.domainEntityToRow(args.config);

      const query = {
        text: `
          INSERT INTO ${this.settings.tableName}
            (pk, sk, entity_type, config_id, name, data, created_at, modified_at)
          VALUES ($1, $2, 'config', $3, $4, $5, NOW(), NOW())
          ON CONFLICT (pk, sk)
          DO UPDATE SET
            name = EXCLUDED.name,
            data = EXCLUDED.data,
            modified_at = NOW()
        `,
        values: [pk, sk, args.config.id, args.config.name, JSON.stringify(data)],
      };

      await this.settings.pool.query(query);
      return ok(null);
    } catch (error) {
      return err(new RepoError("Failed to save channel config", { cause: error }));
    }
  }

  async saveChannelMapping(args: {
    appId: string;
    channelId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    try {
      const pk = this.getPK(args);
      const sk = this.getSKforSpecificChannel({ channelId: args.channelId });

      const query = {
        text: `
          INSERT INTO ${this.settings.tableName}
            (pk, sk, entity_type, channel_id, config_id, created_at, modified_at)
          VALUES ($1, $2, 'mapping', $3, $4, NOW(), NOW())
          ON CONFLICT (pk, sk)
          DO UPDATE SET
            config_id = EXCLUDED.config_id,
            modified_at = NOW()
        `,
        values: [pk, sk, args.channelId, args.configId],
      };

      await this.settings.pool.query(query);
      return ok(null);
    } catch (error) {
      return err(new RepoError("Failed to save channel mapping", { cause: error }));
    }
  }

  async deleteChannelConfig(args: {
    appId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    try {
      const pk = this.getPK(args);
      const sk = this.getSKforSpecificItem({ configId: args.configId });

      const query = {
        text: `DELETE FROM ${this.settings.tableName} WHERE pk = $1 AND sk = $2`,
        values: [pk, sk],
      };

      await this.settings.pool.query(query);
      return ok(null);
    } catch (error) {
      return err(new RepoError("Failed to delete channel config", { cause: error }));
    }
  }

  async deleteChannelMapping(args: {
    appId: string;
    channelId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    try {
      const pk = this.getPK(args);
      const sk = this.getSKforSpecificChannel({ channelId: args.channelId });

      const query = {
        text: `DELETE FROM ${this.settings.tableName} WHERE pk = $1 AND sk = $2`,
        values: [pk, sk],
      };

      await this.settings.pool.query(query);
      return ok(null);
    } catch (error) {
      return err(new RepoError("Failed to delete channel mapping", { cause: error }));
    }
  }

  async getAllChannelConfigs(
    access: BaseAccessPattern,
  ): Promise<Result<ChannelConfig[], InstanceType<typeof RepoError>>> {
    try {
      const pk = this.getPK(access);

      const query = {
        text: `SELECT * FROM ${this.settings.tableName} WHERE pk = $1 AND entity_type = 'config'`,
        values: [pk],
      };

      const result = await this.settings.pool.query(query);
      const configs = result.rows.map((row) => this.settings.mapping.rowToDomainEntity(row));

      return ok(configs);
    } catch (error) {
      return err(new RepoError("Failed to get all channel configs", { cause: error }));
    }
  }

  async getAllChannelMappings(access: BaseAccessPattern): Promise<
    Result<
      Array<{
        channelId: string;
        configId: string;
      }>,
      InstanceType<typeof RepoError>
    >
  > {
    try {
      const pk = this.getPK(access);

      const query = {
        text: `SELECT channel_id, config_id FROM ${this.settings.tableName} WHERE pk = $1 AND entity_type = 'mapping'`,
        values: [pk],
      };

      const result = await this.settings.pool.query(query);
      const mappings = result.rows.map((row) => ({
        channelId: row.channel_id as string,
        configId: row.config_id as string,
      }));

      return ok(mappings);
    } catch (error) {
      return err(new RepoError("Failed to get all channel mappings", { cause: error }));
    }
  }
}
