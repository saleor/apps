import { Client, OperationResult } from "urql";

import {
  CreateWebhookDocument,
  CreateWebhookMutationVariables,
  DisableWebhookDocument,
  EnableWebhookDocument,
  FetchOwnWebhooksDocument,
  RemoveWebhookDocument,
} from "../../generated/graphql";
import { createLogger } from "../lib/logger";

const logger = createLogger("WebhookActivityTogglerService");

export interface IWebhooksActivityClient {
  fetchAppWebhooksIDs(id: string): Promise<string[]>;
  disableSingleWebhook(id: string): Promise<void>;
  enableSingleWebhook(id: string): Promise<void>;
  removeSingleWebhook(id: string): Promise<void>;
  createWebhook(input: CreateWebhookMutationVariables["input"]): Promise<void>;
}

interface IRecreateWebhooksArgs {
  baseUrl: string;
  enableWebhooks: boolean;
}

export interface IWebhookActivityTogglerService {
  enableOwnWebhooks(): Promise<void>;
}

export class WebhooksActivityClient implements IWebhooksActivityClient {
  constructor(private client: Pick<Client, "query" | "mutation">) {}

  private handleOperationFailure(r: OperationResult) {
    if (r.error || !r.data) {
      logger.error("Error disabling webhook", {
        error: r.error,
      });
      throw new Error("Error disabling webhook");
    }
  }

  fetchAppWebhooksIDs(id: string) {
    return this.client
      .query(FetchOwnWebhooksDocument, { id })
      .toPromise()
      .then((r) => {
        this.handleOperationFailure(r);

        if (!r.data?.app?.webhooks) {
          throw new Error("Webhooks not registered for app, something is wrong");
        }

        return r.data?.app?.webhooks?.map((w) => w.id);
      });
  }

  disableSingleWebhook(id: string): Promise<void> {
    return this.client
      .mutation(DisableWebhookDocument, {
        id,
      })
      .toPromise()
      .then((r) => {
        this.handleOperationFailure(r);

        return undefined;
      });
  }

  enableSingleWebhook(id: string): Promise<void> {
    return this.client
      .mutation(EnableWebhookDocument, {
        id,
      })
      .toPromise()
      .then((r) => {
        this.handleOperationFailure(r);

        return undefined;
      });
  }

  createWebhook(input: CreateWebhookMutationVariables["input"]): Promise<void> {
    return this.client
      .mutation(CreateWebhookDocument, {
        input,
      })
      .toPromise()
      .then((r) => {
        this.handleOperationFailure(r);

        return undefined;
      });
  }

  removeSingleWebhook(id: string): Promise<void> {
    return this.client
      .mutation(RemoveWebhookDocument, {
        id,
      })
      .toPromise()
      .then((r) => {
        this.handleOperationFailure(r);

        return undefined;
      });
  }
}

export class WebhookActivityTogglerService implements IWebhookActivityTogglerService {
  /**
   * Extracted separate client for easier testing without touching graphQL
   */
  private webhooksClient: IWebhooksActivityClient;

  constructor(
    private ownAppId: string,
    private client: Pick<Client, "query" | "mutation">,
    options?: {
      WebhooksClient: IWebhooksActivityClient;
    },
  ) {
    this.webhooksClient = options?.WebhooksClient ?? new WebhooksActivityClient(this.client);
  }

  async enableOwnWebhooks() {
    const webhooksIds = await this.webhooksClient.fetchAppWebhooksIDs(this.ownAppId);

    logger.info("Enabling own webhooks", { webhooksIds });

    if (!webhooksIds) {
      throw new Error("Failed fetching webhooks");
    }

    await Promise.all(webhooksIds.map((id) => this.webhooksClient.enableSingleWebhook(id)));
  }
}
