import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import {
  GetChannelConfigAccessPattern,
  PgConfigRepository,
  RepoError,
} from "@saleor/pg-config-repository";
import { Result } from "neverthrow";
import { Pool } from "pg";

import { env } from "@/lib/env";
import {
  createPayPalClientId,
  PayPalClientId,
} from "@/modules/paypal/paypal-client-id";
import {
  createPayPalClientSecret,
  PayPalClientSecret,
} from "@/modules/paypal/paypal-client-secret";
import { PayPalEnv } from "@/modules/paypal/paypal-env";

import { PayPalConfig } from "../domain/paypal-config";
import { AppConfigRepo } from "./app-config-repo";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const repo = new PgConfigRepository<PayPalConfig>({
  pool,
  tableName: "paypal_configs",
  mapping: {
    rowToDomainEntity: (row: Record<string, unknown>) => {
      const data = (row.data as Record<string, unknown>) || {};

      const config = PayPalConfig.create({
        id: row.config_id as string,
        name: row.name as string,
        clientId: createPayPalClientId(data.clientId as string),
        clientSecret: createPayPalClientSecret(data.clientSecret as string),
        environment: data.environment as PayPalEnv,
      });

      if (config.isErr()) {
        throw config.error;
      }

      return config.value;
    },
    domainEntityToRow: (config: PayPalConfig) => {
      return {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        environment: config.environment,
      };
    },
  },
});

class AppConfigRepoImpl implements AppConfigRepo {
  async getPayPalConfig(
    access: GetChannelConfigAccessPattern,
  ): Promise<Result<PayPalConfig | null, InstanceType<typeof RepoError>>> {
    return repo.getChannelConfig(access);
  }

  async savePayPalConfig(args: {
    appId: string;
    config: PayPalConfig;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    return repo.saveChannelConfig(args);
  }

  async deletePayPalConfig(args: {
    appId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    return repo.deleteChannelConfig(args);
  }

  async saveChannelMapping(args: {
    appId: string;
    channelId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    return repo.saveChannelMapping(args);
  }

  async deleteChannelMapping(args: {
    appId: string;
    channelId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    return repo.deleteChannelMapping(args);
  }

  async getAllPayPalConfigs(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<PayPalConfig[], InstanceType<typeof RepoError>>> {
    return repo.getAllChannelConfigs(args);
  }

  async getAllChannelMappings(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<
    Result<
      Array<{
        channelId: string;
        configId: string;
      }>,
      InstanceType<typeof RepoError>
    >
  > {
    return repo.getAllChannelMappings(args);
  }
}

export const appConfigRepoImpl = new AppConfigRepoImpl();
