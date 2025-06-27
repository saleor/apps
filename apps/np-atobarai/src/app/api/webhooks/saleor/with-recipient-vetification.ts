import { NextAppRouterSyncWebhookHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { WebhookContext } from "@saleor/app-sdk/handlers/shared";
import { NextRequest } from "next/server";

import { EventMetadataFragment } from "@/generated/graphql";

type PayloadPartial = Pick<EventMetadataFragment, "recipient">;

export function withRecipientVerification<Payload extends PayloadPartial>(
  handler: NextAppRouterSyncWebhookHandler<Payload>,
) {
  return async (_req: NextRequest, ctx: WebhookContext<Payload>) => {
    const authDataId = ctx.authData.appId;
    const recipientId = ctx.payload.recipient?.id;

    if (authDataId !== recipientId) {
      return Response.json(
        { message: "Recipient ID does not match auth data ID" },
        { status: 403 },
      );
    }

    return handler(_req, ctx);
  };
}
