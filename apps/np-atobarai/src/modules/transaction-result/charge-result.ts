import { Actions } from "@/generated/app-webhooks-types/transaction-initialize-session";

export class ChargeSuccessResult {
  readonly result = "CHARGE_SUCCESS" as const;
  readonly actions: Actions = ["REFUND"];
}

export class ChargeActionRequiredResult {
  readonly result = "CHARGE_ACTION_REQUIRED" as const;
  readonly actions: Actions = [];
}

export class ChargeFailureResult {
  readonly result = "CHARGE_FAILURE" as const;
  readonly actions: Actions = [];
}
