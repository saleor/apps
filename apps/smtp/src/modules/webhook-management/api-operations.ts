import { Client, gql } from "urql";
import {
  AppWebhooksDocument,
  CreateAppWebhookDocument,
  CreateAppWebhookMutationVariables,
  DeleteAppWebhookDocument,
} from "../../../generated/graphql";

gql`
  fragment WebhookDetails on Webhook {
    id
    name
    asyncEvents {
      name
      eventType
    }
    isActive
  }

  query AppWebhooks {
    app {
      webhooks {
        ...WebhookDetails
      }
    }
  }

  mutation CreateAppWebhook($input: WebhookCreateInput!) {
    webhookCreate(input: $input) {
      errors {
        field
        message
      }
      webhook {
        ...WebhookDetails
      }
    }
  }

  mutation DeleteAppWebhook($id: ID!) {
    webhookDelete(id: $id) {
      errors {
        field
        message
      }
      webhook {
        ...WebhookDetails
      }
    }
  }
`;

export const fetchAppWebhooks = ({ client }: { client: Client }) =>
  client
    .query(AppWebhooksDocument, {})
    .toPromise()
    .then((response) => {
      if (response.error) {
        throw new Error(response.error.message);
      }

      const appData = response.data?.app;

      if (!appData) {
        throw new Error(
          "App data not found in the response. The token can be invalid or the app has been uninstalled.",
        );
      }
      return appData.webhooks || [];
    });

export const createAppWebhook = ({
  client,
  variables,
}: {
  client: Client;
  variables: CreateAppWebhookMutationVariables["input"];
}) =>
  client
    .mutation(CreateAppWebhookDocument, { input: variables })
    .toPromise()
    .then((response) => {
      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log("create wh", response.data?.webhookCreate?.errors);
      const webhookCreateData = response.data?.webhookCreate?.webhook;

      if (!webhookCreateData) {
        throw new Error("Webhook Creation did not return any data nor error.");
      }
      return webhookCreateData;
    });

export const deleteAppWebhook = ({ client, id }: { client: Client; id: string }) =>
  client
    .mutation(DeleteAppWebhookDocument, { id })
    .toPromise()
    .then((response) => {
      if (response.error) {
        throw new Error(response.error.message);
      }
      return;
    });
