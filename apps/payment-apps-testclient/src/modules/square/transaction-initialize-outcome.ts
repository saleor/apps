export type TransactionInitializeOutcome = "authorization" | "success" | "failure" | "unknown";

export const getTransactionInitializeOutcome = (
  transactionEvent: { type: string | null } | null,
): TransactionInitializeOutcome => {
  if (transactionEvent?.type === "CHARGE_SUCCESS") {
    return "success";
  }

  if (transactionEvent?.type === "AUTHORIZATION_SUCCESS") {
    return "authorization";
  }

  if (transactionEvent?.type === "CHARGE_FAILURE") {
    return "failure";
  }

  return "unknown";
};
