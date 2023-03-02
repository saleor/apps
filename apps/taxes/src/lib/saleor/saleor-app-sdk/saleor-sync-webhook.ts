import { APL } from "@saleor/app-sdk/APL";
import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { SyncWebhookEventType, WebhookManifest } from "@saleor/app-sdk/types";
import { ASTNode } from "graphql";
import { NextApiHandler } from "next";
// todo: move to app-sdk
import {
  getBaseUrl,
  gqlAstToString,
  SALEOR_API_URL_HEADER,
  toStringOrUndefined,
  WebhookContext,
  WebhookManifestConfiguration,
} from "./saleor-app-sdk-copy";
import { SaleorWebhook } from "./saleor-webhook";

export class SaleorSyncWebhook<TPayload = any, TResponse = any>
  implements SaleorWebhook<TPayload, TResponse>
{
  name: string;
  webhookPath: string;
  event: SyncWebhookEventType;
  apl: APL;
  subscriptionQueryAst?: ASTNode;
  query?: string;
  isActive?: boolean;
  constructor(configuration: WebhookManifestConfiguration) {
    const { name, webhookPath, syncEvent, apl, isActive = true } = configuration;
    this.name = name || `${syncEvent} webhook`;
    if ("query" in configuration) {
      this.query = configuration.query;
    }
    if ("subscriptionQueryAst" in configuration) {
      this.subscriptionQueryAst = configuration.subscriptionQueryAst;
    }
    if (!this.subscriptionQueryAst && !this.query) {
      // todo: replace with WebhookError in sdk
      throw new Error(
        "Need to specify `subscriptionQueryAst` or `query` to create webhook subscription"
      );
    }

    this.webhookPath = webhookPath;
    this.event = syncEvent;
    this.isActive = isActive;
    this.apl = apl;
  }
  getTargetUrl(baseUrl: string): string {
    return new URL(this.webhookPath, baseUrl).href;
  }
  getWebhookManifest(baseUrl: string): WebhookManifest {
    return {
      name: this.name,
      targetUrl: this.getTargetUrl(baseUrl),
      syncEvents: [this.event],
      isActive: this.isActive,
      // Query can be provided as plaintext..
      ...(this.query && { query: this.query }),
      // ...GQL AST which has to be stringified..
      ...(this.subscriptionQueryAst && { query: gqlAstToString(this.subscriptionQueryAst) }),
      // or no query at all. In such case default webhook payload will be sent
    };
  }
  createHandler(handlerFn: NextWebhookApiHandler<TPayload, TResponse>): NextApiHandler<TResponse> {
    return async (req, res) => {
      const saleorApiUrl = toStringOrUndefined(req.headers[SALEOR_API_URL_HEADER]);

      if (!saleorApiUrl) {
        return res.status(400).end();
      }

      const authData = await this.apl.get(saleorApiUrl);

      if (!authData) {
        return res.status(401).end();
      }

      const baseUrl = getBaseUrl(req.headers);

      const context: WebhookContext<TPayload> = {
        authData,
        baseUrl,
        event: this.event,
        payload: req.body,
      };
      return handlerFn(req, res, context);
    };
  }
}
