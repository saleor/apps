import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import { OrderNoteAddDocument } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";

export type AddNoteResult = {
  noteId: string;
};

const GraphqlError = BaseError.subclass("OrderNoteService.GraphqlError", {
  props: {
    _internalName: "OrderNoteService.GraphqlError",
  },
});

const UnhandledError = BaseError.subclass("OrderNoteService.UnhandledError", {
  props: {
    _internalName: "OrderNoteService.UnhandledError",
  },
});

const ServerError = BaseError.subclass("OrderNoteService.ServerError", {
  props: {
    _internalName: "OrderNoteService.ServerError",
  },
});

export const OrderNoteServiceErrors = {
  GraphqlError,
  UnhandledError,
  ServerError,
};

export type OrderNoteServiceErrors =
  | InstanceType<typeof GraphqlError>
  | InstanceType<typeof UnhandledError>
  | InstanceType<typeof ServerError>;

export interface IOrderNoteService {
  addNote({
    orderId,
    message,
  }: {
    orderId: string;
    message: string;
  }): Promise<Result<AddNoteResult, OrderNoteServiceErrors>>;
}

export class OrderNoteService implements IOrderNoteService {
  private gqlClient: Pick<Client, "mutation">;
  private logger = createLogger("OrderNoteService");

  constructor(deps: { graphqlClient: Pick<Client, "mutation"> }) {
    this.gqlClient = deps.graphqlClient;
  }

  async addNote({
    orderId,
    message,
  }: {
    orderId: string;
    message: string;
  }): Promise<Result<AddNoteResult, OrderNoteServiceErrors>> {
    try {
      const mutationResult = await this.gqlClient.mutation(OrderNoteAddDocument, {
        orderId,
        message,
      });

      const { data, error } = mutationResult;

      if (error) {
        return err(
          new ServerError("Server error while reporting transaction event", {
            cause: error,
          }),
        );
      }

      const mutationErrors = data?.orderNoteAdd?.errors ?? [];

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
          case "GRAPHQL_ERROR":
            return err(
              new GraphqlError("GraphQL error while adding order note", {
                cause: BaseError.normalize(mutationError),
              }),
            );

          case "REQUIRED":
            return err(
              new UnhandledError("Required field missing in order note mutation", {
                cause: BaseError.normalize(mutationError),
              }),
            );
        }
      }

      if (!data?.orderNoteAdd?.event?.id) {
        return err(new UnhandledError("No event ID returned from order note add mutation"));
      }

      return ok({
        noteId: data.orderNoteAdd.event.id,
      });
    } catch (error) {
      return err(
        new GraphqlError("Error reporting transaction event", {
          cause: error,
        }),
      );
    }
  }
}
