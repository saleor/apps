import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    E2E_BASE_URL: z.string().url(),
    E2E_SALEOR_API_URL: z.string().url().endsWith("/graphql/"),
    E2E_CHARGE_CHANNEL_SLUG: z.string().min(1),
    E2E_AUTHORIZATION_CHANNEL_SLUG: z.string().min(1),
  },
  runtimeEnv: {
    E2E_BASE_URL: process.env.E2E_BASE_URL,
    E2E_SALEOR_API_URL: process.env.E2E_SALEOR_API_URL,
    E2E_CHARGE_CHANNEL_SLUG: process.env.E2E_CHARGE_CHANNEL_SLUG,
    E2E_AUTHORIZATION_CHANNEL_SLUG: process.env.E2E_AUTHORIZATION_CHANNEL_SLUG,
  },
});
