import nodemailer from "nodemailer";
import { createLogger } from "../../logger";
import { SmtpEncryptionType } from "./configuration/smtp-config-schema";

export interface SendMailArgs {
  smtpSettings: {
    host: string;
    port: number;
    auth?: {
      user: string;
      pass: string | undefined;
    };
    encryption: SmtpEncryptionType;
  };
  mailData: {
    from: string;
    to: string;
    text: string;
    html: string;
    subject: string;
  };
}

export interface ISMTPEmailSender {
  sendEmailWithSmtp({ smtpSettings, mailData }: SendMailArgs): Promise<{ response: any }>;
}

export class SmtpEmailSender implements ISMTPEmailSender {
  private logger = createLogger("SmtpEmailSender");

  async sendEmailWithSmtp({ smtpSettings, mailData }: SendMailArgs) {
    this.logger.debug("Sending an email with SMTP");

    let transporter: nodemailer.Transporter;

    /*
     * https://github.com/nodemailer/nodemailer/issues/1461#issuecomment-1263131029
     * [secure argument] it’s not about security but if the server starts tcp connections over TLS mode or not.
     * If it starts connections in cleartext mode, the client can not use TLS until STARTTLS can be established later.
     */

    switch (smtpSettings.encryption) {
      case "TLS":
        transporter = nodemailer.createTransport({
          tls: {
            minVersion: "TLSv1.1",
          },
          secure: false,
          host: smtpSettings.host,
          port: smtpSettings.port,
          auth: {
            user: smtpSettings.auth?.user,
            pass: smtpSettings.auth?.pass,
          },
        });
        break;
      case "SSL":
        transporter = nodemailer.createTransport({
          secure: true,
          host: smtpSettings.host,
          port: smtpSettings.port,
          auth: {
            user: smtpSettings.auth?.user,
            pass: smtpSettings.auth?.pass,
          },
        });
        break;
      case "NONE":
        transporter = nodemailer.createTransport({
          host: smtpSettings.host,
          port: smtpSettings.port,
          secure: false,
          auth: {
            user: smtpSettings.auth?.user,
            pass: smtpSettings.auth?.pass,
          },
        });
        break;
      default:
        throw new Error("Unknown encryption type");
    }

    try {
      const response = await transporter.sendMail({
        ...mailData,
      });

      this.logger.debug("An email has been sent");

      return { response };
    } catch (error) {
      this.logger.error("Error during sending the email");

      if (error instanceof Error) {
        this.logger.error(error.message);

        throw error;
      }

      throw new Error("SMTP error");
    }
  }
}
