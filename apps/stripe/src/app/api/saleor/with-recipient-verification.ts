import { NextAppRouterSyncWebhookHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { WebhookContext } from "@saleor/app-sdk/handlers/shared";
import { NextRequest } from "next/server";

//Graphql part of the fragment responsible for recipient
type PayloadPartial = { readonly recipient?: { id: string } | null };

export function withRecipientVerification<Payload extends PayloadPartial>(
  handler: NextAppRouterSyncWebhookHandler<Payload>,
) {
  return async (_req: NextRequest, ctx: WebhookContext<Payload>) => {
    const authDataId = ctx.authData.appId;
    const recipientId = ctx.payload.recipient?.id;

    if (authDataId !== recipientId) {
      return new Response("Recipient ID does not match auth data ID", { status: 403 });
    }

    return handler(_req, ctx);
  };
}
