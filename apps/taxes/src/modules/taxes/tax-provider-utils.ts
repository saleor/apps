import { z } from "zod";
import { TaxUnexpectedError } from "./tax-error";

/*
 * The providers sdk types claim to sometimes return undefined.
 * If it ever happens, we have nothing to fall back to, so we throw an error.
 * Should only be used for values that are required for further calculation.
 */
function resolveOptionalOrThrowUnexpectedError<T>(
  value: T | undefined | null,
  error?: InstanceType<typeof TaxUnexpectedError>,
): T {
  if (value === undefined || value === null) {
    throw error;
  }

  return value;
}

function resolveStringOrThrow(value: string | undefined | null): string {
  const parseResult = z
    .string({ required_error: "This field must be defined." })
    .min(1, { message: "This field can not be empty." })
    .safeParse(value);

  if (!parseResult.success) {
    throw new TaxUnexpectedError(parseResult.error.message);
  }

  return parseResult.data;
}

export const taxProviderUtils = {
  resolveOptionalOrThrowUnexpectedError,
  resolveStringOrThrow,
};
