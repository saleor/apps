import { logger as pinoLogger } from "../../lib/logger";
import { AuthData } from "@saleor/app-sdk/APL";
import { SendgridConfiguration } from "./configuration/sendgrid-config";
import { getSendgridSettings } from "./get-sendgrid-settings";
import { MailService } from "@sendgrid/mail";
import { MessageEventTypes } from "../event-handlers/message-event-types";

interface SendSendgridArgs {
  authData: AuthData;
  channel: string;
  recipientEmail: string;
  event: MessageEventTypes;
  payload: any;
}

export interface EmailServiceResponse {
  errors?: {
    code: number;
    message: string;
  }[];
}

const eventMapping = (event: SendSendgridArgs["event"], settings: SendgridConfiguration) => {
  switch (event) {
    case "ORDER_CREATED":
      return {
        templateId: settings.templateOrderCreatedTemplate,
        subject: settings.templateOrderCreatedSubject || "Order created",
      };
    case "ORDER_FULFILLED":
      return {
        templateId: settings.templateOrderFulfilledTemplate,
        subject: settings.templateOrderFulfilledSubject || "Order fulfilled",
      };
    case "ORDER_CONFIRMED":
      return {
        template: settings.templateOrderConfirmedTemplate,
        subject: settings.templateOrderConfirmedSubject || "Order confirmed",
      };
    case "ORDER_CANCELLED":
      return {
        template: settings.templateOrderCancelledTemplate,
        subject: settings.templateOrderCancelledSubject || "Order cancelled",
      };
    case "ORDER_FULLY_PAID":
      return {
        template: settings.templateOrderFullyPaidTemplate,
        subject: settings.templateOrderFullyPaidSubject || "Order fully paid",
      };
    case "INVOICE_SENT":
      return {
        template: settings.templateInvoiceSentTemplate,
        subject: settings.templateInvoiceSentSubject || "Invoice sent",
      };
  }
};

export const sendSendgrid = async ({
  authData,
  channel,
  payload,
  recipientEmail,
  event,
}: SendSendgridArgs) => {
  const logger = pinoLogger.child({
    fn: "sendSendgrid",
    event,
  });

  const settings = await getSendgridSettings({ authData, channel });

  if (!settings?.active) {
    logger.debug("Sendgrid is not active, skipping");
    return;
  }

  logger.debug("Sending an email using Sendgrid");

  const { templateId, subject } = eventMapping(event, settings);

  if (!templateId) {
    logger.error("No template defined in the settings");
    return {
      errors: [{ message: `No template specified for the event ${event}` }],
    };
  }

  try {
    const mailService = new MailService();
    mailService.setApiKey(settings.apiKey);

    await mailService.send({
      mailSettings: {
        sandboxMode: {
          enable: settings.sandboxMode,
        },
      },
      from: {
        email: settings.senderEmail,
      },
      to: {
        email: recipientEmail,
      },
      personalizations: [
        {
          from: {
            email: settings.senderEmail,
          },
          to: [
            {
              email: recipientEmail,
            },
          ],
          subject,
          dynamicTemplateData: payload,
        },
      ],
      templateId,
    });
    logger.debug("Email has been send");
  } catch (error) {
    logger.error("The Sendgrid API returned an error");
    logger.error(error);
    if (error instanceof Error) {
      return { errors: [{ message: error.message }] };
    }
  }
};
