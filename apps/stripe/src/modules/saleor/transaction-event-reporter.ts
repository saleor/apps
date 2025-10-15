import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import {
  PaymentMethodDetailsInput,
  TransactionActionEnum,
  TransactionEventReportDocument,
  TransactionEventReportWithPaymentDetailsDocument,
  TransactionEventTypeEnum,
} from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { StripeRefundId } from "../stripe/stripe-refund-id";

export type TransactionEventReportInput = {
  transactionId: string;
  message: string;
  amount: SaleorMoney;
  pspReference: StripePaymentIntentId | StripeRefundId;
  time: string;
  type: TransactionEventTypeEnum;
  actions: TransactionActionEnum[] | null;
  externalUrl: string;
  saleorPaymentMethodDetailsInput: PaymentMethodDetailsInput | null;
};

export type PossibleTransactionEventReportErrors = InstanceType<typeof AlreadyReportedError>;

export type TransactionEventReportResultResult = {
  createdEventId: string;
};

const AlreadyReportedError = BaseError.subclass("TransactionEventReporter.AlreadyReportedError", {
  props: {
    _internalName: "TransactionEventReporter.AlreadyReportedError",
  },
});

const GraphqlError = BaseError.subclass("TransactionEventReporter.GraphqlError", {
  props: {
    _internalName: "TransactionEventReporter.GraphqlError",
  },
});

const UnhandledError = BaseError.subclass("TransactionEventReporter.UnhandledError", {
  props: {
    _internalName: "TransactionEventReporter.UnhandledError",
  },
});

const ServerError = BaseError.subclass("TransactionEventReporter.ServerError", {
  props: {
    _internalName: "TransactionEventReporter.ServerError",
  },
});

export const TransactionEventReporterErrors = {
  AlreadyReportedError,
  GraphqlError,
  UnhandledError,
  ServerError,
};

export interface ITransactionEventReporter {
  reportTransactionEvent(
    input: TransactionEventReportInput,
  ): Promise<Result<TransactionEventReportResultResult, PossibleTransactionEventReportErrors>>;
}

export class TransactionEventReporter implements ITransactionEventReporter {
  private gqlClient: Pick<Client, "mutation">;
  private logger = createLogger("TransactionEventReporter");

  constructor(deps: { graphqlClient: Pick<Client, "mutation"> }) {
    this.gqlClient = deps.graphqlClient;
  }

  async reportTransactionEvent(
    input: TransactionEventReportInput,
  ): Promise<Result<TransactionEventReportResultResult, PossibleTransactionEventReportErrors>> {
    try {
      const mutationResult = await this.gqlClient.mutation(
        input.saleorPaymentMethodDetailsInput
          ? TransactionEventReportWithPaymentDetailsDocument
          : TransactionEventReportDocument,
        {
          ...input,
          amount: input.amount.amount,
          availableActions: input.actions,
          paymentMethodDetails: input.saleorPaymentMethodDetailsInput,
        },
      );

      const { data, error } = mutationResult;

      if (error) {
        return err(
          new ServerError("Server error while reporting transaction event", {
            cause: error,
          }),
        );
      }

      const mutationErrors = data?.transactionEventReport?.errors ?? [];

      if (mutationErrors.length > 0) {
        const hasMoreThanOneError = mutationErrors.length > 1;

        if (hasMoreThanOneError) {
          this.logger.warn(
            "TransactionEventReport mutation has more than one GraphQL error - handling the first one",
            mutationErrors,
          );
        }
        const mutationError = mutationErrors[0];

        switch (mutationError.code) {
          case "ALREADY_EXISTS": {
            return err(
              new AlreadyReportedError("Event already reported", {
                cause: BaseError.normalize(mutationError),
              }),
            );
          }
          case "GRAPHQL_ERROR": {
            return err(
              new GraphqlError("Error reporting transaction event", {
                cause: BaseError.normalize(mutationError),
              }),
            );
          }
          case "INVALID":
          case "NOT_FOUND":
          case "INCORRECT_DETAILS":
          case "REQUIRED": {
            return err(
              new UnhandledError("Error reporting transaction event", {
                cause: BaseError.normalize(mutationError),
              }),
            );
          }
        }
      }

      if (!data?.transactionEventReport?.transactionEvent) {
        return err(new UnhandledError("Error reporting transaction event: missing resolved data"));
      }

      if (data.transactionEventReport.alreadyProcessed) {
        return err(
          new AlreadyReportedError(
            `Event already reported: ${data.transactionEventReport.transactionEvent.id}`,
          ),
        );
      }

      return ok({
        createdEventId: data.transactionEventReport.transactionEvent.id,
      });
    } catch (e) {
      return err(
        new GraphqlError("Error reporting transaction event", {
          cause: e,
        }),
      );
    }
  }
}
