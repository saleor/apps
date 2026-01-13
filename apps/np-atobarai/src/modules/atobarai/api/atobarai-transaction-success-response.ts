import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

import { AtobaraiTransactionIdSchema } from "../atobarai-transaction-id";

export const CreditCheckResult = {
  Success: "00",
  Pending: "10",
  Failed: "20",
  BeforeReview: "40",
} as const;

export const PendingReason = {
  LackOfAddressInformation: "RE009",
  AddressConfirmationOfWork: "RE014",
  InsufficientDeliveryDestinationInformation: "RE015",
  AddressConfirmationOfWorkDeliveryDestination: "RE020",
  PhoneNumberError: "RE021",
  PhoneNumberErrorAtDeliveryDestination: "RE023",
  Other: "RE026",
} as const;

export const FailedReason = {
  ExcessOfTheAmount: "RE001",
  InsufficientInformation: "RE002",
  Other: "RE003",
} as const;

const schema = z
  .object({
    results: z.array(
      z.object({
        np_transaction_id: AtobaraiTransactionIdSchema,
        authori_result: z.string(),
        authori_hold: z.array(z.string()).optional(),
        authori_ng: z.string().optional(),
      }),
    ),
  })
  .brand("AtobaraiTransactionSuccessResponse");

export const AtobaraiTransactionSuccessResponseValidationError = BaseError.subclass(
  "AtobaraiTransactionSuccessResponseValidationError",
  {
    props: {
      _brand: "AtobaraiTransactionSuccessResponseValidationError" as const,
    },
  },
);

export const createAtobaraiTransactionSuccessResponse = (
  rawResponse: unknown | AtobaraiTransactionSuccessResponse,
) => {
  const parseResult = schema.safeParse(rawResponse);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiTransactionSuccessResponseValidationError(
      `Invalid Atobarai transaction success response format: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

/**
 * Success response used for registering and updating transactions in Atobarai.
 */
export type AtobaraiTransactionSuccessResponse = z.infer<typeof schema>;
