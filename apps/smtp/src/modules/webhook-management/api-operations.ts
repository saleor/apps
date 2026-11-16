import { type Client } from "urql";

import {
  AppWebhooksDocument,
  CreateAppWebhookDocument,
  type CreateAppWebhookMutationVariables,
  DeleteAppWebhookDocument,
} from "../../../generated/graphql";

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
