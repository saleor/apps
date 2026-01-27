import { z } from "zod";

/**
 * Takes value from env (true/false in strings) and transforms to javascript boolean primitive
 *
 * // https://env.t3.gg/docs/recipes#booleans
 */
const booleanEnvSchema = z
  .string()
  .refine((s) => s === "true" || s === "false")
  .transform((s) => s === "true");

const defaultTrue = booleanEnvSchema.default("true");
const defaultFalse = booleanEnvSchema.default("false");

export const booleanEnv = { defaultTrue, defaultFalse, noDefault: booleanEnvSchema };
