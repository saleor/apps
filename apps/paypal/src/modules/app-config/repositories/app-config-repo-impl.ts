import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { RepoError } from "@saleor/pg-config-repository";
import { err, ok, Result } from "neverthrow";
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

interface PayPalConfigData {
  clientId: string;
  clientSecret: string;
  environment: PayPalEnv;
  channelMappings?: Record<string, string>; // channelId -> configId
}

interface ConfigurationRow {
  id: string;
  tenant: string;
  app_name: string;
  configurations: PayPalConfigData;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  app_type: string;
}

class AppConfigRepoImpl implements AppConfigRepo {
  private getTenant(saleorApiUrl: SaleorApiUrl): string {
    // Extract tenant from Saleor API URL (e.g., "https://tenant.saleor.cloud/graphql/" -> "tenant")
    const url = new URL(saleorApiUrl);
    return url.hostname.split('.')[0] || 'default';
  }

  async getPayPalConfig(args: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<PayPalConfig | null, Error>> {
    try {
      const tenant = this.getTenant(args.saleorApiUrl);
      
      const query = `
        SELECT * FROM saleor_app_configuration 
        WHERE tenant = $1 AND app_name = $2 AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [tenant, 'PayPal']);
      
      if (result.rows.length === 0) {
        return ok(null);
      }

      const row = result.rows[0] as ConfigurationRow;
      const configurations = row.configurations;
      
      const config = PayPalConfig.create({
        id: row.id,
        name: `PayPal Config - ${tenant}`,
        clientId: createPayPalClientId(configurations.clientId),
        clientSecret: createPayPalClientSecret(configurations.clientSecret),
        environment: configurations.environment,
      });

      if (config.isErr()) {
        return err(new Error(`Failed to create PayPal config: ${config.error.message}`));
      }

      return ok(config.value);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async savePayPalConfig(args: {
    appId: string;
    config: PayPalConfig;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, Error>> {
    try {
      const tenant = this.getTenant(args.saleorApiUrl);
      
      const configData: PayPalConfigData = {
        clientId: args.config.clientId,
        clientSecret: args.config.clientSecret,
        environment: args.config.environment,
      };

      const query = `
        INSERT INTO saleor_app_configuration (tenant, app_name, configurations, is_active, app_type, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (tenant, app_name) 
        DO UPDATE SET 
          configurations = $3,
          updated_at = NOW(),
          is_active = $4
      `;
      
      await pool.query(query, [
        tenant,
        'PayPal',
        JSON.stringify(configData),
        true,
        'payment'
      ]);

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async deletePayPalConfig(args: {
    appId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, Error>> {
    try {
      const tenant = this.getTenant(args.saleorApiUrl);
      
      const query = `
        UPDATE saleor_app_configuration 
        SET is_active = false, updated_at = NOW()
        WHERE tenant = $1 AND app_name = $2 AND id = $3
      `;
      
      await pool.query(query, [tenant, 'PayPal', args.configId]);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async saveChannelMapping(args: {
    appId: string;
    channelId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, Error>> {
    try {
      const tenant = this.getTenant(args.saleorApiUrl);
      
      // Get current configuration
      const getQuery = `
        SELECT configurations FROM saleor_app_configuration 
        WHERE tenant = $1 AND app_name = $2 AND id = $3
      `;
      
      const result = await pool.query(getQuery, [tenant, 'PayPal', args.configId]);
      
      if (result.rows.length === 0) {
        return err(new Error('Configuration not found'));
      }

      const currentConfig = result.rows[0].configurations as PayPalConfigData;
      const channelMappings = currentConfig.channelMappings || {};
      channelMappings[args.channelId] = args.configId;

      const updatedConfig: PayPalConfigData = {
        ...currentConfig,
        channelMappings,
      };

      const updateQuery = `
        UPDATE saleor_app_configuration 
        SET configurations = $1, updated_at = NOW()
        WHERE tenant = $2 AND app_name = $3 AND id = $4
      `;
      
      await pool.query(updateQuery, [
        JSON.stringify(updatedConfig),
        tenant,
        'PayPal',
        args.configId
      ]);

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async deleteChannelMapping(args: {
    appId: string;
    channelId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, Error>> {
    try {
      const tenant = this.getTenant(args.saleorApiUrl);
      
      // Get all configurations and remove the channel mapping
      const getQuery = `
        SELECT id, configurations FROM saleor_app_configuration 
        WHERE tenant = $1 AND app_name = $2 AND is_active = true
      `;
      
      const result = await pool.query(getQuery, [tenant, 'PayPal']);
      
      for (const row of result.rows) {
        const currentConfig = row.configurations as PayPalConfigData;
        if (currentConfig.channelMappings && currentConfig.channelMappings[args.channelId]) {
          const updatedMappings = { ...currentConfig.channelMappings };
          delete updatedMappings[args.channelId];

          const updatedConfig: PayPalConfigData = {
            ...currentConfig,
            channelMappings: updatedMappings,
          };

          const updateQuery = `
            UPDATE saleor_app_configuration 
            SET configurations = $1, updated_at = NOW()
            WHERE id = $2
          `;
          
          await pool.query(updateQuery, [JSON.stringify(updatedConfig), row.id]);
        }
      }

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getAllPayPalConfigs(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<PayPalConfig[], Error>> {
    try {
      const tenant = this.getTenant(args.saleorApiUrl);
      
      const query = `
        SELECT * FROM saleor_app_configuration 
        WHERE tenant = $1 AND app_name = $2 AND is_active = true
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [tenant, 'PayPal']);
      const configs: PayPalConfig[] = [];

      for (const row of result.rows) {
        const configRow = row as ConfigurationRow;
        const configurations = configRow.configurations;
        
        const config = PayPalConfig.create({
          id: configRow.id,
          name: `PayPal Config - ${tenant}`,
          clientId: createPayPalClientId(configurations.clientId),
          clientSecret: createPayPalClientSecret(configurations.clientSecret),
          environment: configurations.environment,
        });

        if (config.isOk()) {
          configs.push(config.value);
        }
      }

      return ok(configs);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getAllChannelMappings(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<Array<{ channelId: string; configId: string }>, Error>> {
    try {
      const tenant = this.getTenant(args.saleorApiUrl);
      
      const query = `
        SELECT id, configurations FROM saleor_app_configuration 
        WHERE tenant = $1 AND app_name = $2 AND is_active = true
      `;
      
      const result = await pool.query(query, [tenant, 'PayPal']);
      const mappings: Array<{ channelId: string; configId: string }> = [];

      for (const row of result.rows) {
        const configurations = row.configurations as PayPalConfigData;
        if (configurations.channelMappings) {
          for (const [channelId, configId] of Object.entries(configurations.channelMappings)) {
            mappings.push({ channelId, configId });
          }
        }
      }

      return ok(mappings);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

export const appConfigRepoImpl = new AppConfigRepoImpl();
