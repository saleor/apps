import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { TransactionEventReportDocument } from "@/generated/graphql";

import { env } from "./env";

const saleorApi = graphql.link(env.INTEGRATION_SALEOR_API_URL);

const handlers = [
  saleorApi.mutation(TransactionEventReportDocument, () => {
    return HttpResponse.json({
      data: {
        transactionEventReport: {
          errors: [],
          transactionEvent: {
            id: "test-saleor-event-id",
          },
        },
      },
    });
  }),
];

export const mswServer = setupServer(...handlers);
