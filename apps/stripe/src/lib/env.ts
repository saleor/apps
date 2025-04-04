import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

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
    MANIFEST_APP_ID: z.string().optional().default("saleor.app.payment.stripe-v2"),
    OTEL_ACCESS_TOKEN: z.string().optional(),
    OTEL_ENABLED: booleanSchema.optional().default("false"),
    OTEL_SERVICE_NAME: z.string().optional(),
    PORT: z.coerce.number().optional().default(3000),
    REPOSITORY_URL: z.string().optional(),
    SECRET_KEY: z.string(),
    VERCEL_ENV: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    STRIPE_PARTNER_ID: z.string().optional(),
    STRIPE_CONFIG_CHANNEL_ID: z.string().optional(),
    STRIPE_CONFIG_PUBLISHABLE_KEY: z.string().optional(),
    STRIPE_CONFIG_RESTRICTED_KEY: z.string().optional(),
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
    ENV: process.env.ENV,
    MANIFEST_APP_ID: process.env.MANIFEST_APP_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
    OTEL_ACCESS_TOKEN: process.env.OTEL_ACCESS_TOKEN,
    OTEL_ENABLED: process.env.OTEL_ENABLED,
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    PORT: process.env.PORT,
    REPOSITORY_URL: process.env.REPOSITORY_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    STRIPE_PARTNER_ID: process.env.STRIPE_PARTNER_ID,
    STRIPE_CONFIG_CHANNEL_ID: process.env.STRIPE_CONFIG_CHANNEL_ID,
    STRIPE_CONFIG_PUBLISHABLE_KEY: process.env.STRIPE_CONFIG_PUBLISHABLE_KEY,
    STRIPE_CONFIG_RESTRICTED_KEY: process.env.STRIPE_CONFIG_RESTRICTED_KEY,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
});
