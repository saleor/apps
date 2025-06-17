import { Actions } from "@/generated/json-schema/transaction-refund-requested";

export class RefundSuccessResult {
  readonly result = "REFUND_SUCCESS" as const;
  readonly actions: Actions = ["REFUND"];
  readonly message = "Refund was successful";
}

export class RefundFailureResult {
  readonly result = "REFUND_FAILURE" as const;
  readonly actions: Actions = ["REFUND"];
  readonly message = "Refund failed";
}

export class RefundRequestResult {
  readonly result = "REFUND_REQUEST" as const;
  readonly actions: Actions = [];
  readonly message = "Refund is processing";
}
