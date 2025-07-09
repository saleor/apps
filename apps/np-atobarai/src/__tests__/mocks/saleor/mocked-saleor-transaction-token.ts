import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";

export const mockedSaleorTransactionToken = createSaleorTransactionToken(
  "mocked-saleor-transaction-token-uuid",
);
