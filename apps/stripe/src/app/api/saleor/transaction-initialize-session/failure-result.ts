// special result classes only for transaction initialize session - for such failures we don't have pspReference or actions for staff user
export class TransactionInitializeChargeFailureResult {
  readonly result = "CHARGE_FAILURE" as const;
  readonly saleorEventAmount: number;

  constructor(args: { saleorEventAmount: number }) {
    this.saleorEventAmount = args.saleorEventAmount;
  }
}

export class TransactionInitializeAuthorizationFailureResult {
  readonly result = "AUTHORIZATION_FAILURE" as const;
  readonly saleorEventAmount: number;

  constructor(args: { saleorEventAmount: number }) {
    this.saleorEventAmount = args.saleorEventAmount;
  }
}
