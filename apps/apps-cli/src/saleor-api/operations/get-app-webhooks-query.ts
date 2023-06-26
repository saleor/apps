import request from "graphql-request";

import { graphql } from "../generated/gql";

const getAppWebhooksQueryDocument = graphql(/* GraphQL */ `
  query GetAppWebhooks($id: ID!) {
    app(id: $id) {
      webhooks {
        id
        name
        isActive
        syncEvents {
          name
          eventType
        }
        asyncEvents {
          name
          eventType
        }
        targetUrl
        eventDeliveries(first: 10) {
          edges {
            node {
              id
              createdAt
              status
              eventType
              attempts(first: 10) {
                edges {
                  node {
                    id
                    createdAt
                    taskId
                    duration
                    response
                    status
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

export const getAppWebhooksQuery = async ({
  saleorApiUrl,
  token,
  appId,
}: {
  saleorApiUrl: string;
  token: string;
  appId: string;
}) => {
  const { app } = await request(
    saleorApiUrl,
    getAppWebhooksQueryDocument,
    {
      id: appId,
    },
    { "Authorization-Bearer": token }
  );

  return app?.webhooks ?? [];
};
