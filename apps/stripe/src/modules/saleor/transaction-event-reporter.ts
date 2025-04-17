import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import {
  TransactionEventReportDocument,
  TransactionEventReportErrorCode,
  TransactionEventTypeEnum,
} from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export type TransactionEventReportInput = {
  transactionId: string;
  message: string;
  amount: SaleorMoney;
  pspReference: StripePaymentIntentId;
  time: string;
  type: TransactionEventTypeEnum;
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
  private gqlClient: Pick<Client, "mutation">;

  constructor(deps: { graphqlClient: Pick<Client, "mutation"> }) {
    this.gqlClient = deps.graphqlClient;
  }

  async reportTransactionEvent(
    input: TransactionEventReportInput,
  ): Promise<Result<TransactionEventReportResultResult, PossibleTransactionEventReportErrors>> {
    try {
      const mutationResult = await this.gqlClient.mutation(TransactionEventReportDocument, {
        ...input,
        amount: input.amount.amount,
      });

      const { data, error } = mutationResult;

      if (error) {
        switch (error.cause as TransactionEventReportErrorCode) {
          case "ALREADY_EXISTS": {
            return err(
              new AlreadyReportedError(`Event already reported`, {
                cause: error,
              }),
            );
          }
          case "GRAPHQL_ERROR": {
            return err(
              new GraphqlError("Error reporting transaction event", {
                cause: error,
              }),
            );
          }
          case "INVALID":
          case "NOT_FOUND":
          case "INCORRECT_DETAILS":
          case "REQUIRED": {
            return err(
              new UnhandledError("Error reporting transaction event", {
                cause: error,
              }),
            );
          }
        }
      }

      if (!data?.transactionEventReport?.transactionEvent) {
        return err(
          new UnhandledError("Error reporting transaction event: missing resolved data", {
            cause: error,
          }),
        );
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
