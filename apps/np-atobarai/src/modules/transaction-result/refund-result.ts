import { Actions } from "@/generated/app-webhooks-types/transaction-refund-requested";

export class RefundSuccessResult {
  readonly result = "REFUND_SUCCESS" as const;
  readonly actions: Actions = [];
}

export class RefundFailureResult {
  readonly result = "REFUND_FAILURE" as const;
  readonly actions: Actions = ["REFUND"];
}
