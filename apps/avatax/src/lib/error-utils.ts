import { TRPCClientError } from "@trpc/client";
import { GraphQLError } from "graphql";
import { BaseError } from "../error";
import { logger } from "../logger";
import { CalculateTaxesPayload } from "../modules/webhooks/payloads/calculate-taxes-payload";
import { OrderCancelledPayload } from "../modules/webhooks/payloads/order-cancelled-payload";
import { OrderConfirmedPayload } from "../modules/webhooks/payloads/order-confirmed-payload";

export function resolveTrpcClientError(error: unknown) {
  if (error instanceof TRPCClientError) {
    return error.message;
  }

  return "Unknown error";
}

export class SubscriptionPayloadErrorChecker {
  static SubscriptionPayloadError = BaseError.subclass("SubscriptionPayloadError");

  constructor(
    private injectedLogger: Pick<typeof logger, "error">,
    private injectedErrorCapture: (expection: any) => void,
  ) {}

  checkPayload(payload: CalculateTaxesPayload | OrderCancelledPayload | OrderConfirmedPayload) {
    // @ts-expect-error errors field is not yet typed on subscription payloads
    const possibleErrors = payload?.errors as GraphQLError[];

    const subscription = payload.__typename;

    if (possibleErrors) {
      possibleErrors.forEach((error) => {
        const graphQLError = new SubscriptionPayloadErrorChecker.SubscriptionPayloadError(
          error.message,
          {
            props: {
              subscription,
              source: error.source,
              path: error.path,
            },
          },
        );

        this.injectedLogger.error(`Payload contains GraphQL error for ${subscription}`, {
          error: graphQLError,
          subscription,
        });

        this.injectedErrorCapture(graphQLError);
      });
    }
  }
}
