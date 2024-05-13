import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import {
  OrderCancelledWebhookPayloadFragment,
  OrderDetailsFragmentDoc,
} from "../../../../generated/graphql";
import { SendEventMessagesUseCase } from "../../../modules/event-handlers/send-event-messages.use-case";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { SmtpConfigurationService } from "../../../modules/smtp/configuration/smtp-configuration.service";
import { FeatureFlagService } from "../../../modules/feature-flag-service/feature-flag-service";
import { SmtpMetadataManager } from "../../../modules/smtp/configuration/smtp-metadata-manager";
import { createSettingsManager } from "../../../lib/metadata-manager";
import { SmtpEmailSender } from "../../../modules/smtp/smtp-email-sender";
import { EmailCompiler } from "../../../modules/smtp/email-compiler";
import { HandlebarsTemplateCompiler } from "../../../modules/smtp/template-compiler";
import { HtmlToTextCompiler } from "../../../modules/smtp/html-to-plaintext";
import { MjmlCompiler } from "../../../modules/smtp/compile-mjml";

const OrderCancelledWebhookPayload = gql`
  ${OrderDetailsFragmentDoc}
  fragment OrderCancelledWebhookPayload on OrderCancelled {
    order {
      ...OrderDetails
    }
  }
`;

const OrderCancelledGraphqlSubscription = gql`
  ${OrderCancelledWebhookPayload}
  subscription OrderCancelled {
    event {
      ...OrderCancelledWebhookPayload
    }
  }
`;

export const orderCancelledWebhook = new SaleorAsyncWebhook<OrderCancelledWebhookPayloadFragment>({
  name: "Order Cancelled in Saleor",
  webhookPath: "api/webhooks/order-cancelled",
  asyncEvent: "ORDER_CANCELLED",
  apl: saleorApp.apl,
  query: OrderCancelledGraphqlSubscription,
});

const logger = createLogger(orderCancelledWebhook.webhookPath);

const handler: NextWebhookApiHandler<OrderCancelledWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  logger.debug("Webhook received");

  const { payload, authData } = context;
  const { order } = payload;

  if (!order) {
    logger.error("No order data payload");
    return res.status(200).end();
  }

  const recipientEmail = order.userEmail || order.user?.email;

  if (!recipientEmail?.length) {
    logger.error(`The order ${order.number} had no email recipient set. Aborting.`);
    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
  }

  const channel = order.channel.slug;
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const useCase = new SendEventMessagesUseCase({
    emailSender: new SmtpEmailSender(),
    emailCompiler: new EmailCompiler(
      new HandlebarsTemplateCompiler(),
      new HtmlToTextCompiler(),
      new MjmlCompiler(),
    ),
    smtpConfigurationService: new SmtpConfigurationService({
      featureFlagService: new FeatureFlagService({ client }),
      metadataManager: new SmtpMetadataManager(
        createSettingsManager(client, authData.appId),
        authData.saleorApiUrl,
      ),
    }),
  });

  await useCase.sendEventMessages({
    channelSlug: channel,
    event: "ORDER_CANCELLED",
    payload: { order: payload.order },
    recipientEmail,
  });

  return res.status(200).json({ message: "The event has been handled" });
};

export default withOtel(
  orderCancelledWebhook.createHandler(handler),
  "api/webhooks/order-cancelled",
);

export const config = {
  api: {
    bodyParser: false,
  },
};
