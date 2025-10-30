import { Pool } from "pg";
import { Result, ok, err } from "neverthrow";
import { GlobalPayPalConfig, PayPalEnvironment } from "./global-paypal-config";

/**
 * Repository for managing global WSM PayPal configuration
 */
export class GlobalPayPalConfigRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  static create(pool: Pool): GlobalPayPalConfigRepository {
    return new GlobalPayPalConfigRepository(pool);
  }

  /**
   * Get the currently active global PayPal configuration
   */
  async getActiveConfig(): Promise<Result<GlobalPayPalConfig | null, Error>> {
    try {
      const query = `
        SELECT id, client_id, client_secret, partner_merchant_id, environment, is_active, created_at, updated_at
        FROM wsm_global_paypal_config
        WHERE is_active = TRUE
        LIMIT 1
      `;

      const result = await this.pool.query(query);

      if (result.rows.length === 0) {
        return ok(null);
      }

      const row = result.rows[0];
      const configResult = GlobalPayPalConfig.create({
        id: row.id,
        clientId: row.client_id,
        clientSecret: row.client_secret,
        partnerMerchantId: row.partner_merchant_id,
        environment: row.environment as PayPalEnvironment,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });

      if (configResult.isErr()) {
        return err(configResult.error);
      }

      return ok(configResult.value);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Failed to get active config"));
    }
  }

  /**
   * Create or update global PayPal configuration
   * Deactivates all existing configs and creates a new active one
   */
  async upsertConfig(data: {
    clientId: string;
    clientSecret: string;
    partnerMerchantId?: string | null;
    environment: PayPalEnvironment;
  }): Promise<Result<GlobalPayPalConfig, Error>> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Deactivate all existing configs
      await client.query(`
        UPDATE wsm_global_paypal_config
        SET is_active = FALSE
      `);

      // Insert new config
      const insertQuery = `
        INSERT INTO wsm_global_paypal_config (client_id, client_secret, partner_merchant_id, environment, is_active)
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING id, client_id, client_secret, partner_merchant_id, environment, is_active, created_at, updated_at
      `;

      const result = await client.query(insertQuery, [
        data.clientId,
        data.clientSecret,
        data.partnerMerchantId ?? null,
        data.environment,
      ]);

      await client.query("COMMIT");

      const row = result.rows[0];
      const configResult = GlobalPayPalConfig.create({
        id: row.id,
        clientId: row.client_id,
        clientSecret: row.client_secret,
        partnerMerchantId: row.partner_merchant_id,
        environment: row.environment as PayPalEnvironment,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });

      if (configResult.isErr()) {
        return err(configResult.error);
      }

      return ok(configResult.value);
    } catch (error) {
      await client.query("ROLLBACK");
      return err(error instanceof Error ? error : new Error("Failed to upsert config"));
    } finally {
      client.release();
    }
  }

  /**
   * Test if credentials are valid by attempting to get an OAuth token from PayPal
   */
  async testCredentials(data: {
    clientId: string;
    clientSecret: string;
    environment: PayPalEnvironment;
  }): Promise<Result<boolean, Error>> {
    try {
      const baseUrl =
        data.environment === "SANDBOX"
          ? "https://api-m.sandbox.paypal.com"
          : "https://api-m.paypal.com";

      const auth = Buffer.from(`${data.clientId}:${data.clientSecret}`).toString("base64");

      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        const errorText = await response.text();
        return err(new Error(`PayPal API error: ${response.status} - ${errorText}`));
      }

      const data_response = await response.json();

      if (data_response.access_token) {
        return ok(true);
      }

      return err(new Error("No access token received from PayPal"));
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Failed to test credentials"));
    }
  }

  /**
   * Get count of connected tenants (for admin dashboard)
   */
  async getConnectedTenantsCount(): Promise<Result<number, Error>> {
    try {
      const query = `
        SELECT COUNT(DISTINCT saleor_api_url) as count
        FROM paypal_merchant_onboarding
        WHERE paypal_merchant_id IS NOT NULL
      `;

      const result = await this.pool.query(query);
      return ok(parseInt(result.rows[0].count, 10));
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Failed to get tenants count"));
    }
  }
}
