import nodemailer from "nodemailer";
import { logger as pinoLogger } from "../../lib/logger";

const logger = pinoLogger.child({
  fn: "sendEmailWithSmtp",
});

interface SendMailArgs {
  smtpSettings: {
    host: string;
    port: number;
  };
  mailData: {
    from: string;
    to: string;
    text: string;
    html: string;
    subject: string;
  };
}

export const sendEmailWithSmtp = async ({ smtpSettings, mailData }: SendMailArgs) => {
  logger.debug("Sending an email with SMTP");
  try {
    const transporter = nodemailer.createTransport({
      ...smtpSettings,
    });

    const response = await transporter.sendMail({
      ...mailData,
    });
    logger.debug("An email has been sent");
    return { response };
  } catch (error) {
    logger.error("Error during sending the email");
    if (error instanceof Error) {
      logger.error(error.message);
      return { errors: [{ message: error.message }] };
    }
    return { errors: [{ message: "SMTP error" }] };
  }
};
