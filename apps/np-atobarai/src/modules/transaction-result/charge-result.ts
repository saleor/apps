import { Actions } from "@/generated/app-webhooks-types/transaction-initialize-session";

export class ChargeSuccessResult {
  readonly result = "CHARGE_SUCCESS" as const;
  readonly actions: Actions = ["REFUND"];
  readonly message = "Successfully registered a NP Atobarai transaction";
}

export class ChargeActionRequiredResult {
  readonly result = "CHARGE_ACTION_REQUIRED" as const;
  readonly actions: Actions = [];
  readonly message = "NP Atobarai transaction requires further action";
}

export class ChargeFailureResult {
  readonly result = "CHARGE_FAILURE" as const;
  readonly actions: Actions = [];
  readonly message = "Failed to register a NP Atobarai transaction";
}
