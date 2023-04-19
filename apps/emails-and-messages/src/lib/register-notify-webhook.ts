import { Client, gql } from "urql";
import { WebhookCreateMutationDocument, WebhookEventTypeEnum } from "../../generated/graphql";
import { notifyWebhook } from "../pages/api/webhooks/notify";

const webhookCreateMutation = gql`
  mutation webhookCreateMutation($input: WebhookCreateInput!) {
    webhookCreate(input: $input) {
      webhook {
        id
        name
        isActive
      }
      errors {
        field
        message
      }
    }
  }
`;

interface RegisterNotifyWebhookArgs {
  client: Client;
  baseUrl: string;
}

export const registerNotifyWebhook = async ({ client, baseUrl }: RegisterNotifyWebhookArgs) => {
  const manifest = notifyWebhook.getWebhookManifest(baseUrl);

  return await client
    .mutation(WebhookCreateMutationDocument, {
      input: {
        name: manifest.name,
        targetUrl: manifest.targetUrl,
        events: [WebhookEventTypeEnum.NotifyUser],
        isActive: true,
      },
    })
    .toPromise();
};
