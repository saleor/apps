import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

const schema = z.string().min(1).brand("AtobaraiSecretSpCode");

export const AtobaraiSecretSpCodeValidationError = BaseError.subclass(
  "AtobaraiSecretSpCodeValidationError",
  {
    props: {
      _brand: "AtobaraiSecretSpCodeValidationError" as const,
    },
  },
);

export const createAtobaraiSecretSpCode = (raw: string) => {
  const parseResult = schema.safeParse(raw);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiSecretSpCodeValidationError(
      `Invalid secret SP code: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

/**
 * Used as password for basic authentication for NP Atobarai API. See `AtobaraiApiClient` for more details.
 */
export type AtobaraiSecretSpCode = z.infer<typeof schema>;
