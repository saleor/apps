import { useMutation } from "@tanstack/react-query";
import request from "graphql-request";
import { useParams } from "next/navigation";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { BaseError, UnknownError } from "@/lib/errors";

const TransactionProcessMutation = graphql(`
  mutation TransactionProcess($transactionId: ID!, $data: JSON) {
    transactionProcess(id: $transactionId, data: $data) {
      transaction {
        id
      }
      data
      errors {
        field
        message
        code
      }
    }
  }
`);

const ProcessTransactionError = BaseError.subclass("ProcessTransactionError");

const saleorDataSchema = z
  .object({
    paymentIntent: z.object({
      errors: z
        .array(
          z.object({
            code: z.string(),
            message: z.string(),
          }),
        )
        .optional(),
    }),
  })
  .nullable();

const createTransactionProcessMutationFn = async (args: {
  envUrl: string;
  transactionId: string;
  data?: unknown;
}) => {
  const response = await request(args.envUrl, TransactionProcessMutation, {
    transactionId: args.transactionId,
    data: args.data,
  }).catch((error) => {
    throw BaseError.normalize(error, UnknownError);
  });

  if (!response.transactionProcess) {
    throw new ProcessTransactionError("No response from processTransaction mutation.");
  }

  if (response.transactionProcess.errors.length > 0) {
    throw new ProcessTransactionError("Errors in processTransaction mutation.", {
      errors: response.transactionProcess.errors.map((e) => ProcessTransactionError.normalize(e)),
    });
  }

  const parsedSaleorDataResult = saleorDataSchema.safeParse(response.transactionProcess.data);

  if (!parsedSaleorDataResult.success) {
    throw new ProcessTransactionError("Failed to parse Saleor data from processSession mutation.", {
      errors: parsedSaleorDataResult.error.errors,
    });
  }

  return {
    ...response.transactionProcess,
    data: parsedSaleorDataResult.data,
  };
};

export const useTransactionProcessMutation = () => {
  const params = useParams<{
    envUrl: string;
  }>();
  const envUrl = decodeURIComponent(params.envUrl);

  const transactionProcessMutation = useMutation({
    mutationFn: (args: { transactionId: string }) =>
      createTransactionProcessMutationFn({
        envUrl,
        transactionId: args.transactionId,
      }),
    useErrorBoundary: true,
    mutationKey: ["stripeTransactionProcess"],
  });

  return transactionProcessMutation;
};
