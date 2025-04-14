import { TransactionActionEnum, TransactionEventTypeEnum } from "@/generated/graphql";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

interface TransactionRequestBase {
  readonly saleorEventType: TransactionEventTypeEnum;
  readonly availableActions: TransactionActionEnum[];
  readonly amount: SaleorMoney;
  readonly message: string;
  readonly pspRef: StripePaymentIntentId;
  readonly date: Date;
}

export class TransactionChargeSuccess implements TransactionRequestBase {
  readonly saleorEventType = "CHARGE_SUCCESS" as const;
  readonly availableActions = ["REFUND" as const];
  readonly amount: SaleorMoney;
  readonly pspRef: StripePaymentIntentId;
  readonly message = "Successfully charged";
  readonly date: Date;

  constructor(props: { pspRef: StripePaymentIntentId; amount: SaleorMoney; date: Dat }) {
    this.pspRef = props.pspRef;
    this.amount = props.amount;
    this.date = props.date;
  }
}

export class TransactionAuthorizationSuccess implements TransactionRequestBase {
  readonly saleorEventType = "AUTHORIZATION_SUCCESS" as const;
  readonly availableActions = ["CANCEL" as const];
  readonly amount: SaleorMoney;
  readonly pspRef: StripePaymentIntentId;
  readonly message = "Successfully authorized";
  readonly date: Date;

  constructor(props: { pspRef: StripePaymentIntentId; amount: SaleorMoney; date: Date }) {
    this.pspRef = props.pspRef;
    this.amount = props.amount;
    this.date = props.date;
  }
}
