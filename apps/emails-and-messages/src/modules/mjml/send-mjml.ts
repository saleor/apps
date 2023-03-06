import { logger as pinoLogger } from "../../lib/logger";
import { AuthData } from "@saleor/app-sdk/APL";
import { getActiveMjmlSettings } from "./get-active-mjml-settings";
import { compileMjml } from "./compile-mjml";
import { compileHandlebarsTemplate } from "./compile-handlebars-template";
import { sendEmailWithSmtp } from "./send-email-with-smtp";
import { MessageEventTypes } from "../event-handlers/message-event-types";
import { htmlToPlaintext } from "./html-to-plaintext";

interface SendMjmlArgs {
  authData: AuthData;
  mjmlConfigurationId: string;
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

export const sendMjml = async ({
  authData,
  channel,
  payload,
  recipientEmail,
  event,
  mjmlConfigurationId,
}: SendMjmlArgs) => {
  const logger = pinoLogger.child({
    fn: "sendMjml",
    event,
  });

  const settings = await getActiveMjmlSettings({
    authData,
    channel,
    configurationId: mjmlConfigurationId,
  });

  if (!settings) {
    logger.debug("No active settings, skipping");
    return {
      errors: [
        {
          message: "No active settings",
        },
      ],
    };
  }

  const eventSettings = settings.events.find((e) => e.eventType === event);
  if (!eventSettings) {
    logger.debug("No active settings for this event, skipping");
    return {
      errors: [
        {
          message: "No active settings for this event",
        },
      ],
    };
  }

  if (!eventSettings.active) {
    logger.debug("Event settings are not active, skipping");
    return {
      errors: [
        {
          message: "Event settings are not active",
        },
      ],
    };
  }

  logger.debug("Sending an email using MJML");

  const { template: rawTemplate, subject } = eventSettings;

  const { template: emailSubject, errors: handlebarsSubjectErrors } = compileHandlebarsTemplate(
    subject,
    payload
  );

  logger.warn(`email subject ${emailSubject} ${subject}`);

  if (handlebarsSubjectErrors?.length) {
    logger.error("Error during the handlebars subject template compilation");
    return {
      errors: [{ message: "Error during the handlebars subject template compilation" }],
    };
  }

  if (!emailSubject || !emailSubject?.length) {
    logger.error("Mjml subject message is empty, skipping");
    return {
      errors: [{ message: "Mjml subject message is empty, skipping" }],
    };
  }

  const { template: mjmlTemplate, errors: handlebarsErrors } = compileHandlebarsTemplate(
    rawTemplate,
    payload
  );

  if (handlebarsErrors?.length) {
    logger.error("Error during the handlebars template compilation");
    return {
      errors: [{ message: "Error during the handlebars template compilation" }],
    };
  }

  if (!mjmlTemplate || !mjmlTemplate?.length) {
    logger.error("Mjml template message is empty, skipping");
    return {
      errors: [{ message: "Mjml template message is empty, skipping" }],
    };
  }

  const { html: emailBodyHtml, errors: mjmlCompilationErrors } = compileMjml(mjmlTemplate);

  if (mjmlCompilationErrors.length) {
    logger.error("Error during the MJML compilation");
    logger.error(mjmlCompilationErrors);
    return {
      errors: [
        {
          message: "Error during the MJML compilation. Please Validate your MJML template",
        },
      ],
    };
  }

  if (!emailBodyHtml || !emailBodyHtml?.length) {
    logger.error("No MJML template returned after the compilation");
    return {
      errors: [{ message: "No MJML template returned after the compilation" }],
    };
  }

  const { plaintext: emailBodyPlaintext } = htmlToPlaintext(emailBodyHtml);

  if (!emailBodyPlaintext || !emailBodyPlaintext?.length) {
    logger.error("Email body could not be converted to plaintext");
    return {
      errors: [{ message: "Email body could not be converted to plaintext" }],
    };
  }

  const { response, errors: smtpErrors } = await sendEmailWithSmtp({
    mailData: {
      text: emailBodyPlaintext,
      html: emailBodyHtml,
      from: `${settings.senderName} <${settings.senderEmail}>`,
      to: recipientEmail,
      subject: emailSubject,
    },
    smtpSettings: {
      host: settings.smtpHost,
      port: parseInt(settings.smtpPort, 10),
    },
  });

  if (smtpErrors?.length) {
    return { errors: smtpErrors };
  }
  logger.debug(response?.response);
};
