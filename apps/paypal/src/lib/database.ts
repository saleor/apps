import { Pool } from "pg";

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    pool.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("PostgreSQL pool error:", err);
    });
  }

  return pool;
};

export const initializeDatabase = async (): Promise<void> => {
  const pool = getPool();

  const createTableQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS saleor_app_configuration (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant TEXT NOT NULL,              -- Saleor API URL
      app_name TEXT NOT NULL,            -- App name (PayPal)
      configurations JSONB NOT NULL,     -- AuthData JSON for APL only
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT saleor_apl_api_url_app_id_unique UNIQUE (tenant, app_name)
    );

    CREATE INDEX IF NOT EXISTS idx_saleor_app_configuration_tenant ON saleor_app_configuration(tenant);
    CREATE INDEX IF NOT EXISTS idx_saleor_app_configuration_app_name ON saleor_app_configuration(app_name);
    CREATE INDEX IF NOT EXISTS idx_saleor_app_configuration_is_active ON saleor_app_configuration(is_active);

    -- PayPal Merchant Onboarding Table
    CREATE TABLE IF NOT EXISTS paypal_merchant_onboarding (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      saleor_api_url TEXT NOT NULL,
      tracking_id TEXT NOT NULL,
      paypal_merchant_id TEXT,
      partner_referral_id TEXT,
      merchant_email TEXT,
      merchant_country TEXT,
      onboarding_status TEXT NOT NULL DEFAULT 'PENDING',
      onboarding_started_at TIMESTAMP,
      onboarding_completed_at TIMESTAMP,
      action_url TEXT,
      return_url TEXT,
      primary_email_confirmed BOOLEAN DEFAULT FALSE,
      payments_receivable BOOLEAN DEFAULT FALSE,
      oauth_integrated BOOLEAN DEFAULT FALSE,
      paypal_buttons_enabled BOOLEAN DEFAULT FALSE,
      acdc_enabled BOOLEAN DEFAULT FALSE,
      apple_pay_enabled BOOLEAN DEFAULT FALSE,
      google_pay_enabled BOOLEAN DEFAULT FALSE,
      vaulting_enabled BOOLEAN DEFAULT FALSE,
      subscribed_products JSONB DEFAULT '[]',
      active_capabilities JSONB DEFAULT '[]',
      last_status_check TIMESTAMP,
      status_check_error TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT unique_tracking_id_per_instance UNIQUE (saleor_api_url, tracking_id),
      CONSTRAINT unique_merchant_id_per_instance UNIQUE (saleor_api_url, paypal_merchant_id)
    );

    CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_saleor_url ON paypal_merchant_onboarding(saleor_api_url);
    CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_tracking_id ON paypal_merchant_onboarding(tracking_id);
    CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_merchant_id ON paypal_merchant_onboarding(paypal_merchant_id);
    CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_status ON paypal_merchant_onboarding(onboarding_status);
    CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_email ON paypal_merchant_onboarding(merchant_email);

    -- Trigger to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_merchant_onboarding_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_update_merchant_onboarding_timestamp ON paypal_merchant_onboarding;
    CREATE TRIGGER trigger_update_merchant_onboarding_timestamp
      BEFORE UPDATE ON paypal_merchant_onboarding
      FOR EACH ROW
      EXECUTE FUNCTION update_merchant_onboarding_timestamp();
  `;

  try {
    await pool.query(createTableQuery);
    // eslint-disable-next-line no-console
    console.log("Database tables initialized successfully");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize database tables:", error);
    throw error;
  }
};
