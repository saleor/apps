import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import packageJson from "@/package.json";

// https://env.t3.gg/docs/recipes#booleans
const booleanSchema = z
  .string()
  .refine((s) => s === "true" || s === "false")
  .transform((s) => s === "true");

export const env = createEnv({
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  },
  server: {
    ALLOWED_DOMAIN_PATTERN: z.string().optional(),
    APL: z.enum(["saleor-cloud", "file", "dynamodb"]).optional().default("file"),
    APP_API_BASE_URL: z.string().optional(),
    APP_IFRAME_BASE_URL: z.string().optional(),
    APP_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    AVATAX_CLIENT_TIMEOUT: z.coerce.number().optional().default(15000),
    AVATAX_CLIENT_APP_NAME: z.string().optional().default(packageJson.name),
    AVATAX_CLIENT_APP_VERSION: z.string().optional().default(packageJson.version),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_REGION: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    DYNAMODB_LOGS_ITEM_TTL_IN_DAYS: z.coerce.number().positive().optional().default(14),
    DYNAMODB_LOGS_TABLE_NAME: z.string(),
    DYNAMODB_MAIN_TABLE_NAME: z.string(),
    E2E_USER_NAME: z.string().optional(),
    E2E_USER_PASSWORD: z.string().optional(),
    E2E_SALEOR_VERSION: z.enum(["320", "321", "latest"]).optional(),
    FILE_APL_PATH: z.string().optional(),
    MANIFEST_APP_ID: z.string().optional().default("saleor.app.avatax"),
    OTEL_ENABLED: booleanSchema.optional().default("false"),
    OTEL_SERVICE_NAME: z.string().optional(),
    PORT: z.coerce.number().optional().default(3000),
    REST_APL_ENDPOINT: z.string().optional(),
    REST_APL_TOKEN: z.string().optional(),
    SECRET_KEY: z.string(),
    TEST_SALEOR_API_URL: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    OTEL_ACCESS_TOKEN: z.string().optional(),
    VERCEL_ENV: z.string().optional(),
    REPOSITORY_URL: z.string().optional(),
    OTEL_TRACES_SAMPLER_ARG: z.coerce.number().min(0).max(1).optional().default(1),
    OTEL_TENANT_DOMAIN_ALLOWLIST: z
      .string()
      .optional()
      .transform((s) => {
        if (!s) {
          return [];
        }

        return s.split(",").map((domain) => domain.trim());
      }),
    OTEL_METRICS_FLUSH_TIMEOUT_MILIS: z.coerce.number().optional().default(5_000),
  },
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
    ENV: z.enum(["local", "development", "staging", "production"]).optional().default("local"),
  },
  // we use the manual destruction here to validate if env variable is set inside turbo.json
  runtimeEnv: {
    ALLOWED_DOMAIN_PATTERN: process.env.ALLOWED_DOMAIN_PATTERN,
    APL: process.env.APL,
    APP_API_BASE_URL: process.env.APP_API_BASE_URL,
    APP_IFRAME_BASE_URL: process.env.APP_IFRAME_BASE_URL,
    APP_LOG_LEVEL: process.env.APP_LOG_LEVEL,
    AVATAX_CLIENT_TIMEOUT: process.env.AVATAX_CLIENT_TIMEOUT,
    AVATAX_CLIENT_APP_NAME: process.env.AVATAX_CLIENT_APP_NAME,
    AVATAX_CLIENT_APP_VERSION: process.env.AVATAX_CLIENT_APP_VERSION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_REGION: process.env.AWS_REGION,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    DYNAMODB_LOGS_ITEM_TTL_IN_DAYS: process.env.DYNAMODB_LOGS_ITEM_TTL_IN_DAYS,
    DYNAMODB_LOGS_TABLE_NAME: process.env.DYNAMODB_LOGS_TABLE_NAME,
    DYNAMODB_MAIN_TABLE_NAME: process.env.DYNAMODB_MAIN_TABLE_NAME,
    E2E_USER_NAME: process.env.E2E_USER_NAME,
    E2E_USER_PASSWORD: process.env.E2E_USER_PASSWORD,
    E2E_SALEOR_VERSION: process.env.E2E_SALEOR_VERSION,
    ENV: process.env.ENV,
    FILE_APL_PATH: process.env.FILE_APL_PATH,
    MANIFEST_APP_ID: process.env.MANIFEST_APP_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
    OTEL_ENABLED: process.env.OTEL_ENABLED,
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    PORT: process.env.PORT,
    REST_APL_ENDPOINT: process.env.REST_APL_ENDPOINT,
    REST_APL_TOKEN: process.env.REST_APL_TOKEN,
    SECRET_KEY: process.env.SECRET_KEY,
    TEST_SALEOR_API_URL: process.env.TEST_SALEOR_API_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    OTEL_ACCESS_TOKEN: process.env.OTEL_ACCESS_TOKEN,
    VERCEL_ENV: process.env.VERCEL_ENV,
    REPOSITORY_URL: process.env.REPOSITORY_URL,
    OTEL_TRACES_SAMPLER_ARG: process.env.OTEL_TRACES_SAMPLER_ARG,
    OTEL_TENANT_DOMAIN_ALLOWLIST: process.env.OTEL_TENANT_DOMAIN_ALLOWLIST,
    OTEL_METRICS_FLUSH_TIMEOUT_MILIS: process.env.OTEL_METRICS_FLUSH_TIMEOUT_MILIS,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
});
