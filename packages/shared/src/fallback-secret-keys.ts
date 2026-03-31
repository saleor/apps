import { z } from "zod";

/**
 * Zod schema entries for FALLBACK_SECRET_KEY_1/2/3 env vars.
 * Spread into the `server` section of createEnv() in each app's env.ts:
 *   server: { ...fallbackSecretKeysServerSchema, SECRET_KEY: z.string(), ... }
 */
export const fallbackSecretKeysServerSchema = {
  FALLBACK_SECRET_KEY_1: z.string().min(1).optional(),
  FALLBACK_SECRET_KEY_2: z.string().min(1).optional(),
  FALLBACK_SECRET_KEY_3: z.string().min(1).optional(),
};

/**
 * Runtime env mapping for FALLBACK_SECRET_KEY_1/2/3.
 * Spread into the `runtimeEnv` section of createEnv() in each app's env.ts:
 *   runtimeEnv: { ...fallbackSecretKeysRuntimeEnv, SECRET_KEY: process.env.SECRET_KEY, ... }
 */
export const fallbackSecretKeysRuntimeEnv = {
  FALLBACK_SECRET_KEY_1: process.env.FALLBACK_SECRET_KEY_1,
  FALLBACK_SECRET_KEY_2: process.env.FALLBACK_SECRET_KEY_2,
  FALLBACK_SECRET_KEY_3: process.env.FALLBACK_SECRET_KEY_3,
};

/**
 * Collects all defined fallback secret keys into an ordered array.
 * Skips undefined/null values (i.e., env vars that are not set).
 *
 * Usage: collectFallbackSecretKeys(env) where env is the validated env object.
 */
export function collectFallbackSecretKeys(env: {
  FALLBACK_SECRET_KEY_1?: string;
  FALLBACK_SECRET_KEY_2?: string;
  FALLBACK_SECRET_KEY_3?: string;
}): string[] {
  return [env.FALLBACK_SECRET_KEY_1, env.FALLBACK_SECRET_KEY_2, env.FALLBACK_SECRET_KEY_3].filter(
    (key): key is string => key !== undefined && key !== null,
  );
}
