import { Actions } from "@/generated/app-webhooks-types/transaction-refund-requested";

export class RefundSuccessResult {
  readonly result = "REFUND_SUCCESS" as const;
  readonly actions: Actions = [];
  readonly message = "Successfully processed NP Atobarai transaction refund";
}

type Reason =
  | "cancelFailure"
  | "registerFailure"
  | "fulfillmentFailure"
  | "missingData"
  | "changeTransaction";

export class RefundFailureResult {
  readonly result = "REFUND_FAILURE" as const;
  readonly actions: Actions = ["REFUND"];
  readonly message: string;

  private getMessageBasedOnReason(reason: Reason): string {
    switch (reason) {
      case "cancelFailure":
        return "Failed to process NP Atobarai transaction refund: canceling transaction failed";
      case "registerFailure":
        return "Failed to process NP Atobarai transaction refund: re-registering transaction failed";
      case "fulfillmentFailure":
        return "Failed to process NP Atobarai transaction refund: fulfilling transaction failed";
      case "missingData":
        return "Failed to process NP Atobarai transaction refund: missing required data for refund";
      case "changeTransaction":
        return "Failed to process NP Atobarai transaction refund: changing transaction failed";
      default:
        return "Failed to process NP Atobarai transaction refund";
    }
  }

  constructor({ reason }: { reason: Reason }) {
    this.message = this.getMessageBasedOnReason(reason);
  }
}
