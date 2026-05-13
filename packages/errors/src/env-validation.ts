import type { ZodError } from "zod";
import { fromError } from "zod-validation-error";

/**
 * Used as `onValidationError` for `@t3-oss/env-nextjs` `createEnv` calls.
 * Prints the formatted message (via `zod-validation-error`) and the offending
 * issues to stderr, then exits with code 1 — without a noisy stack trace.
 */
export const formatEnvValidationError = (error: ZodError): never => {
  const validationError = fromError(error);

  // eslint-disable-next-line no-console
  console.error(validationError.toString());
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(error.issues, null, 2));

  process.exit(1);
};
