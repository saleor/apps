import { z } from "zod";

const errorSchema = z
  .object({
    errors: z.array(
      z.object({
        codes: z.array(z.string()),
        id: z.string(),
      }),
    ),
  })
  .brand("AtobaraiRegisterTransactionErrorResponse");

export const createAtobaraiRegisterTransactionErrorResponse = (rawResponse: unknown) =>
  errorSchema.parse(rawResponse);

export type AtobaraiRegisterTransactionErrorResponse = z.infer<typeof errorSchema>;

export const CreditCheckResult = {
  Passed: "00",
  Pending: "10",
  Failed: "20",
  BeforeReview: "40",
} as const;

export const FailedReasonForCreditCheck = {
  ExcessOfTheAmount: "NG001",
  InsufficientInformation: "NG002",
  Other: "NG999",
} as const;

export type FailedReasonForCreditCheck =
  (typeof FailedReasonForCreditCheck)[keyof typeof FailedReasonForCreditCheck];

export const PendingReasonForCreditCheck = {
  LackOfAddressInformation: "RE009",
  AddressConfirmationOfWork: "RE014",
  InsufficientDeliveryDestinationInformation: "RE015",
  AddressConfirmationOfWorkDeliveryDestination: "RE020",
  PhoneNumberError: "RE021",
  PhoneNumberErrorAtDeliveryDestination: "RE023",
  Other: "RE026",
} as const;

export type PendingReasonForCreditCheck =
  (typeof PendingReasonForCreditCheck)[keyof typeof PendingReasonForCreditCheck];

const successSchema = z
  .object({
    results: z.array(
      z.discriminatedUnion("authori_result", [
        z.object({
          np_transaction_id: z.string(),
          authori_result: z.literal(CreditCheckResult.Passed),
        }),
        z.object({
          np_transaction_id: z.string(),
          authori_result: z.literal(CreditCheckResult.Pending),
          authori_hold: z.array(
            z.enum([
              PendingReasonForCreditCheck.LackOfAddressInformation,
              PendingReasonForCreditCheck.AddressConfirmationOfWork,
              PendingReasonForCreditCheck.InsufficientDeliveryDestinationInformation,
              PendingReasonForCreditCheck.AddressConfirmationOfWorkDeliveryDestination,
              PendingReasonForCreditCheck.PhoneNumberError,
              PendingReasonForCreditCheck.PhoneNumberErrorAtDeliveryDestination,
              PendingReasonForCreditCheck.Other,
            ]),
          ),
        }),
        z.object({
          np_transaction_id: z.string(),
          authori_result: z.literal(CreditCheckResult.Failed),
          authori_ng: z.enum([
            FailedReasonForCreditCheck.ExcessOfTheAmount,
            FailedReasonForCreditCheck.InsufficientInformation,
            FailedReasonForCreditCheck.Other,
          ]),
        }),
        z.object({
          np_transaction_id: z.string(),
          authori_result: z.literal(CreditCheckResult.BeforeReview),
        }),
      ]),
    ),
  })
  .brand("AtobaraiRegisterTransactionSuccessResponse");

export const createAtobaraiRegisterTransactionSuccessResponse = (rawResponse: unknown) =>
  successSchema.parse(rawResponse);

export type AtobaraiRegisterTransactionSuccessResponse = z.infer<typeof successSchema>;
