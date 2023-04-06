import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { Client, gql } from "urql";
import {
  AppWebhooksDocument,
  WebhookCreateDocument,
  WebhookDeleteDocument,
} from "../../generated/graphql";
import { invoiceSentWebhook } from "../pages/api/webhooks/invoice-sent";

const WebhookDetails = gql`
  fragment WebhookDetails on Webhook {
    id
    isActive
    name
  }
`;

const WebhookCreateMutation = gql`
  ${WebhookDetails}
  mutation WebhookCreate($input: WebhookCreateInput!) {
    webhookCreate(input: $input) {
      webhook {
        ...WebhookDetails
      }
      errors {
        field
        message
      }
    }
  }
`;

const AppWebhooksQuery = gql`
  query AppWebhooks {
    app {
      webhooks {
        id
        name
      }
    }
  }
`;

const WebhookDeleteMutation = gql`
  mutation WebhookDelete($id: ID!) {
    webhookDelete(id: $id) {
      errors {
        field
        message
      }
    }
  }
`;

export const setupWebhooks = async (client: Client, configurationID: string) => {
  const eventName = "INVOICE_SENT";

  const newWebhook = await createWebhookMutate(client, {});
};

export const createWebhookMutate = async (client: Client, webhook: SaleorAsyncWebhook) => {
  // TODO: The base URL should be configurable
  const manifest = invoiceSentWebhook.getWebhookManifest("https://example.com");

  const { error, data } = await client
    .mutation(WebhookCreateDocument, {
      input: {
        name: manifest.name,
        targetUrl: manifest.targetUrl,
        isActive: true,
      },
    })
    .toPromise();

  if (error || data?.webhookCreate?.errors?.length) {
    throw new Error("Could not create webhook");
  }

  return data?.webhookCreate?.webhook;
};

export const deleteWebhookMutate = async (client: Client, webhookId: string) => {
  const { error, data } = await client
    .mutation(WebhookDeleteDocument, {
      id: webhookId,
    })
    .toPromise();

  if (error || data?.webhookDelete?.errors?.length) {
    throw new Error("Could not delete webhook");
  }

  return;
};

// export const updateWebhook = async (client: Client, webhook: SaleorAsyncWebhook) => {
//   const { error, data } = await client
//     .mutation(UpdateWebhookDocument, {
//       id: webhook.id,
//       input: webhook,
//     })
//     .toPromise();

//   if (error) {
//     throw new Error("Could not update webhook");
//   }

//   return data?.webhookUpdate?.webhook;
// };

export const getAllWebhooks = async (client: Client) => {
  const { error, data } = await client.query(AppWebhooksDocument, {}).toPromise();

  if (error) {
    throw new Error("Could not fetch webhooks");
  }

  return data?.app?.webhooks;
};
