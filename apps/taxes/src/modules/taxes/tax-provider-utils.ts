/*
 * The providers sdk types claim to sometimes return undefined.
 * If it ever happens, we have nothing to fall back to, so we throw an error.
 * Should only be used for values that are required for further calculation.
 */
function resolveOptionalOrThrow<T>(value: T | undefined, error?: Error): T {
  if (value === undefined) {
    throw error
      ? error
      : new Error("Could not resolve data. Value needed for further calculation is undefined.");
  }

  return value;
}

export const taxProviderUtils = {
  resolveOptionalOrThrow,
};
