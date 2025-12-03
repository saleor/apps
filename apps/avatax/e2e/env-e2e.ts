import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const envE2e = createEnv({
  server: {
    E2E_USER_NAME: z.string().optional(),
    E2E_USER_PASSWORD: z.string().optional(),
    TEST_SALEOR_API_URL: z.string().optional(),
    E2E_SALEOR_VERSION: z.enum(["320", "321", "322", "latest"]).optional(),
  },
  // we use the manual destruction here to validate if env variable is set inside turbo.json
  runtimeEnv: {
    E2E_USER_NAME: process.env.E2E_USER_NAME,
    E2E_USER_PASSWORD: process.env.E2E_USER_PASSWORD,
    E2E_SALEOR_VERSION: process.env.E2E_SALEOR_VERSION,
    TEST_SALEOR_API_URL: process.env.TEST_SALEOR_API_URL,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
});
