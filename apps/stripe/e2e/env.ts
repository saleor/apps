import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// https://env.t3.gg/docs/recipes#booleans
const booleanSchema = z
  .string()
  .refine((s) => s === "true" || s === "false")
  .transform((s) => s === "true");

export const env = createEnv({
  server: {
    E2E_BASE_URL: z.string().url(),
    CI: booleanSchema.optional().default("false"),
    E2E_SALEOR_API_URL: z.string().url().endsWith("/graphql/"),
    E2E_CHARGE_CHANNEL_SLUG: z.string().min(1),
    E2E_AUTHORIZATION_CHANNEL_SLUG: z.string().min(1),
  },
  runtimeEnv: {
    E2E_BASE_URL: process.env.E2E_BASE_URL,
    CI: process.env.CI,
    E2E_SALEOR_API_URL: process.env.E2E_SALEOR_API_URL,
    E2E_CHARGE_CHANNEL_SLUG: process.env.E2E_CHARGE_CHANNEL_SLUG,
    E2E_AUTHORIZATION_CHANNEL_SLUG: process.env.E2E_AUTHORIZATION_CHANNEL_SLUG,
  },
  skipValidation: true, // Validation is triggered before playwright config has load env variables hence we skip it here
});
