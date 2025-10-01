/* eslint-disable no-console */
import { parseArgs } from "node:util";

import { Pool } from "pg";

import { env } from "@/lib/env";

const databaseUrl = env.DATABASE_URL;

try {
  const {
    values: { drop },
  } = parseArgs({
    args: process.argv.slice(2),
    options: {
      drop: {
        type: "boolean",
        short: "d",
        default: false,
      },
    },
  });

  console.log(`Starting PostgreSQL setup with connection: ${databaseUrl}`);

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const createTableIfNotExists = async (tableName: string) => {
    if (drop) {
      console.log(`Dropping table ${tableName} if exists...`);
      await pool.query(`DROP TABLE IF EXISTS ${tableName}`);
      console.log(`Table ${tableName} dropped successfully`);
    }

    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = $1
      )
    `;

    const result = await pool.query(checkTableQuery, [tableName]);

    if (result.rows[0].exists) {
      console.log(`Table ${tableName} already exists - creation is skipped`);
      return;
    }

    console.log(`Table ${tableName} does not exist, proceeding with creation.`);

    if (tableName === "saleor_app_configuration") {
      const createTableQuery = `
        CREATE TABLE ${tableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant VARCHAR(255) NOT NULL,
          app_name VARCHAR(255) NOT NULL,
          configurations JSONB NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          app_type VARCHAR(100) DEFAULT 'payment',
          UNIQUE(tenant, app_name)
        )
      `;

      await pool.query(createTableQuery);
      console.log(`Table ${tableName} created successfully`);

      // Create indexes
      const createIndexQuery = `
        CREATE INDEX idx_${tableName}_tenant ON ${tableName}(tenant);
        CREATE INDEX idx_${tableName}_app_name ON ${tableName}(app_name);
        CREATE INDEX idx_${tableName}_is_active ON ${tableName}(is_active);
        CREATE INDEX idx_${tableName}_app_type ON ${tableName}(app_type);
        CREATE INDEX idx_${tableName}_tenant_app ON ${tableName}(tenant, app_name);
      `;

      await pool.query(createIndexQuery);
      console.log(`Indexes for ${tableName} created successfully`);
    } else {
      // Legacy table creation for backwards compatibility
      const createTableQuery = `
        CREATE TABLE ${tableName} (
          pk VARCHAR(512) NOT NULL,
          sk VARCHAR(512) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          config_id VARCHAR(255),
          channel_id VARCHAR(255),
          name VARCHAR(255),
          data JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          modified_at TIMESTAMP DEFAULT NOW(),
          PRIMARY KEY (pk, sk)
        )
      `;

      await pool.query(createTableQuery);
      console.log(`Table ${tableName} created successfully`);

      // Create indexes
      const createIndexQuery = `
        CREATE INDEX idx_${tableName}_pk ON ${tableName}(pk);
        CREATE INDEX idx_${tableName}_entity_type ON ${tableName}(entity_type);
        CREATE INDEX idx_${tableName}_config_id ON ${tableName}(config_id);
        CREATE INDEX idx_${tableName}_channel_id ON ${tableName}(channel_id);
      `;

      await pool.query(createIndexQuery);
      console.log(`Indexes for ${tableName} created successfully`);
    }
  };

  await createTableIfNotExists("saleor_app_configuration");

  await pool.end();

  console.log("PostgreSQL setup completed successfully");
  process.exit(0);
} catch (error) {
  console.error("Error setting up PostgreSQL:", error);
  process.exit(1);
}
