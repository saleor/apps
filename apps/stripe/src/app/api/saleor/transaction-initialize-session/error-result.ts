// special result classes only for transaction initialize session - for such errors we don't have pspReference or actions for staff user
export class TransactionInitializeChargeErrorResult {
  readonly result = "CHARGE_FAILURE" as const;
  readonly saleorEventAmount: number;

  constructor(args: { saleorEventAmount: number }) {
    this.saleorEventAmount = args.saleorEventAmount;
  }
}

export class TransactionInitializeAuthorizationErrorResult {
  readonly result = "AUTHORIZATION_FAILURE" as const;
  readonly saleorEventAmount: number;

  constructor(args: { saleorEventAmount: number }) {
    this.saleorEventAmount = args.saleorEventAmount;
  }
}
