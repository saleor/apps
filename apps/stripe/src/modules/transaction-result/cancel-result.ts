export class CancelSuccessResult {
  readonly result = "CANCEL_SUCCESS" as const;
  readonly actions = [] as const;
  readonly message = "Payment intent was cancelled";
}

export class CancelFailureResult {
  readonly result = "CANCEL_FAILURE" as const;
  readonly actions = ["CANCEL"] as const;
}
