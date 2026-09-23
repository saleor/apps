import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

import { envUrlSchema } from "./lib/env-url";

export const env = createEnv({
  shared: {
    PORT: z.coerce.number().optional().default(3001),
  },
  client: {
    NEXT_PUBLIC_INITIAL_ENV_URL: envUrlSchema.optional(),
    NEXT_PUBLIC_INITIAL_CHANNEL_SLUG: z.string(),
    NEXT_PUBLIC_INITIAL_CHECKOUT_COUNTRY_CODE: z.enum(["PL", "SE", "US"]).optional().default("US"),
    NEXT_PUBLIC_LOG_LEVEL: z.enum(["info", "warn", "error"]).optional().default("info"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_INITIAL_CHANNEL_SLUG: process.env.NEXT_PUBLIC_INITIAL_CHANNEL_SLUG,
    NEXT_PUBLIC_INITIAL_ENV_URL: process.env.NEXT_PUBLIC_INITIAL_ENV_URL,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
    NEXT_PUBLIC_INITIAL_CHECKOUT_COUNTRY_CODE:
      process.env.NEXT_PUBLIC_INITIAL_CHECKOUT_COUNTRY_CODE,
    PORT: process.env.PORT,
  },
  extends: [vercel()],
  isServer: typeof window === "undefined",
});
