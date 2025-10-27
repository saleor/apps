#!/usr/bin/env ts-node

/**
 * Database Migration Script
 *
 * Runs database migrations for the PayPal app.
 * This script should be run:
 * - On initial deployment
 * - After pulling schema changes from git
 * - Before starting the app in production
 *
 * Usage:
 *   pnpm run migrate
 *   # or
 *   ts-node scripts/migrate-database.ts
 *
 * Environment Variables Required:
 *   DB_HOST - PostgreSQL host
 *   DB_PORT - PostgreSQL port (default: 5432)
 *   DB_NAME - Database name
 *   DB_USER - Database user
 *   DB_PASSWORD - Database password
 */

import { config } from "dotenv";
import { resolve } from "path";
import { initializeDatabase } from "../src/lib/database";

// Load environment variables
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../.env.local") });

async function main() {
  console.log("🚀 Starting PayPal App database migration...\n");

  // Validate required environment variables
  const requiredEnvVars = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingEnvVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\nPlease set these variables in your .env file\n");
    process.exit(1);
  }

  console.log("📊 Database Configuration:");
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT || 5432}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log("");

  try {
    console.log("📝 Running migrations...\n");
    await initializeDatabase();

    console.log("\n✅ Migrations completed successfully!");
    console.log("\nTables created/updated:");
    console.log("   • saleor_app_configuration");
    console.log("   • paypal_merchant_onboarding");
    console.log("\nIndexes created:");
    console.log("   • idx_saleor_app_configuration_tenant");
    console.log("   • idx_saleor_app_configuration_app_name");
    console.log("   • idx_saleor_app_configuration_is_active");
    console.log("   • idx_merchant_onboarding_saleor_url");
    console.log("   • idx_merchant_onboarding_tracking_id");
    console.log("   • idx_merchant_onboarding_merchant_id");
    console.log("   • idx_merchant_onboarding_status");
    console.log("   • idx_merchant_onboarding_email");
    console.log("\nTriggers created:");
    console.log("   • trigger_update_merchant_onboarding_timestamp");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);
    console.error("\nPlease check:");
    console.error("   1. Database is running and accessible");
    console.error("   2. Database credentials are correct");
    console.error("   3. Database user has CREATE TABLE permissions");
    console.error("");
    process.exit(1);
  }
}

// Run migration
main();
