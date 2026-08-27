import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export const env = createEnv({
  server: {
    APP_API_BASE_URL: z.string().optional(),
    APP_IFRAME_BASE_URL: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  // We use the manual destruction here so env variables are validated by turbo.json env list
  runtimeEnv: {
    APP_API_BASE_URL: process.env.APP_API_BASE_URL,
    APP_IFRAME_BASE_URL: process.env.APP_IFRAME_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
  onValidationError(issues) {
    const validationError = fromError(issues);

    throw new Error(`Invalid environment variables: ${validationError.toString()}`);
  },
});
