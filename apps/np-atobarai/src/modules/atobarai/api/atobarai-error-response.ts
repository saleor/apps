import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

const schema = z
  .object({
    errors: z.array(
      z.object({
        codes: z.array(z.string()),
        id: z.string().optional(),
      }),
    ),
  })
  .brand("AtobaraiRegisterTransactionErrorResponse");

export const AtobaraiErrorResponseValidationError = BaseError.subclass(
  "AtobaraiErrorResponseValidationError",
  {
    props: {
      _brand: "AtobaraiErrorResponseValidationError" as const,
    },
  },
);

export const createAtobaraiErrorResponse = (rawResponse: unknown | AtobaraiErrorResponse) => {
  const parseResult = schema.safeParse(rawResponse);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiErrorResponseValidationError(
      `Invalid Atobarai error response format: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

export type AtobaraiErrorResponse = z.infer<typeof schema>;
