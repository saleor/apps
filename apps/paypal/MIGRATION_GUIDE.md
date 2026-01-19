# Database Migration Guide

## Overview

The PayPal app uses PostgreSQL to store:
1. **Saleor authentication** (APL - App Permission Layer)
2. **Merchant onboarding records** (onboarding status, payment methods)

## Prerequisites

Before running migrations, ensure you have:

✅ PostgreSQL database server running
✅ Database created (e.g., `paypal_app`)
✅ Database user with CREATE TABLE permissions
✅ Environment variables configured

## Environment Setup

Create a `.env` file in the app root with:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paypal_app
DB_USER=postgres
DB_PASSWORD=your_secure_password

# App Configuration (for runtime)
APL=postgres
APP_API_BASE_URL=https://your-app.com/api
APP_IFRAME_BASE_URL=https://your-app.com
SECRET_KEY=your_secret_key
```

### Local Development

For local development, use `.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paypal_app_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

### Production

For production, set environment variables securely:
- Use secrets management (AWS Secrets Manager, etc.)
- Or use platform environment variables (Vercel, Railway, etc.)

## Running Migrations

### Method 1: Manual Migration Script (Recommended)

Run the migration script directly:

```bash
# From the app directory
cd apps/paypal

# Run migration
pnpm run migrate:database
```

**Output:**
```
🚀 Starting PayPal App database migration...

📊 Database Configuration:
   Host: localhost
   Port: 5432
   Database: paypal_app
   User: postgres

📝 Running migrations...

✅ Migrations completed successfully!

Tables created/updated:
   • saleor_app_configuration
   • paypal_merchant_onboarding

Indexes created:
   • idx_saleor_app_configuration_tenant
   ...

Triggers created:
   • trigger_update_merchant_onboarding_timestamp
```

### Method 2: Automatic on App Start

Migrations run automatically when the app starts:

```bash
pnpm run dev
# or
pnpm run start
```

The `initializeDatabase()` function is called during server initialization.

**Pros:**
- ✅ No manual step required
- ✅ Works in all environments

**Cons:**
- ⚠️ Runs on every app startup (but safe with `IF NOT EXISTS`)
- ⚠️ Slight startup delay

### Method 3: Docker Compose

If using Docker:

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: paypal_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  paypal-app:
    build: .
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: paypal_app
      DB_USER: postgres
      DB_PASSWORD: postgres
    depends_on:
      - postgres
    command: sh -c "pnpm run migrate:database && pnpm start"

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

## Migration Safety

### Idempotent Migrations

All migrations use `IF NOT EXISTS` clauses:

```sql
CREATE TABLE IF NOT EXISTS paypal_merchant_onboarding (...);
CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_saleor_url ...;
CREATE OR REPLACE FUNCTION update_merchant_onboarding_timestamp() ...;
```

**Result**: Safe to run multiple times without errors.

### Zero Downtime

Migrations are designed for zero-downtime deployments:

1. ✅ **Additive changes only** - New tables/columns don't affect existing code
2. ✅ **Backwards compatible** - Old code works during deployment
3. ✅ **No data loss** - Existing data is preserved

### Rollback Strategy

If migration fails:

```bash
# Check what was created
psql -h localhost -U postgres -d paypal_app -c "\dt"

# Manual rollback (if needed)
psql -h localhost -U postgres -d paypal_app -c "DROP TABLE IF EXISTS paypal_merchant_onboarding CASCADE;"
```

## What Gets Created

### 1. saleor_app_configuration Table

**Purpose**: Store Saleor authentication data (APL)

```sql
CREATE TABLE saleor_app_configuration (
  id UUID PRIMARY KEY,
  tenant TEXT NOT NULL,              -- Saleor API URL
  app_name TEXT NOT NULL,            -- "PayPal"
  configurations JSONB NOT NULL,     -- AuthData
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (tenant, app_name)
);
```

**Indexes:**
- `idx_saleor_app_configuration_tenant`
- `idx_saleor_app_configuration_app_name`
- `idx_saleor_app_configuration_is_active`

### 2. paypal_merchant_onboarding Table

**Purpose**: Track merchant onboarding status

```sql
CREATE TABLE paypal_merchant_onboarding (
  id UUID PRIMARY KEY,
  saleor_api_url TEXT NOT NULL,
  tracking_id TEXT NOT NULL,          -- Your user/merchant ID
  paypal_merchant_id TEXT,            -- PayPal's merchant ID
  partner_referral_id TEXT,
  merchant_email TEXT,
  merchant_country TEXT,
  onboarding_status TEXT DEFAULT 'PENDING',

  -- Status flags
  primary_email_confirmed BOOLEAN DEFAULT FALSE,
  payments_receivable BOOLEAN DEFAULT FALSE,
  oauth_integrated BOOLEAN DEFAULT FALSE,

  -- Payment methods
  paypal_buttons_enabled BOOLEAN DEFAULT FALSE,
  acdc_enabled BOOLEAN DEFAULT FALSE,
  apple_pay_enabled BOOLEAN DEFAULT FALSE,
  google_pay_enabled BOOLEAN DEFAULT FALSE,
  vaulting_enabled BOOLEAN DEFAULT FALSE,

  -- Metadata
  subscribed_products JSONB DEFAULT '[]',
  active_capabilities JSONB DEFAULT '[]',
  last_status_check TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (saleor_api_url, tracking_id)
);
```

**Indexes:**
- `idx_merchant_onboarding_saleor_url` - For tenant isolation
- `idx_merchant_onboarding_tracking_id` - For fast lookups
- `idx_merchant_onboarding_merchant_id` - For PayPal ID lookups
- `idx_merchant_onboarding_status` - For filtering by status
- `idx_merchant_onboarding_email` - For email lookups

**Triggers:**
- `trigger_update_merchant_onboarding_timestamp` - Auto-update `updated_at`

### 3. Functions

```sql
CREATE OR REPLACE FUNCTION update_merchant_onboarding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Verification

After running migrations, verify:

### 1. Check Tables

```bash
psql -h localhost -U postgres -d paypal_app

# List tables
\dt

# Expected output:
#  Schema |            Name             | Type  |  Owner
# --------+-----------------------------+-------+----------
#  public | paypal_merchant_onboarding  | table | postgres
#  public | saleor_app_configuration    | table | postgres
```

### 2. Check Indexes

```sql
\di

-- Expected: 8 indexes total
```

### 3. Check Triggers

```sql
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Expected: trigger_update_merchant_onboarding_timestamp
```

### 4. Test Insert

```sql
-- Test merchant onboarding table
INSERT INTO paypal_merchant_onboarding (
  saleor_api_url,
  tracking_id,
  merchant_email
) VALUES (
  'https://test.saleor.cloud/graphql/',
  'test_user_123',
  'test@example.com'
);

-- Verify
SELECT * FROM paypal_merchant_onboarding;

-- Cleanup
DELETE FROM paypal_merchant_onboarding WHERE tracking_id = 'test_user_123';
```

## Troubleshooting

### Error: "Cannot connect to database"

**Check:**
1. PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Database exists: `psql -U postgres -l | grep paypal_app`
3. Credentials are correct
4. Network/firewall allows connection

**Fix:**
```bash
# Create database if missing
psql -U postgres -c "CREATE DATABASE paypal_app;"

# Test connection
psql -h localhost -U postgres -d paypal_app -c "SELECT 1;"
```

### Error: "Permission denied"

**Check:**
Database user has proper permissions

**Fix:**
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE paypal_app TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

### Error: "uuid-ossp extension not available"

**Fix:**
```sql
-- Connect as superuser
psql -U postgres -d paypal_app

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Migration hangs or times out

**Check:**
1. Database has available connections
2. No locks on tables
3. Sufficient disk space

**Fix:**
```sql
-- Check active connections
SELECT * FROM pg_stat_activity WHERE datname = 'paypal_app';

-- Check locks
SELECT * FROM pg_locks WHERE database = (SELECT oid FROM pg_database WHERE datname = 'paypal_app');

-- Kill hanging queries (if needed)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND datname = 'paypal_app';
```

## Production Deployment

### Recommended Flow

```bash
# 1. Backup database (if existing data)
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migration
pnpm run migrate:database

# 3. Verify migration
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\dt"

# 4. Deploy app
pnpm run build
pnpm run start
```

### CI/CD Integration

**GitHub Actions Example:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        env:
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_PORT: ${{ secrets.DB_PORT }}
          DB_NAME: ${{ secrets.DB_NAME }}
          DB_USER: ${{ secrets.DB_USER }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        run: pnpm run migrate:database

      - name: Build and deploy
        run: pnpm run build && pnpm run start
```

## Migration History

| Version | Date | Description |
|---------|------|-------------|
| v1.0.0 | 2025-10-27 | Initial schema - APL + Merchant Onboarding tables |

## Future Migrations

When adding new tables/columns:

1. **Add to `database.ts`** - Update `initializeDatabase()` function
2. **Test locally** - Run migration on dev database
3. **Update this guide** - Document new tables/columns
4. **Deploy** - Run migration in production

---

**Need Help?**
- Check `MULTI_TENANT_ARCHITECTURE.md` for architecture details
- Check `MERCHANT_ONBOARDING_IMPLEMENTATION.md` for feature docs
- Review PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-15-main.log`
