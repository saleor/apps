import { CriticalError } from "../../error";

/*
 * The providers sdk types claim to sometimes return undefined.
 * If it ever happens, we have nothing to fall back to, so we throw an error.
 * Should only be used for values that are required for further calculation.
 */
function resolveOptionalOrThrowUnexpectedError<T>(
  value: T | undefined | null,
  error: InstanceType<typeof CriticalError>,
): T {
  if (value === undefined || value === null) {
    throw error;
  }

  return value;
}

export const taxProviderUtils = {
  resolveOptionalOrThrowUnexpectedError,
};
