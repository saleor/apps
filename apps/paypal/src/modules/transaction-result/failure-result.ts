export class ChargeFailureResult {
  readonly result = "CHARGE_FAILURE" as const;
  readonly actions = ["CHARGE"] as const;
  readonly message = "PayPal payment failed";
}

export class AuthorizationFailureResult {
  readonly result = "AUTHORIZATION_FAILURE" as const;
  readonly actions = ["CANCEL"] as const;
  readonly message = "PayPal authorization failed";
}

export class RefundFailureResult {
  readonly result = "REFUND_FAILURE" as const;
  readonly actions = ["REFUND"] as const;
  readonly message = "PayPal refund failed";
}
