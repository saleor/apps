import { BaseError } from "@saleor/errors";
import { z } from "zod";

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
    throw new AtobaraiSecretSpCodeValidationError(
      `Invalid secret SP code: ${parseResult.error.errors.map((e) => e.message).join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

/**
 * Used as password for basic authentication for NP Atobarai API. See `AtobaraiApiClient` for more details.
 */
export type AtobaraiSecretSpCode = z.infer<typeof schema>;
