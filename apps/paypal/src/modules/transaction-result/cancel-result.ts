export class CancelSuccessResult {
  readonly result = "CANCEL_SUCCESS" as const;
  readonly actions = [] as const;
  readonly message = "PayPal order has been cancelled successfully";
}

export class CancelFailureResult {
  readonly result = "CANCEL_FAILURE" as const;
  readonly actions = ["CANCEL"] as const;
  readonly message = "PayPal order cancellation failed";
}
