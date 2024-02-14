import { Client, gql } from "urql";
import {
  CreateAppWebhookDocument,
  CreateAppWebhookMutation,
  CreateAppWebhookMutationVariables,
  DeleteAppWebhookDocument,
  DeleteAppWebhookMutation,
  DeleteAppWebhookMutationVariables,
  DisableWebhookDocument,
  DisableWebhookMutation,
  DisableWebhookMutationVariables,
  EnableWebhookDocument,
  EnableWebhookMutation,
  EnableWebhookMutationVariables,
  FetchAppWebhooksDocument,
  FetchAppWebhooksQuery,
  UpdateAppWebhookDocument,
  UpdateAppWebhookMutation,
  UpdateAppWebhookMutationVariables,
  WebhookUpdateInput,
} from "../../generated/graphql";

gql`
  query FetchAppWebhooks {
    app {
      webhooks {
        id
        name
      }
    }
  }
`;

gql`
  mutation CreateAppWebhook(
    $appId: ID!
    $name: String!
    $targetUrl: String!
    $query: String
    $isActive: Boolean!
    $asyncEvents: [WebhookEventTypeAsyncEnum!]
    $syncEvents: [WebhookEventTypeSyncEnum!]
  ) {
    webhookCreate(
      input: {
        app: $appId
        name: $name
        targetUrl: $targetUrl
        query: $query
        isActive: $isActive
        asyncEvents: $asyncEvents
        syncEvents: $syncEvents
      }
    ) {
      webhook {
        id
      }
    }
  }
`;

gql`
  mutation UpdateAppWebhook($id: ID!, $input: WebhookUpdateInput!) {
    webhookUpdate(id: $id, input: $input) {
      webhook {
        id
      }
    }
  }
`;

gql`
  mutation DeleteAppWebhook($id: ID!) {
    webhookDelete(id: $id) {
      webhook {
        id
      }
    }
  }
`;

gql`
  mutation DisableWebhook($id: ID!) {
    webhookUpdate(id: $id, input: { isActive: false }) {
      webhook {
        id
      }
    }
  }
`;

gql`
  mutation EnableWebhook($id: ID!) {
    webhookUpdate(id: $id, input: { isActive: true }) {
      webhook {
        id
      }
    }
  }
`;

export class AppWebhookRepository {
  constructor(private client: Client) {}

  async getAll() {
    const { error, data } = await this.client
      .query<FetchAppWebhooksQuery>(FetchAppWebhooksDocument, {})
      .toPromise();

    if (error) {
      console.log("❌ Was not able to fetch app webhooks", error.message);

      throw error;
    }

    return data?.app?.webhooks ?? [];
  }

  async create(variables: CreateAppWebhookMutationVariables) {
    const { error, data } = await this.client
      .mutation<CreateAppWebhookMutation>(CreateAppWebhookDocument, variables)
      .toPromise();

    if (error) {
      console.log(
        `❌ Was not able to create webhook for the app ${variables.appId}`,
        error.message,
      );

      throw error;
    }

    return data?.webhookCreate?.webhook?.id;
  }

  async disable(id: string) {
    const { error, data } = await this.client
      .mutation<DisableWebhookMutation>(DisableWebhookDocument, {
        id,
      } as DisableWebhookMutationVariables)
      .toPromise();

    if (error) {
      console.log(`❌ Was not able to disable webhook ${id}`, error.message);

      throw error;
    }

    return data?.webhookUpdate?.webhook?.id;
  }

  async enable(id: string) {
    const { error, data } = await this.client
      .mutation<EnableWebhookMutation>(EnableWebhookDocument, {
        id,
      } as EnableWebhookMutationVariables)
      .toPromise();

    if (error) {
      console.log(`❌ Was not able to enable webhook ${id}`, error.message);

      throw error;
    }

    return data?.webhookUpdate?.webhook?.id;
  }

  async delete(id: string) {
    const { error, data } = await this.client
      .mutation<DeleteAppWebhookMutation>(DeleteAppWebhookDocument, {
        id,
      } as DeleteAppWebhookMutationVariables)
      .toPromise();

    console.log(data, error);

    if (error) {
      console.log(`❌ Was not able to delete webhook ${id}`, error.message);

      throw error;
    }

    return data?.webhookDelete?.webhook?.id;
  }

  async update(id: string, input: WebhookUpdateInput) {
    const { error, data } = await this.client
      .mutation<UpdateAppWebhookMutation>(UpdateAppWebhookDocument, {
        id,
        input,
      } as UpdateAppWebhookMutationVariables)
      .toPromise();

    if (error) {
      console.log(`❌ Was not able to update webhook ${id}`, error.message);

      throw error;
    }

    return data?.webhookUpdate?.webhook?.id;
  }
}
