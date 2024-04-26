import { captureException } from "@sentry/nextjs";
import { TRPCClientError } from "@trpc/client";
import { GraphQLError } from "graphql";
import { createLogger } from "../logger";

function resolveTrpcClientError(error: unknown) {
  if (error instanceof TRPCClientError) {
    return error.message;
  }

  return "Unknown error";
}

export const errorUtils = {
  resolveTrpcClientError,
};

const logger = createLogger("errorUtils");

export const checkSubscriptionPayloadForGraphQLErrors = (payload: any, subscription: string) => {
  // errors field is not yet typed on subscription payloads
  const possibleErrors = payload?.errors as GraphQLError[];

  if (possibleErrors) {
    logger.warn(`Payload contains GraphQL errors ${subscription}`, { subscription });

    possibleErrors.forEach((error) => {
      const graphQLError = new GraphQLError(
        error.message,
        error.nodes,
        error.source,
        error.positions,
        error.path,
        error.originalError,
        error.extensions,
      );

      logger.error("GraphQL error", {
        error: graphQLError,
        subscription,
      });

      captureException(graphQLError);
    });
  }
};
