import { booleanEnv } from "@saleor/apps-shared/boolean-env";
import { BaseError } from "@saleor/errors";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  },
  server: {
    ALLOWED_DOMAIN_PATTERN: z.string().optional(),
    APL: z.enum(["file", "dynamodb"]).optional().default("file"),
    APP_API_BASE_URL: z.string().optional(),
    APP_IFRAME_BASE_URL: z.string().optional(),
    APP_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    MANIFEST_APP_ID: z.string().optional().default("saleor.app.payment.np-atobarai"),
    OTEL_ACCESS_TOKEN: z.string().optional(),
    OTEL_ENABLED: booleanEnv.defaultFalse,
    OTEL_SERVICE_NAME: z.string().optional().default("saleor-app-payment-np-atobarai"),
    PORT: z.coerce.number().optional().default(3000),
    REPOSITORY_URL: z.string().optional(),
    SECRET_KEY: z.string(),
    VERCEL_ENV: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    APP_NAME: z.string().optional().default("NP Atobarai (NP後払い)"),
    DYNAMODB_MAIN_TABLE_NAME: z.string().optional().default("atobarai-main-table"),
    DYNAMODB_REQUEST_TIMEOUT_MS: z.coerce.number().default(5_000),
    DYNAMODB_CONNECTION_TIMEOUT_MS: z.coerce.number().default(2_000),
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
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
    APP_NAME: process.env.APP_NAME,
    DYNAMODB_MAIN_TABLE_NAME: process.env.DYNAMODB_MAIN_TABLE_NAME,
    DYNAMODB_REQUEST_TIMEOUT_MS: process.env.DYNAMODB_REQUEST_TIMEOUT_MS,
    DYNAMODB_CONNECTION_TIMEOUT_MS: process.env.DYNAMODB_CONNECTION_TIMEOUT_MS,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
  onValidationError(issues) {
    const validationError = fromError(issues);

    const EnvValidationError = BaseError.subclass("EnvValidationError");

    throw new EnvValidationError(validationError.toString(), {
      cause: issues,
    });
  },
});
