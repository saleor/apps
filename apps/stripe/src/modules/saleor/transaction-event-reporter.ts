import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import {
  TransactionEventReportDocument,
  TransactionEventReportErrorCode,
  TransactionEventTypeEnum,
} from "@/generated/graphql";
import { BaseError } from "@/lib/errors";

export type TransactionEventReportInput = {
  transactionId: "";
  message: "";
  amount: undefined;
  pspReference: "";
  time: undefined;
  type: TransactionEventTypeEnum;
};

export type PossibleTransactionEventReportErrors = InstanceType<
  typeof TransactionEventReporter.AlreadyReportedError
>;

export type TransactionEventReportResultResult = {
  createdEventId: string;
};

export class TransactionEventReporter {
  static AlreadyReportedError = BaseError.subclass(
    "TransactionEventReporter.AlreadyReportedError",
    {
      props: {
        _internalName: "TransactionEventReporter.AlreadyReportedError",
      },
    },
  );

  static GraphqlError = BaseError.subclass("TransactionEventReporter.GraphqlError", {
    props: {
      _internalName: "TransactionEventReporter.GraphqlError",
    },
  });

  static UnhandledError = BaseError.subclass("TransactionEventReporter.UnhandledError", {
    props: {
      _internalName: "TransactionEventReporter.UnhandledError",
    },
  });

  private gqlClient: Pick<Client, "mutation">;

  constructor(deps: { graphqlClient: Pick<Client, "mutation"> }) {
    this.gqlClient = deps.graphqlClient;
  }

  async reportTransactionEvent(
    input: TransactionEventReportInput,
  ): Promise<Result<TransactionEventReportResultResult, PossibleTransactionEventReportErrors>> {
    try {
      const mutationResult = await this.gqlClient.mutation(TransactionEventReportDocument, input);

      const { data, error } = mutationResult;

      if (error) {
        switch (error.cause as TransactionEventReportErrorCode) {
          case "ALREADY_EXISTS": {
            return err(
              new TransactionEventReporter.AlreadyReportedError(`Event already reported`, {
                cause: error,
              }),
            );
          }
          case "GRAPHQL_ERROR": {
            return err(
              new TransactionEventReporter.GraphqlError("Error reporting transaction event", {
                cause: error,
              }),
            );
          }
          case "INVALID":
          case "NOT_FOUND":
          case "INCORRECT_DETAILS":
          case "REQUIRED": {
            return err(
              new TransactionEventReporter.UnhandledError("Error reporting transaction event", {
                cause: error,
              }),
            );
          }
        }
      }

      if (!data?.transactionEventReport?.transactionEvent) {
        return err(
          new TransactionEventReporter.UnhandledError(
            "Error reporting transaction event: missing resolved data",
            {
              cause: error,
            },
          ),
        );
      }

      if (data.transactionEventReport.alreadyProcessed) {
        return err(
          new TransactionEventReporter.AlreadyReportedError(
            `Event already reported: ${data.transactionEventReport.transactionEvent.id}`,
          ),
        );
      }

      return ok({
        createdEventId: data.transactionEventReport.transactionEvent.id,
      });
    } catch (e) {
      return err(
        new TransactionEventReporter.GraphqlError("Error reporting transaction event", {
          cause: e,
        }),
      );
    }
  }
}
