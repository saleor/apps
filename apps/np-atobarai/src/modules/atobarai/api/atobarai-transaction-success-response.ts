import { z } from "zod";

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

export const createAtobaraiTransactionSuccessResponse = (
  rawResponse: unknown | AtobaraiTransactionSuccessResponse,
) => schema.parse(rawResponse);

/**
 * Success response used for registering and updating transactions in Atobarai.
 */
export type AtobaraiTransactionSuccessResponse = z.infer<typeof schema>;
