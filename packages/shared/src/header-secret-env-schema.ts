import { z } from "zod";

/**
 * For env secrets sent in HTTP headers (Authorization, access tokens).
 * fetch throws on header values with characters outside Latin-1, so a non-ASCII secret
 * passes boot but fails every request. Rejecting it here fails fast with a clear error.
 */
export const headerSecretEnv = z
  .string()
  .regex(/^[\x20-\x7E]*$/, "Must contain only printable ASCII characters");
