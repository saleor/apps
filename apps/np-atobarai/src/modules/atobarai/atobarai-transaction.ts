import {
  CreditCheckResult,
  FailedReasonForCreditCheck,
  PendingReasonForCreditCheck,
} from "./atobarai-register-transaction-response";

interface IAtobaraiTransaction {
  getPspReference(): string;
  getPublicTranslatedMessage(): string;
}

export class PassedAtobaraiTransaction implements IAtobaraiTransaction {
  private npTransactionId: string;

  constructor(npTransactionId: string) {
    this.npTransactionId = npTransactionId;
  }

  getPublicTranslatedMessage(): string {
    return "審査が完了いたしました。NP後払いをご利用いただけます";
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

  getPublicTranslatedMessage(): string {
    return "ご注文ありがとうございました。店舗からの連絡をお待ち下さい";
  }

  getPspReference(): string {
    return this.npTransactionId;
  }
}

export class FailedAtobaraiTransaction implements IAtobaraiTransaction {
  private npTransactionId: string;
  private authoriNg: FailedReasonForCreditCheck;

  constructor(npTransactionId: string, authoriNg: FailedReasonForCreditCheck) {
    this.npTransactionId = npTransactionId;
    this.authoriNg = authoriNg;
  }
  getAuthoriResult(): "20" {
    return CreditCheckResult.Failed;
  }

  getPublicTranslatedMessage(): string {
    switch (this.authoriNg) {
      case "NG001":
        return "ご利用上限金額を超えているため、NP後払いをご利用いただけません。別の決済手段をご利用ください。詳細の確認をご希望の場合は、NPサポートデスクまでお問い合わせください。";
      case "NG002":
        return "情報不備がある可能性がございましたため、現時点ではNP後払いはご利用できません。別の決済手段をご利用ください。詳細の確認をご希望の場合は、お手数ですがNPサポートデスクまでお問い合わせください。";
      case "NG999":
        return "今回のご注文ではNP後払いをご利用いただけません。別の決済手段をご利用ください。詳細の確認をご希望の場合は、NPサポートデスクまでお問い合わせください。";
      default:
        return "";
    }
  }

  getPspReference(): string {
    return this.npTransactionId;
  }
}

export class BeforeReviewTransaction implements IAtobaraiTransaction {
  private npTransactionId: string;

  constructor(npTransactionId: string) {
    this.npTransactionId = npTransactionId;
  }

  getPublicTranslatedMessage(): string {
    return "";
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

export type AtobaraiFailureTransaction = FailedAtobaraiTransaction | BeforeReviewTransaction;
