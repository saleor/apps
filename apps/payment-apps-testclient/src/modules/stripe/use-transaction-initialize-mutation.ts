import { useMutation } from "@tanstack/react-query";
import request from "graphql-request";
import { useParams } from "next/navigation";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { BaseError, UnknownError } from "@/lib/errors";
import { getIdempotencyKey } from "@/lib/idempotency-key";

const TransactionInitializeMutation = graphql(`
  mutation TransactionInitialize(
    $checkoutId: ID!
    $data: JSON
    $idempotencyKey: String
    $paymentGatewayId: String!
    $amount: PositiveDecimal!
  ) {
    transactionInitialize(
      id: $checkoutId
      paymentGateway: { id: $paymentGatewayId, data: $data }
      amount: $amount
      idempotencyKey: $idempotencyKey
    ) {
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

const TransactionInitializeError = BaseError.subclass("TransactionInitializeError");

const saleorDataSchema = z.object({
  paymentIntent: z.object({
    stripeClientSecret: z.string().optional(),
    errors: z
      .array(
        z.object({
          code: z.string(),
          message: z.string(),
        }),
      )
      .optional(),
  }),
});

const createTransactionInitializeMutationFn = async (args: {
  envUrl: string;
  checkoutId: string;
  paymentGatewayId: string;
  data: unknown;
  amount: number;
  idempotencyKey: string;
}) => {
  const response = await request(args.envUrl, TransactionInitializeMutation, {
    checkoutId: args.checkoutId,
    data: args.data,
    amount: args.amount,
    idempotencyKey: args.idempotencyKey,
    paymentGatewayId: args.paymentGatewayId,
  }).catch((error) => {
    throw BaseError.normalize(error, UnknownError);
  });

  if (!response.transactionInitialize) {
    throw new TransactionInitializeError("No response from initializeTransaction mutation.");
  }

  if (response.transactionInitialize.errors.length > 0) {
    throw new TransactionInitializeError("Errors in initializeTransaction mutation.", {
      errors: response.transactionInitialize.errors.map((e) =>
        TransactionInitializeError.normalize(e),
      ),
    });
  }

  const parsedSaleorDataResult = saleorDataSchema.safeParse(response.transactionInitialize.data);

  if (!parsedSaleorDataResult.success) {
    throw new TransactionInitializeError(
      "Failed to parse Saleor data from initializeTransaction mutation.",
      {
        errors: parsedSaleorDataResult.error.errors,
      },
    );
  }

  return {
    ...response.transactionInitialize,
    data: parsedSaleorDataResult.data,
  };
};

export const useTransactionInitializeMutation = () => {
  const params = useParams<{
    envUrl: string;
    checkoutId: string;
    paymentGatewayId: string;
  }>();

  const envUrl = decodeURIComponent(params.envUrl);
  const checkoutId = decodeURIComponent(params.checkoutId);
  const paymentGatewayId = decodeURIComponent(params.paymentGatewayId);

  const transactionInitializeMutation = useMutation({
    mutationFn: (args: { data: unknown; saleorAmount: number }) =>
      createTransactionInitializeMutationFn({
        envUrl,
        checkoutId,
        paymentGatewayId,
        amount: args.saleorAmount,
        idempotencyKey: getIdempotencyKey(),
        data: args.data,
      }),
    useErrorBoundary: true,
    mutationKey: ["stripeTransactionInitialize"],
  });

  return transactionInitializeMutation;
};
