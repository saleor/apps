import { fromThrowable } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

export const ResolvedTransactionFlowValidationError = BaseError.subclass(
  "ResolvedTransactionFlowValidationError",
  {
    props: {
      _internalName: "ResolvedTransactionFlowValidationError" as const,
    },
  },
);

export type ResolvedTransactionFlowValidationErrorType = InstanceType<
  typeof ResolvedTransactionFlowValidationError
>;

const resolvedTransactionFlowSchema = z
  .enum(["AUTHORIZATION", "CHARGE"])
  .brand("ResolvedTransactionFlow");

export const createResolvedTransactionFlow = (raw: string) =>
  fromThrowable(resolvedTransactionFlowSchema.parse, (error) =>
    ResolvedTransactionFlowValidationError.normalize(error),
  )(raw);

export type ResolvedTransationFlow = z.infer<typeof resolvedTransactionFlowSchema>;
