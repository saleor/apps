import { APL } from "@saleor/app-sdk/APL";
import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { SyncWebhookEventType, WebhookManifest } from "@saleor/app-sdk/types";
import { ASTNode } from "graphql";
import { NextApiHandler } from "next";

export interface SaleorWebhook<TPayload = any, TResponse = any> {
  name: string;
  webhookPath: string;
  event: SyncWebhookEventType;
  apl: APL;
  subscriptionQueryAst?: ASTNode;
  query?: string;
  isActive?: boolean;

  getTargetUrl(baseUrl: string): string;
  getWebhookManifest(baseUrl: string): WebhookManifest;
  createHandler(handlerFn: NextWebhookApiHandler<TPayload, TResponse>): NextApiHandler<TResponse>;
}
