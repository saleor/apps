import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createLogger, createGraphQLClient } from "@saleor/apps-shared";
import { sendEventMessages } from "../../../modules/event-handlers/send-event-messages";
import { NotifySubscriptionPayload, notifyEventMapping } from "../../../lib/notify-event-types";

// TODO: explain this event

export const notifyWebhook = new SaleorAsyncWebhook<NotifySubscriptionPayload>({
  name: "notify",
  webhookPath: "api/webhooks/notify",
  asyncEvent: "NOTIFY_USER",
  apl: saleorApp.apl,
  query: "{}", // We are using the default payload instead of subscription
});

const logger = createLogger({
  name: notifyWebhook.webhookPath,
});

const handler: NextWebhookApiHandler<NotifySubscriptionPayload> = async (req, res, context) => {
  logger.debug("Webhook received");

  const { payload, authData } = context;

  const { channel_slug: channel, recipient_email: recipientEmail } = payload.payload;

  if (!recipientEmail?.length) {
    logger.error(`The email recipient has not been specified in the event payload.`);
    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
  }

  const event = notifyEventMapping[payload.notify_event];

  if (!event) {
    // NOTIFY webhook sends multiple events to the same endpoint. The app supports only a subset of them.
    logger.debug(`The type of received notify event (${payload.notify_event}) is not supported.`);
    return res.status(200).json({ message: `${payload.notify_event} event is not supported.` });
  }

  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

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
