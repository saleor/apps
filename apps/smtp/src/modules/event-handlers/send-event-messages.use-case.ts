import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { IEmailCompiler } from "../smtp/email-compiler";
import { MessageEventTypes } from "./message-event-types";
import { createLogger } from "../../logger";
import { ISMTPEmailSender, SendMailArgs } from "../smtp/smtp-email-sender";

export class SendEventMessagesUseCase {
  private logger = createLogger("SendEventMessagesUseCase");

  constructor(
    private deps: {
      smtpConfigurationService: SmtpConfigurationService;
      emailCompiler: IEmailCompiler;
      emailSender: ISMTPEmailSender;
    },
  ) {}

  async sendEventMessages({
    event,
    payload,
    recipientEmail,
    channelSlug,
  }: {
    channelSlug: string; // todo: id or slug
    payload: any; // todo can be narrowed?
    recipientEmail: string;
    event: MessageEventTypes;
  }) {
    this.logger.info("Calling sendEventMessages", { channelSlug, event });

    const availableSmtpConfigurations = await this.deps.smtpConfigurationService.getConfigurations({
      active: true,
      availableInChannel: channelSlug,
    });

    /**
     * TODO: Why this is not in parallel?
     */
    for (const smtpConfiguration of availableSmtpConfigurations) {
      try {
        const preparedEmail = this.deps.emailCompiler.compile({
          event: event,
          payload: payload,
          recipientEmail: recipientEmail,
          smtpConfiguration,
        });

        if (!preparedEmail) {
          return; // todo log
        }

        const smtpSettings: SendMailArgs["smtpSettings"] = {
          host: smtpConfiguration.smtpHost,
          port: parseInt(smtpConfiguration.smtpPort, 10),
          encryption: smtpConfiguration.encryption,
        };

        if (smtpConfiguration.smtpUser) {
          smtpSettings.auth = {
            user: smtpConfiguration.smtpUser,
            pass: smtpConfiguration.smtpPassword,
          };
        }

        try {
          await this.deps.emailSender.sendEmailWithSmtp({
            mailData: preparedEmail,
            smtpSettings,
          });
        } catch (e) {
          this.logger.error("SMTP returned errors", { error: e });
        }
      } catch (e) {
        this.logger.error("Error compiling");
      }
    }
  }
}
