import { Actions } from "@/generated/json-schema/transaction-charge-requested";

export class ChargeFailureResult {
  readonly result = "CHARGE_FAILURE" as const;
  readonly actions: Actions = ["CHARGE"];
  readonly message = "Payment intent failed";
}

export class AuthorizationFailureResult {
  readonly result = "AUTHORIZATION_FAILURE" as const;
  readonly actions: Actions = ["CANCEL"];
  readonly message = "Payment intent failed";
}
