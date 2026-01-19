export type SaleorTransactionFlow = "AUTHORIZATION" | "CHARGE";

export const resolveSaleorTransactionFlow = (
  transactionFlow: string | null | undefined,
): SaleorTransactionFlow => {
  if (transactionFlow === "AUTHORIZATION") {
    return "AUTHORIZATION";
  }
  return "CHARGE";
};
