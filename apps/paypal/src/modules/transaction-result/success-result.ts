export class ChargeSuccessResult {
  readonly result = "CHARGE_SUCCESS" as const;
  readonly actions = ["REFUND"] as const;
  readonly message = "PayPal payment has been successful";
}

export class AuthorizationSuccessResult {
  readonly result = "AUTHORIZATION_SUCCESS" as const;
  readonly actions = ["CHARGE", "CANCEL"] as const;
  readonly message = "PayPal authorization has been successful";
}

export class RefundSuccessResult {
  readonly result = "REFUND_SUCCESS" as const;
  readonly actions = [] as const;
  readonly message = "PayPal refund has been successful";
}
