import { Actions } from "@/generated/json-schema/transaction-charge-requested";

export class ChargeSuccessResult {
  readonly result = "CHARGE_SUCCESS" as const;
  readonly actions: Actions = ["REFUND"];
  readonly message = "Payment intent has been successful";
}

export class AuthorizationSuccessResult {
  readonly result = "AUTHORIZATION_SUCCESS" as const;
  readonly actions: Actions = ["CHARGE", "CANCEL"];
  readonly message = "Payment intent has been successful";
}
