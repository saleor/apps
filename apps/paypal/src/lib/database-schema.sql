-- PayPal Merchant Onboarding Table
-- Tracks merchant onboarding status and payment method readiness

CREATE TABLE IF NOT EXISTS paypal_merchant_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identifiers
  saleor_api_url TEXT NOT NULL,                  -- Saleor instance URL
  tracking_id TEXT NOT NULL,                      -- Partner tracking ID (unique per merchant)
  paypal_merchant_id TEXT,                        -- PayPal merchant ID (once onboarded)
  partner_referral_id TEXT,                       -- Partner referral ID from create referral call

  -- Merchant Information
  merchant_email TEXT,                            -- Merchant email address
  merchant_country TEXT,                          -- ISO 3166-1 alpha-2 country code

  -- Onboarding Status
  onboarding_status TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING, IN_PROGRESS, COMPLETED, FAILED
  onboarding_started_at TIMESTAMP,                -- When merchant clicked signup link
  onboarding_completed_at TIMESTAMP,              -- When merchant completed onboarding

  -- Action URLs
  action_url TEXT,                                -- PayPal signup URL for merchant
  return_url TEXT,                                -- URL to redirect after onboarding

  -- Account Status Flags
  primary_email_confirmed BOOLEAN DEFAULT FALSE,  -- PRIMARY_EMAIL_CONFIRMED flag
  payments_receivable BOOLEAN DEFAULT FALSE,      -- PAYMENTS_RECEIVABLE flag
  oauth_integrated BOOLEAN DEFAULT FALSE,         -- OAuth permissions granted

  -- Payment Method Readiness
  paypal_buttons_enabled BOOLEAN DEFAULT FALSE,   -- PayPal button payments ready
  acdc_enabled BOOLEAN DEFAULT FALSE,             -- Advanced card processing ready
  apple_pay_enabled BOOLEAN DEFAULT FALSE,        -- Apple Pay ready
  google_pay_enabled BOOLEAN DEFAULT FALSE,       -- Google Pay ready
  vaulting_enabled BOOLEAN DEFAULT FALSE,         -- Payment vaulting ready

  -- Products and Capabilities (JSONB for flexibility)
  subscribed_products JSONB DEFAULT '[]',         -- Array of product objects
  active_capabilities JSONB DEFAULT '[]',         -- Array of capability objects

  -- Last Status Check
  last_status_check TIMESTAMP,                    -- When we last checked seller status
  status_check_error TEXT,                        -- Error from last status check

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_tracking_id_per_instance UNIQUE (saleor_api_url, tracking_id),
  CONSTRAINT unique_merchant_id_per_instance UNIQUE (saleor_api_url, paypal_merchant_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_saleor_url
  ON paypal_merchant_onboarding(saleor_api_url);

CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_tracking_id
  ON paypal_merchant_onboarding(tracking_id);

CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_merchant_id
  ON paypal_merchant_onboarding(paypal_merchant_id);

CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_status
  ON paypal_merchant_onboarding(onboarding_status);

CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_email
  ON paypal_merchant_onboarding(merchant_email);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_merchant_onboarding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_merchant_onboarding_timestamp
  BEFORE UPDATE ON paypal_merchant_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_merchant_onboarding_timestamp();

-- Comments for documentation
COMMENT ON TABLE paypal_merchant_onboarding IS 'Tracks PayPal merchant onboarding status and payment method readiness';
COMMENT ON COLUMN paypal_merchant_onboarding.tracking_id IS 'Unique identifier for merchant in partner system (e.g., Saleor user ID)';
COMMENT ON COLUMN paypal_merchant_onboarding.paypal_merchant_id IS 'PayPal merchant ID assigned after successful onboarding';
COMMENT ON COLUMN paypal_merchant_onboarding.partner_referral_id IS 'ID returned from create partner referral API call';
COMMENT ON COLUMN paypal_merchant_onboarding.primary_email_confirmed IS 'Must be true for merchant to receive payments';
COMMENT ON COLUMN paypal_merchant_onboarding.payments_receivable IS 'Must be true for merchant to accept payments';
COMMENT ON COLUMN paypal_merchant_onboarding.oauth_integrated IS 'OAuth permissions granted to platform';
COMMENT ON COLUMN paypal_merchant_onboarding.acdc_enabled IS 'Advanced Credit/Debit Card processing enabled';

-- WSM Global PayPal Configuration Table
-- Stores partner API credentials and settings shared across all tenants
CREATE TABLE IF NOT EXISTS wsm_global_paypal_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- PayPal Partner API Credentials
  client_id TEXT NOT NULL,                       -- PayPal Partner API Client ID
  client_secret TEXT NOT NULL,                   -- PayPal Partner API Client Secret
  partner_merchant_id TEXT,                      -- PayPal Partner Merchant ID
  partner_fee_percent NUMERIC(5,2),              -- Platform fee percentage (0-100)
  bn_code TEXT,                                  -- PayPal Partner Attribution BN Code

  -- Environment
  environment TEXT NOT NULL CHECK (environment IN ('SANDBOX', 'LIVE')),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,                -- Only one config can be active

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wsm_global_config_active
  ON wsm_global_paypal_config(is_active);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wsm_global_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wsm_global_config_timestamp
  BEFORE UPDATE ON wsm_global_paypal_config
  FOR EACH ROW
  EXECUTE FUNCTION update_wsm_global_config_timestamp();

-- Comments
COMMENT ON TABLE wsm_global_paypal_config IS 'Stores PayPal partner API credentials and settings shared across all tenants';
COMMENT ON COLUMN wsm_global_paypal_config.partner_fee_percent IS 'Platform fee percentage (e.g., 2.00 for 2%). PayPal deducts this from merchant payments';
