import { z } from "zod";

/*
 * The providers sdk types claim to sometimes return undefined.
 * If it ever happens, we have nothing to fall back to, so we throw an error.
 * Should only be used for values that are required for further calculation.
 */
function resolveOptionalOrThrow<T>(value: T | undefined | null, error?: Error): T {
  if (value === undefined || value === null) {
    throw error
      ? error
      : new Error("Could not resolve data. Value needed for further calculation is undefined.");
  }

  return value;
}

function resolveStringOrThrow(value: string | undefined | null): string {
  return z.string().min(1, { message: "This field can not be empty." }).parse(value);
}

export const taxProviderUtils = {
  resolveOptionalOrThrow,
  resolveStringOrThrow,
};
