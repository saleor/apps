import { fromThrowable } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

export const SaleorTransactionFlowValidationError = BaseError.subclass(
  "SaleorTransactionFlowValidationError",
  {
    props: {
      _internalName: "SaleorTransactionFlowValidationError" as const,
    },
  },
);

const saleorTransactionFlowSchema = z
  .enum(["AUTHORIZATION", "CHARGE"])
  .brand("SaleorTransactionFlow");

export const createSaleorTransactionFlow = (raw: string) =>
  fromThrowable(saleorTransactionFlowSchema.parse, (error) =>
    SaleorTransactionFlowValidationError.normalize(error),
  )(raw);

export type SaleorTransationFlow = z.infer<typeof saleorTransactionFlowSchema>;
