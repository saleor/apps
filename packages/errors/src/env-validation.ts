import type { ZodError } from "zod";
import { fromError } from "zod-validation-error";

const canExitProcess = (): boolean =>
  typeof process !== "undefined" && typeof process.exit === "function";

/**
 * Used as `onValidationError` for `@t3-oss/env-nextjs` `createEnv` calls.
 * Prints the formatted message (via `zod-validation-error`) and the offending
 * issues to stderr without a noisy stack trace.
 *
 * In Node, exits the process with code 1 so misconfigured deployments fail loudly.
 * In environments without `process.exit` (browser, Edge runtime), throws the
 * formatted `ZodValidationError` instead so the bundle does not crash on a
 * missing `process.exit`.
 */
export const formatEnvValidationError = (error: ZodError): never => {
  const validationError = fromError(error);

  // eslint-disable-next-line no-console
  console.error(validationError.toString());
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(error.issues, null, 2));

  if (canExitProcess()) {
    return process.exit(1);
  }

  throw validationError;
};
