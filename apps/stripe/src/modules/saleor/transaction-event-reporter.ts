import { GraphQLClient } from "graphql-request";
import { err, ok, Result, ResultAsync } from "neverthrow";

import {
  TransactionActionEnum,
  TransactionEventReportDocument,
  TransactionEventTypeEnum,
} from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export type TransactionEventReportInput = {
  transactionId: string;
  message: string;
  amount: SaleorMoney;
  pspReference: StripePaymentIntentId;
  time: string;
  type: TransactionEventTypeEnum;
  actions: TransactionActionEnum[];
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

export const TransactionEventReporterErrors = {
  AlreadyReportedError,
  GraphqlError,
  UnhandledError,
};

export interface ITransactionEventReporter {
  reportTransactionEvent(
    input: TransactionEventReportInput,
  ): Promise<Result<TransactionEventReportResultResult, PossibleTransactionEventReportErrors>>;
}

export class TransactionEventReporter implements ITransactionEventReporter {
  private gqlClient: GraphQLClient;
  private logger = createLogger("TransactionEventReporter");

  constructor(deps: { graphqlClient: GraphQLClient }) {
    this.gqlClient = deps.graphqlClient;
  }

  async reportTransactionEvent(
    input: TransactionEventReportInput,
  ): Promise<Result<TransactionEventReportResultResult, PossibleTransactionEventReportErrors>> {
    try {
      const mutationResult = await ResultAsync.fromPromise(
        this.gqlClient.request(TransactionEventReportDocument, {
          ...input,
          amount: input.amount.amount,
          availableActions: input.actions,
        }),
        (error) => BaseError.normalize(error),
      );

      if (mutationResult.isErr()) {
        return err(
          new UnhandledError("Error reporting transaction event - server error", {
            cause: mutationResult.error,
          }),
        );
      }

      const { transactionEventReport } = mutationResult.value;

      const mutationErrors = transactionEventReport?.errors ?? [];

      const hasMoreThanOneError = mutationErrors.length > 1;

      if (hasMoreThanOneError) {
        this.logger.warn(
          "TransactionEventReport mutation has more than one error - handling the first one",
          mutationErrors,
        );
      }

      if (mutationErrors.length > 0) {
        switch (mutationErrors[0].code) {
          case "ALREADY_EXISTS": {
            return err(
              new AlreadyReportedError("Event already reported", {
                cause: BaseError.normalize(mutationErrors[0]),
              }),
            );
          }
          case "GRAPHQL_ERROR": {
            return err(
              new GraphqlError("Error reporting transaction event", {
                cause: BaseError.normalize(mutationErrors[0]),
              }),
            );
          }
          case "INVALID":
          case "NOT_FOUND":
          case "INCORRECT_DETAILS":
          case "REQUIRED": {
            return err(
              new UnhandledError("Error reporting transaction event", {
                cause: BaseError.normalize(mutationErrors[0]),
              }),
            );
          }
        }
      }

      if (!transactionEventReport?.transactionEvent) {
        return err(new UnhandledError("Error reporting transaction event: missing resolved data"));
      }

      if (transactionEventReport.alreadyProcessed) {
        return err(
          new AlreadyReportedError(
            `Event already reported: ${transactionEventReport.transactionEvent.id}`,
          ),
        );
      }

      return ok({
        createdEventId: transactionEventReport.transactionEvent.id,
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
