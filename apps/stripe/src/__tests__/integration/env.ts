import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DYNAMODB_MAIN_TABLE_NAME: z.string().min(1),
    INTEGRATION_SALEOR_API_URL: z.string().url().endsWith("/graphql/"),
    INTEGRATION_STRIPE_RK: z.string().min(1),
    INTEGRATION_STRIPE_PK: z.string().min(1),
  },
  runtimeEnv: {
    DYNAMODB_MAIN_TABLE_NAME: process.env.DYNAMODB_MAIN_TABLE_NAME,
    INTEGRATION_SALEOR_API_URL: process.env.INTEGRATION_SALEOR_API_URL,
    INTEGRATION_STRIPE_RK: process.env.INTEGRATION_STRIPE_RK,
    INTEGRATION_STRIPE_PK: process.env.INTEGRATION_STRIPE_PK,
  },
});
