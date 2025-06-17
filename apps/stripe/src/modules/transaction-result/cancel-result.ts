import { Actions } from "@/generated/json-schema/transaction-cancelation-requested";

export class CancelSuccessResult {
  readonly result = "CANCEL_SUCCESS" as const;
  readonly actions: Actions = [];
  readonly message = "Payment intent was cancelled";
}

export class CancelFailureResult {
  readonly result = "CANCEL_FAILURE" as const;
  readonly actions: Actions = ["CANCEL"];
}
