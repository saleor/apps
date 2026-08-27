import { formatEnvValidationError } from "@saleor/errors";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    APL: z.enum(["file", "upstash"]).default("file"),
    APP_API_BASE_URL: z.string().optional(),
    APP_IFRAME_BASE_URL: z.string().optional(),
    FILE_APL_PATH: z.string().optional(),
    UPSTASH_URL: z.string().optional(),
    UPSTASH_TOKEN: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  // manual destructuring, so that turbo.json can declare the variables the build needs
  runtimeEnv: {
    APL: process.env.APL,
    APP_API_BASE_URL: process.env.APP_API_BASE_URL,
    APP_IFRAME_BASE_URL: process.env.APP_IFRAME_BASE_URL,
    FILE_APL_PATH: process.env.FILE_APL_PATH,
    UPSTASH_URL: process.env.UPSTASH_URL,
    UPSTASH_TOKEN: process.env.UPSTASH_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
  onValidationError: formatEnvValidationError,
});
