import { compileMjml } from "./compile-mjml";
import { compileHandlebarsTemplate } from "./compile-handlebars-template";
import { sendEmailWithSmtp, SendMailArgs } from "./send-email-with-smtp";
import { MessageEventTypes } from "../event-handlers/message-event-types";
import { htmlToPlaintext } from "./html-to-plaintext";
import { SmtpConfiguration } from "./configuration/smtp-config-schema";
import { createLogger } from "../../logger";

interface SendSmtpArgs {
  smtpConfiguration: SmtpConfiguration;
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

export const sendSmtp = async ({
  payload,
  recipientEmail,
  event,
  smtpConfiguration,
}: SendSmtpArgs) => {
  const logger = createLogger("sendSmtp", {
    name: "sendSmtp",
    event,
  });

  const eventSettings = smtpConfiguration.events.find((e) => e.eventType === event);

  if (!eventSettings) {
    logger.debug("No active settings for this event, skipping");
    return;
  }

  if (!eventSettings.active) {
    logger.debug("Event settings are not active, skipping");
    return;
  }

  logger.debug("Sending an email using MJML");

  const { template: rawTemplate, subject } = eventSettings;

  const { template: emailSubject, errors: handlebarsSubjectErrors } = compileHandlebarsTemplate(
    subject,
    payload,
  );

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

  logger.debug({ emailSubject }, "Subject compiled");

  const { template: mjmlTemplate, errors: handlebarsErrors } = compileHandlebarsTemplate(
    rawTemplate,
    payload,
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

  logger.debug("Handlebars template compiled");

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

  logger.debug("MJML template compiled");

  const { plaintext: emailBodyPlaintext } = htmlToPlaintext(emailBodyHtml);

  if (!emailBodyPlaintext || !emailBodyPlaintext?.length) {
    logger.error("Email body could not be converted to plaintext");
    return {
      errors: [{ message: "Email body could not be converted to plaintext" }],
    };
  }

  logger.debug("Email body converted to plaintext");

  const sendEmailSettings: SendMailArgs = {
    mailData: {
      text: emailBodyPlaintext,
      html: emailBodyHtml,
      from: `${smtpConfiguration.senderName} <${smtpConfiguration.senderEmail}>`,
      to: recipientEmail,
      subject: emailSubject,
    },
    smtpSettings: {
      host: smtpConfiguration.smtpHost,
      port: parseInt(smtpConfiguration.smtpPort, 10),
      encryption: smtpConfiguration.encryption,
    },
  };

  if (smtpConfiguration.smtpUser) {
    sendEmailSettings.smtpSettings.auth = {
      user: smtpConfiguration.smtpUser,
      pass: smtpConfiguration.smtpPassword,
    };
  }

  const { response, errors: smtpErrors } = await sendEmailWithSmtp(sendEmailSettings);

  if (smtpErrors?.length) {
    return { errors: smtpErrors };
  }
  logger.debug(response?.response, "Email sent");
};
