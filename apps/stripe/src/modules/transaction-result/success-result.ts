export class ChargeSuccessResult {
  readonly result = "CHARGE_SUCCESS" as const;
  readonly actions = ["REFUND"] as const;
  readonly message = "Payment intent has been successful";
}

export class AuthorizationSuccessResult {
  readonly result = "AUTHORIZATION_SUCCESS" as const;
  readonly actions = ["CHARGE", "CANCEL"] as const;
  readonly message = "Payment intent has been successful";
}
