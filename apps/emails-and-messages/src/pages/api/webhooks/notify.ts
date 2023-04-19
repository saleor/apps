import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { logger as pinoLogger } from "../../../lib/logger";
import { sendEventMessages } from "../../../modules/event-handlers/send-event-messages";
import { createClient } from "../../../lib/create-graphql-client";
import { MessageEventTypes } from "../../../modules/event-handlers/message-event-types";

// Notify event handles multiple event types which are recognized based on payload field `notify_event`.
// Handler recognizes if event is one of the supported typed and sends appropriate message.

interface NotifySubscriptionPayload {
  notify_event: string;
  payload: NotifyEventPayload;
  meta: Meta;
}

interface Meta {
  issued_at: Date;
  version: string;
  issuing_principal: IssuingPrincipal;
}

interface IssuingPrincipal {
  id: null | string;
  type: null | string;
}

export interface NotifyEventPayload {
  user: User;
  recipient_email: string;
  channel_slug: string;
  domain: string;
  site_name: string;
  logo_url: string;
  token?: string;
  confirm_url?: string;
  reset_url?: string;
  delete_url?: string;
  old_email?: string;
  new_email?: string;
  redirect_url?: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  private_metadata: Record<string, string>;
  metadata: Record<string, string>;
  language_code: string;
}

export const notifyWebhook = new SaleorAsyncWebhook<NotifySubscriptionPayload>({
  name: "notify",
  webhookPath: "api/webhooks/notify",
  asyncEvent: "NOTIFY_USER",
  apl: saleorApp.apl,
  query: "{}", // We are using the default payload instead of subscription
});

const handler: NextWebhookApiHandler<NotifySubscriptionPayload> = async (req, res, context) => {
  const logger = pinoLogger.child({
    webhook: notifyWebhook.name,
  });

  logger.debug("Webhook received");

  const { payload, authData } = context;

  const { channel_slug: channel, recipient_email: recipientEmail } = payload.payload;

  if (!recipientEmail?.length) {
    logger.error(`The email recipient has not been specified in the event payload.`);
    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
  }

  // Notify webhook event groups multiple event types under the one webhook. We need to map it to events recognized by the App
  const notifyEventMapping: Record<string, MessageEventTypes> = {
    account_confirmation: "ACCOUNT_CONFIRMATION",
    account_delete: "ACCOUNT_DELETE",
    account_password_reset: "ACCOUNT_PASSWORD_RESET",
    account_change_email_request: "ACCOUNT_CHANGE_EMAIL_REQUEST",
    account_change_email_confirm: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
  };

  const event = notifyEventMapping[payload.notify_event];
  if (!event) {
    logger.error(`The type of received notify event (${payload.notify_event}) is not supported.`);
    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
  }

  const client = createClient(authData.saleorApiUrl, async () =>
    Promise.resolve({ token: authData.token })
  );

  await sendEventMessages({
    authData,
    channel,
    client,
    event,
    payload: payload.payload,
    recipientEmail,
  });

  return res.status(200).json({ message: "The event has been handled" });
};

export default notifyWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
