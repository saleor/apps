export class ChargeFailureResult {
  readonly result = "CHARGE_FAILURE" as const;
  readonly actions = ["CHARGE"] as const;
  readonly message = "Payment intent failed";
}

export class AuthorizationFailureResult {
  readonly result = "AUTHORIZATION_FAILURE" as const;
  readonly actions = ["CANCEL"] as const;
  readonly message = "Payment intent failed";
}
