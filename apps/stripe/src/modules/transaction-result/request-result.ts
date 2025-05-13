export class ChargeRequestResult {
  readonly result = "CHARGE_REQUEST" as const;
  readonly actions = [];
  readonly message = "Payment intent is processing";
}

export class AuthorizationRequestResult {
  readonly result = "AUTHORIZATION_REQUEST" as const;
  readonly actions = [];
  readonly message = "Payment intent is processing";
}
