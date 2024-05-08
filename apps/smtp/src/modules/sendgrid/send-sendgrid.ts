import { SendgridConfiguration } from "./configuration/sendgrid-config-schema";
import { MailService } from "@sendgrid/mail";
import { MessageEventTypes } from "../event-handlers/message-event-types";
import { createLogger } from "../../logger";

interface SendSendgridArgs {
  recipientEmail: string;
  event: MessageEventTypes;
  payload: any;
  sendgridConfiguration: SendgridConfiguration;
}

export interface EmailServiceResponse {
  errors?: {
    code: number;
    message: string;
  }[];
}

export const sendSendgrid = async ({
  payload,
  recipientEmail,
  event,
  sendgridConfiguration,
}: SendSendgridArgs) => {
  const logger = createLogger("sendSendgrid", {
    name: "sendSendgrid",
    event,
  });

  if (!sendgridConfiguration.senderEmail) {
    logger.debug("Sender email has not been specified, skipping");
    return;
  }

  const eventSettings = sendgridConfiguration.events.find((e) => e.eventType === event);

  if (!eventSettings) {
    logger.debug("No active settings for this event, skipping");
    return;
  }

  if (!eventSettings.active) {
    logger.debug("Event settings are not active, skipping");
    return;
  }

  logger.debug("Sending an email using SendGrid");

  const { template } = eventSettings;

  if (!template) {
    logger.error("No template defined in the settings");
    return {
      errors: [{ message: `No template specified for the event ${event}` }],
    };
  }

  try {
    const mailService = new MailService();

    mailService.setApiKey(sendgridConfiguration.apiKey);

    await mailService.send({
      mailSettings: {
        sandboxMode: {
          enable: sendgridConfiguration.sandboxMode,
        },
      },
      from: {
        name: sendgridConfiguration.senderName,
        email: sendgridConfiguration.senderEmail,
      },
      to: recipientEmail,
      dynamicTemplateData: payload,
      templateId: template,
    });
    logger.debug("Email has been send");
  } catch (error) {
    logger.error("The SendGrid API returned an error");
    logger.error(error);
    if (error instanceof Error) {
      return { errors: [{ message: error.message }] };
    }
  }
};
