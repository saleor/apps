import { z } from "zod";

/**
 * Zod schema entry for NEW_SECRET_KEY env var.
 * Spread into the `server` section of createEnv() in each app's env.ts:
 *   server: { ...newSecretKeyServerSchema, SECRET_KEY: z.string(), ... }
 */
export const newSecretKeyServerSchema = {
  NEW_SECRET_KEY: z.string().min(1).optional(),
};

/**
 * Runtime env mapping for NEW_SECRET_KEY.
 * Spread into the `runtimeEnv` section of createEnv() in each app's env.ts:
 *   runtimeEnv: { ...newSecretKeyRuntimeEnv, SECRET_KEY: process.env.SECRET_KEY, ... }
 */
export const newSecretKeyRuntimeEnv = {
  NEW_SECRET_KEY: process.env.NEW_SECRET_KEY,
};

type EnvWithKeys = {
  SECRET_KEY: string;
  NEW_SECRET_KEY?: string;
};

/**
 * Returns the key to use for NEW encryptions.
 * When NEW_SECRET_KEY is set (rotation in progress), uses it as primary.
 * Otherwise uses SECRET_KEY.
 */
export function resolveEncryptKey(env: EnvWithKeys): string {
  return env.NEW_SECRET_KEY ?? env.SECRET_KEY;
}

/**
 * Returns the decrypt fallback chain for runtime reads.
 * When NEW_SECRET_KEY is primary, SECRET_KEY becomes the fallback so legacy data still decrypts.
 * When NEW_SECRET_KEY is unset, no fallbacks (SECRET_KEY is primary on its own).
 */
export function resolveDecryptFallbacks(env: EnvWithKeys): string[] {
  return env.NEW_SECRET_KEY ? [env.SECRET_KEY] : [];
}

/**
 * Returns the rotation encrypt target. Throws if NEW_SECRET_KEY is not set —
 * rotation requires the operator to explicitly provide the destination key.
 */
export function resolveRotationTargetKey(env: EnvWithKeys): string {
  if (!env.NEW_SECRET_KEY) {
    throw new Error(
      "NEW_SECRET_KEY must be set to run rotation. " +
        "Generate a new key (`openssl rand -hex 32`), set NEW_SECRET_KEY, then retry.",
    );
  }

  return env.NEW_SECRET_KEY;
}

/**
 * Returns the rotation decrypt source chain (keys to try when reading existing rows).
 */
export function resolveRotationSourceKeys(env: EnvWithKeys): string[] {
  return [env.SECRET_KEY];
}
