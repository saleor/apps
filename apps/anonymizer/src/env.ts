import { booleanEnv } from "@saleor/apps-shared/boolean-env";
import { formatEnvValidationError } from "@saleor/errors";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN: z
      .string()
      // Used to build `<uuid>@<domain>`, so reject values that would make an invalid email.
      .regex(/^[^\s@]+$/, "Must be a bare domain with no spaces or '@'")
      .default("example.com"),
    NEXT_PUBLIC_BULK_CONCURRENCY: z.coerce.number().int().positive().default(5),
  },
  server: {
    ALLOWED_DOMAIN_PATTERN: z.string().optional(),
    APP_API_BASE_URL: z.string().optional(),
    APP_IFRAME_BASE_URL: z.string().optional(),
    APP_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    MANIFEST_APP_ID: z.string().default("saleor.app.anonymizer"),
    OTEL_ENABLED: booleanEnv.defaultFalse,
    OTEL_SERVICE_NAME: z.string().optional(),
    OTEL_ACCESS_TOKEN: z.string().optional(),
    PORT: z.coerce.number().default(3000),
    REPOSITORY_URL: z.string().optional(),
    NEXT_RUNTIME: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_ENV: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    ENV: z.enum(["local", "development", "staging", "production"]).default("local"),
  },
  runtimeEnv: {
    ALLOWED_DOMAIN_PATTERN: process.env.ALLOWED_DOMAIN_PATTERN,
    APP_API_BASE_URL: process.env.APP_API_BASE_URL,
    APP_IFRAME_BASE_URL: process.env.APP_IFRAME_BASE_URL,
    APP_LOG_LEVEL: process.env.APP_LOG_LEVEL,
    ENV: process.env.ENV,
    MANIFEST_APP_ID: process.env.MANIFEST_APP_ID,
    NEXT_PUBLIC_BULK_CONCURRENCY: process.env.NEXT_PUBLIC_BULK_CONCURRENCY,
    NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN: process.env.NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    NODE_ENV: process.env.NODE_ENV,
    OTEL_ACCESS_TOKEN: process.env.OTEL_ACCESS_TOKEN,
    OTEL_ENABLED: process.env.OTEL_ENABLED,
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    PORT: process.env.PORT,
    REPOSITORY_URL: process.env.REPOSITORY_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    VERCEL_URL: process.env.VERCEL_URL,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
  onValidationError: formatEnvValidationError,
});
