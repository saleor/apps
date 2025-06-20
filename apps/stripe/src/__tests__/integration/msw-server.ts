import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { env } from "./env";

const saleorApi = graphql.link(env.INTEGRATION_SALEOR_API_URL);

const handlers = [
  saleorApi.mutation("TransactionEventReport", () => {
    return HttpResponse.json({
      data: {
        transactionEventReport: {
          __typename: "TransactionEventReport",
          transactionEvent: {
            id: "test-saleor-event-id",
          },
        },
      },
    });
  }),
];

export const mswServer = setupServer(...handlers);
