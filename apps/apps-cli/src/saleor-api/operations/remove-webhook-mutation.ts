import request from "graphql-request";

import { graphql } from "../generated/gql";

const removeWebhookMutationDocument = graphql(/* GraphQL */ `
  mutation RemoveWebhook($webhookId: ID!) {
    webhookDelete(id: $webhookId) {
      errors {
        field
        message
      }
    }
  }
`);

export const removeWebhookMutation = async ({
  saleorApiUrl,
  token,
  webhookId,
}: {
  saleorApiUrl: string;
  token: string;
  webhookId: string;
}) => {
  const { webhookDelete } = await request(
    saleorApiUrl,
    removeWebhookMutationDocument,
    {
      webhookId,
    },
    { "Authorization-Bearer": token }
  );

  if (webhookDelete?.errors.length) {
    console.log("Sth went wrong", webhookDelete.errors);
    throw new Error(`Remove webhook mutation failed`);
  }

  return;
};
