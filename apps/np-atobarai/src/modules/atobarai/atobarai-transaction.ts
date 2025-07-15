import { BaseError } from "@saleor/errors";

import {
  AtobaraiRegisterTransactionSuccessResponse,
  FailedReasonForCreditCheck,
  PendingReasonForCreditCheck,
} from "./atobarai-register-transaction-response";

interface IAtobaraiTransaction {
  getPspReference(): string;
  // TODO: consider adding getPublicTranslatedMessage method - this can be used to display Japanese messages in the storefront
}

export class PassedAtobaraiTransaction implements IAtobaraiTransaction {
  private npTransactionId: string;

  private constructor(npTransactionId: string) {
    this.npTransactionId = npTransactionId;
  }

  static createFromAtobaraiTransactionResponse(
    response: AtobaraiRegisterTransactionSuccessResponse["results"][number],
  ): PassedAtobaraiTransaction {
    return new PassedAtobaraiTransaction(response.np_transaction_id);
  }

  getPspReference(): string {
    return this.npTransactionId;
  }
}

export class PendingAtobaraiTransaction implements IAtobaraiTransaction {
  private npTransactionId: string;
  private authoriHold: PendingReasonForCreditCheck[];

  constructor(npTransactionId: string, authoriHold: PendingReasonForCreditCheck[]) {
    this.npTransactionId = npTransactionId;
    this.authoriHold = authoriHold;
  }

  getPspReference(): string {
    return this.npTransactionId;
  }

  getAuthoriHold(): PendingReasonForCreditCheck[] {
    return this.authoriHold;
  }
}

export class FailedAtobaraiTransaction implements IAtobaraiTransaction {
  private npTransactionId: string;
  private authoriNg: FailedReasonForCreditCheck;

  constructor(npTransactionId: string, authoriNg: FailedReasonForCreditCheck) {
    this.npTransactionId = npTransactionId;
    this.authoriNg = authoriNg;
  }

  getPspReference(): string {
    return this.npTransactionId;
  }

  getAuthoriNg(): FailedReasonForCreditCheck {
    return this.authoriNg;
  }
}

export class BeforeReviewTransaction implements IAtobaraiTransaction {
  private npTransactionId: string;

  constructor(npTransactionId: string) {
    this.npTransactionId = npTransactionId;
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

export const AtobaraiFailureTransactionErrorPublicCode = "AtobaraiFailureTransactionError";

export const AtobaraiFailureTransactionError = BaseError.subclass(
  "AtobaraiFailureTransactionError",
  {
    props: {
      publicCode: AtobaraiFailureTransactionErrorPublicCode,
      publicMessage: "Atobarai credit check failed",
    },
  },
);
