import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

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
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiTerminalIdValidationError(`Invalid terminal ID: ${readableError.message}`, {
      cause: readableError,
    });
  }

  return parseResult.data;
};

/**
 * Id used in the NP Atobarai to uniquely identify the merchant system.
 */
export type AtobaraiTerminalId = z.infer<typeof schema>;
