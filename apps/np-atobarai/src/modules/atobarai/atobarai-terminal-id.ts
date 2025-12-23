import { BaseError } from "@saleor/errors";
import { z } from "zod";

const schema = z.string().min(1).brand("AtobaraiTerminalId");

export const AtobaraiTerminalIdValidationError = BaseError.subclass(
  "AtobaraiTerminalIdValidationError",
  {
    props: {
      _brand: "AtobaraiTerminalIdValidationError" as const,
    },
  },
);

export const createAtobaraiTerminalId = (raw: string) => {
  const parseResult = schema.safeParse(raw);

  if (!parseResult.success) {
    throw new AtobaraiTerminalIdValidationError(
      `Invalid terminal ID: ${parseResult.error.errors.map((e) => e.message).join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

/**
 * Id used in the NP Atobarai to uniquely identify the merchant system.
 */
export type AtobaraiTerminalId = z.infer<typeof schema>;
