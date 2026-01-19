export class ChargeActionRequiredResult {
  readonly result = "CHARGE_ACTION_REQUIRED" as const;
  readonly actions = ["CANCEL"] as const;
  readonly message = "PayPal payment requires user action";
}

export class AuthorizationActionRequiredResult {
  readonly result = "AUTHORIZATION_ACTION_REQUIRED" as const;
  readonly actions = ["CANCEL"] as const;
  readonly message = "PayPal authorization requires user action";
}