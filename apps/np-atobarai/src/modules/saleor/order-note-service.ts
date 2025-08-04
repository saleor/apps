import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import { OrderNoteAddDocument } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";

export type OrderNoteAddInput = {
  orderId: string;
  message: string;
};

export type PossibleOrderNoteServiceErrors =
  | InstanceType<typeof GraphqlError>
  | InstanceType<typeof UnhandledError>
  | InstanceType<typeof ServerError>;

export type OrderNoteServiceResult = {
  noteId: string;
};

const GraphqlError = BaseError.subclass("OrderNoteService.GraphqlError", {
  props: {
    _brand: "OrderNoteService.GraphqlError" as const,
  },
});

const UnhandledError = BaseError.subclass("OrderNoteService.UnhandledError", {
  props: {
    _brand: "OrderNoteService.UnhandledError" as const,
  },
});

const ServerError = BaseError.subclass("OrderNoteService.ServerError", {
  props: {
    _brand: "OrderNoteService.ServerError" as const,
  },
});

export const OrderNoteServiceErrors = {
  GraphqlError,
  UnhandledError,
  ServerError,
};

export interface IOrderNoteService {
  addOrderNote(
    input: OrderNoteAddInput,
  ): Promise<Result<OrderNoteServiceResult, PossibleOrderNoteServiceErrors>>;
}

export class OrderNoteService implements IOrderNoteService {
  private gqlClient: Pick<Client, "mutation">;
  private logger = createLogger("OrderNoteService");

  constructor(deps: { graphqlClient: Pick<Client, "mutation"> }) {
    this.gqlClient = deps.graphqlClient;
  }

  async addOrderNote(
    input: OrderNoteAddInput,
  ): Promise<Result<OrderNoteServiceResult, PossibleOrderNoteServiceErrors>> {
    try {
      const mutationResult = await this.gqlClient.mutation(OrderNoteAddDocument, {
        order: input.orderId,
        input: { message: input.message },
      });

      const { data, error } = mutationResult;

      if (error) {
        return err(
          new ServerError("Server error while adding order note", {
            cause: error,
          }),
        );
      }

      const mutationErrors = data?.orderNoteAdd?.errors ?? [];

      if (mutationErrors.length > 0) {
        const hasMoreThanOneError = mutationErrors.length > 1;

        if (hasMoreThanOneError) {
          this.logger.warn(
            "OrderNoteAdd mutation has more than one GraphQL error - handling the first one",
            mutationErrors,
          );
        }
        const mutationError = mutationErrors[0];

        switch (mutationError.code) {
          case "GRAPHQL_ERROR": {
            return err(
              new GraphqlError("Error adding order note", {
                cause: BaseError.normalize(mutationError),
              }),
            );
          }
          case "REQUIRED": {
            return err(
              new UnhandledError("Error adding order note", {
                cause: BaseError.normalize(mutationError),
              }),
            );
          }
        }
      }

      if (!data?.orderNoteAdd?.event) {
        return err(new UnhandledError("Error adding order note: missing resolved data"));
      }

      return ok({
        noteId: data.orderNoteAdd.event.id,
      });
    } catch (e) {
      return err(
        new UnhandledError("Error adding order note", {
          cause: e,
        }),
      );
    }
  }
}
