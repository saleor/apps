import { TransactionFlowStrategyEnum } from "@/generated/graphql";

export interface PaymentMethod {
  getSupportedTransactionFlow(
    saleorTransactionFlow: TransactionFlowStrategyEnum,
  ): TransactionFlowStrategyEnum;
}
