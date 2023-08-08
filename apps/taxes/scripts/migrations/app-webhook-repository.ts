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
  constructor(private client: Client) {}

  async getAll() {
    const { error, data } = await this.client
      .query<FetchAppWebhooksQuery>(FetchAppWebhooksDocument, {})
      .toPromise();

    if (error) {
      console.log("Error while fetching app webhooks, returning empty array");

      return [];
    }

    return data?.app?.webhooks ?? [];
  }

  async create(variables: CreateAppWebhookMutationVariables) {
    const { error, data } = await this.client
      .mutation<CreateAppWebhookMutation>(CreateAppWebhookDocument, variables)
      .toPromise();

    if (error) {
      console.log({ method: "create", name: error.name, message: error.message });

      throw error;
    }

    return data?.webhookCreate?.webhook?.id;
  }

  async delete(id: string) {
    const { error, data } = await this.client
      .mutation<DeleteAppWebhookMutation>(DeleteAppWebhookDocument, {
        id,
      } as DeleteAppWebhookMutationVariables)
      .toPromise();

    console.log(data, error);

    if (error) {
      console.log({ method: "delete", name: error.name, message: error.message });

      throw error;
    }

    return data?.webhookDelete?.webhook?.id;
  }
}
