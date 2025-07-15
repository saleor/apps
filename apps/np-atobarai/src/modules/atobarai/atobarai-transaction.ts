import { z } from "zod";

interface IAtobaraiTransaction {
  getPspReference(): string;
  // TODO: consider adding getPublicTranslatedMessage method - this can be used to display Japanese messages in the storefront
}

export class PassedAtobaraiTransaction implements IAtobaraiTransaction {
  static checkResult = "00" as const;
  static schema = z.object({
    np_transaction_id: z.string(),
    authori_result: z.literal(PassedAtobaraiTransaction.checkResult),
  });

  private npTransactionId: string;

  private constructor(npTransactionId: string) {
    this.npTransactionId = npTransactionId;
  }

  static createFromAtobaraiTransactionResponse(
    response: z.infer<typeof PassedAtobaraiTransaction.schema>,
  ): PassedAtobaraiTransaction {
    return new PassedAtobaraiTransaction(response.np_transaction_id);
  }

  getPspReference(): string {
    return this.npTransactionId;
  }
}

export type PendingAtobaraiTransactionCreditCheckReason =
  (typeof PendingAtobaraiTransaction.creditCheckReasons)[keyof typeof PendingAtobaraiTransaction.creditCheckReasons];

export class PendingAtobaraiTransaction implements IAtobaraiTransaction {
  static checkResult = "10" as const;
  static creditCheckReasons = {
    LackOfAddressInformation: "RE009",
    AddressConfirmationOfWork: "RE014",
    InsufficientDeliveryDestinationInformation: "RE015",
    AddressConfirmationOfWorkDeliveryDestination: "RE020",
    PhoneNumberError: "RE021",
    PhoneNumberErrorAtDeliveryDestination: "RE023",
    Other: "RE026",
  } as const;

  static schema = z.object({
    np_transaction_id: z.string(),
    authori_result: z.literal(PendingAtobaraiTransaction.checkResult),
    authori_hold: z.array(
      z.enum([
        PendingAtobaraiTransaction.creditCheckReasons.LackOfAddressInformation,
        PendingAtobaraiTransaction.creditCheckReasons.AddressConfirmationOfWork,
        PendingAtobaraiTransaction.creditCheckReasons.InsufficientDeliveryDestinationInformation,
        PendingAtobaraiTransaction.creditCheckReasons.AddressConfirmationOfWorkDeliveryDestination,
        PendingAtobaraiTransaction.creditCheckReasons.PhoneNumberError,
        PendingAtobaraiTransaction.creditCheckReasons.PhoneNumberErrorAtDeliveryDestination,
        PendingAtobaraiTransaction.creditCheckReasons.Other,
      ]),
    ),
  });

  private npTransactionId: string;
  private authoriHold: PendingAtobaraiTransactionCreditCheckReason[];

  private constructor(
    npTransactionId: string,
    authoriHold: PendingAtobaraiTransactionCreditCheckReason[],
  ) {
    this.npTransactionId = npTransactionId;
    this.authoriHold = authoriHold;
  }

  static createFromAtobaraiTransactionResponse(
    response: z.infer<typeof PendingAtobaraiTransaction.schema>,
  ): PendingAtobaraiTransaction {
    return new PendingAtobaraiTransaction(response.np_transaction_id, response.authori_hold);
  }

  getPspReference(): string {
    return this.npTransactionId;
  }

  getAuthoriHold(): PendingAtobaraiTransactionCreditCheckReason[] {
    return this.authoriHold;
  }
}

export type FailedAtobaraiTransactionCreditCheckReason =
  (typeof FailedAtobaraiTransaction.creditCheckReasons)[keyof typeof FailedAtobaraiTransaction.creditCheckReasons];

export class FailedAtobaraiTransaction implements IAtobaraiTransaction {
  static checkResult = "20" as const;
  static creditCheckReasons = {
    ExcessOfTheAmount: "NG001",
    InsufficientInformation: "NG002",
    Other: "NG999",
  } as const;

  static schema = z.object({
    np_transaction_id: z.string(),
    authori_result: z.literal(FailedAtobaraiTransaction.checkResult),
    authori_ng: z.enum([
      FailedAtobaraiTransaction.creditCheckReasons.ExcessOfTheAmount,
      FailedAtobaraiTransaction.creditCheckReasons.InsufficientInformation,
      FailedAtobaraiTransaction.creditCheckReasons.Other,
    ]),
  });

  private npTransactionId: string;
  private authoriNg: FailedAtobaraiTransactionCreditCheckReason;

  private constructor(
    npTransactionId: string,
    authoriNg: FailedAtobaraiTransactionCreditCheckReason,
  ) {
    this.npTransactionId = npTransactionId;
    this.authoriNg = authoriNg;
  }

  static createFromAtobaraiTransactionResponse(
    response: z.infer<typeof FailedAtobaraiTransaction.schema>,
  ): FailedAtobaraiTransaction {
    return new FailedAtobaraiTransaction(response.np_transaction_id, response.authori_ng);
  }

  getPspReference(): string {
    return this.npTransactionId;
  }

  getAuthoriNg(): FailedAtobaraiTransactionCreditCheckReason {
    return this.authoriNg;
  }
}

export class BeforeReviewTransaction implements IAtobaraiTransaction {
  static checkResult = "40" as const;
  static schema = z.object({
    np_transaction_id: z.string(),
    authori_result: z.literal(BeforeReviewTransaction.checkResult),
  });

  private npTransactionId: string;

  private constructor(npTransactionId: string) {
    this.npTransactionId = npTransactionId;
  }
  static createFromAtobaraiTransactionResponse(
    response: z.infer<typeof BeforeReviewTransaction.schema>,
  ): BeforeReviewTransaction {
    return new BeforeReviewTransaction(response.np_transaction_id);
  }

  getPspReference(): string {
    return this.npTransactionId;
  }
}

export type AtobaraiTransaction =
  | PassedAtobaraiTransaction
  | PendingAtobaraiTransaction
  | FailedAtobaraiTransaction
  | BeforeReviewTransaction;

export type AtobaraiSuccessTransaction = PassedAtobaraiTransaction | PendingAtobaraiTransaction;

export type AtobaraiErrorTransaction = FailedAtobaraiTransaction | BeforeReviewTransaction;
