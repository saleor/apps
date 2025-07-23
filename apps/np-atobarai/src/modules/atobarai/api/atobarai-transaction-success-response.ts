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
      z.discriminatedUnion("authori_result", [
        z.object({
          np_transaction_id: AtobaraiTransactionIdSchema,
          authori_result: z.literal(CreditCheckResult.Success),
        }),
        z.object({
          np_transaction_id: AtobaraiTransactionIdSchema,
          authori_result: z.literal(CreditCheckResult.Pending),
          authori_hold: z.array(
            z.enum([
              PendingReason.LackOfAddressInformation,
              PendingReason.AddressConfirmationOfWork,
              PendingReason.InsufficientDeliveryDestinationInformation,
              PendingReason.AddressConfirmationOfWorkDeliveryDestination,
              PendingReason.PhoneNumberError,
              PendingReason.PhoneNumberErrorAtDeliveryDestination,
              PendingReason.Other,
            ]),
          ),
        }),
        z.object({
          np_transaction_id: AtobaraiTransactionIdSchema,
          authori_result: z.literal(CreditCheckResult.Failed),
          authori_ng: z.enum([
            FailedReason.ExcessOfTheAmount,
            FailedReason.InsufficientInformation,
            FailedReason.Other,
          ]),
        }),
        z.object({
          np_transaction_id: AtobaraiTransactionIdSchema,
          authori_result: z.literal(CreditCheckResult.BeforeReview),
        }),
      ]),
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
