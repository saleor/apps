import { TransactionActionEnum, TransactionEventTypeEnum } from "@/generated/graphql";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { TransactionEventReportInput } from "@/modules/saleor/transaction-event-reporter";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

type SharedProps = {
  pspRef: StripePaymentIntentId;
  amount: SaleorMoney;
  date: Date;
  saleorTransactionId: string;
};

export abstract class SaleorTransactionEventBase {
  abstract readonly saleorEventType: TransactionEventTypeEnum;
  abstract readonly availableActions: TransactionActionEnum[];
  abstract readonly message: string;
  readonly saleorTransactionId: string;
  readonly amount: SaleorMoney;
  readonly pspRef: StripePaymentIntentId;
  readonly date: Date;

  constructor(props: SharedProps) {
    this.pspRef = props.pspRef;
    this.amount = props.amount;
    this.date = props.date;
    this.saleorTransactionId = props.saleorTransactionId;
  }

  getTransactionReportVariables(): TransactionEventReportInput {
    return {
      transactionId: this.saleorTransactionId,
      amount: this.amount,
      type: this.saleorEventType,
      message: this.message,
      time: this.date.toISOString(),
      pspReference: this.pspRef,
    };
  }
}

export class TransactionChargeSuccess extends SaleorTransactionEventBase {
  readonly saleorEventType = "CHARGE_SUCCESS" as const;
  readonly availableActions = ["REFUND" as const];
  readonly message = "Successfully charged";
}

export class TransactionAuthorizationSuccess extends SaleorTransactionEventBase {
  readonly saleorEventType = "AUTHORIZATION_SUCCESS" as const;
  readonly availableActions = ["CANCEL" as const];
  readonly message = "Successfully authorized";
}
