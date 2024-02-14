import { TRPCClientError } from "@trpc/client";

function resolveTrpcClientError(error: unknown) {
  if (error instanceof TRPCClientError) {
    return error.message;
  }

  return "Unknown error";
}

export const errorUtils = {
  resolveTrpcClientError,
};
