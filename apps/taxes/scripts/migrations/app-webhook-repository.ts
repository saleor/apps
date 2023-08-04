import { createGraphQLClient } from "@saleor/apps-shared";
import { Client, gql } from "urql";
import {
  CreateAppWebhookDocument,
  CreateAppWebhookMutation,
  CreateAppWebhookMutationVariables,
  DeleteAppWebhookDocument,
  DeleteAppWebhookMutation,
  DeleteAppWebhookMutationVariables,
  FetchAppWebhooksDocument,
  FetchAppWebhooksQuery,
} from "../../generated/graphql";

gql`
  query FetchAppWebhooks {
    app {
      webhooks {
        id
        name
        subscriptionQuery
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
  mutation DeleteAppWebhook($id: ID!) {
    webhookDelete(id: $id) {
      webhook {
        id
      }
    }
  }
`;

export class AppWebhookRepository {
  private client: Client;

  constructor({ apiUrl, appToken }: { apiUrl: string; appToken: string }) {
    const client = createGraphQLClient({
      saleorApiUrl: apiUrl,
      token: appToken,
    });

    this.client = client;
  }

  async getAll() {
    const { error, data } = await this.client
      .query<FetchAppWebhooksQuery>(FetchAppWebhooksDocument, {})
      .toPromise();

    if (error) {
      console.error(error);
      return [];
    }

    return data?.app?.webhooks ?? [];
  }

  async create(variables: CreateAppWebhookMutationVariables) {
    const { error, data } = await this.client.mutation<CreateAppWebhookMutation>(
      CreateAppWebhookDocument,
      variables
    );

    if (error) {
      console.error(error);
      throw error;
    }

    return data?.webhookCreate?.webhook?.id;
  }

  async delete(id: string) {
    const { error, data } = await this.client.mutation<DeleteAppWebhookMutation>(
      DeleteAppWebhookDocument,
      {
        id,
      } as DeleteAppWebhookMutationVariables
    );

    if (error) {
      console.error(error);
      throw error;
    }

    return data?.webhookDelete?.webhook?.id;
  }
}
