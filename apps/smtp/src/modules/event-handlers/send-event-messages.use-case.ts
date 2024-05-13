import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { IEmailCompiler } from "../smtp/email-compiler";
import { MessageEventTypes } from "./message-event-types";
import { createLogger } from "../../logger";
import { ISMTPEmailSender, SendMailArgs } from "../smtp/smtp-email-sender";

// todo test
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

    if (availableSmtpConfigurations.isErr()) {
      throw new Error(availableSmtpConfigurations.error.message); //todo add neverthrow
    }

    /**
     * TODO: Why this is not in parallel?
     */
    for (const smtpConfiguration of availableSmtpConfigurations.value) {
      try {
        const eventSettings = smtpConfiguration.events.find((e) => e.eventType === event);

        if (!eventSettings) {
          /*
           * Config missing, ignore
           * todo log
           */
          return;
        }

        if (!eventSettings.active) {
          /**
           * Config found, but set as disabled, ignore.
           * todo: log
           */
          return;
        }

        if (!smtpConfiguration.senderName || !smtpConfiguration.senderEmail) {
          /**
           * TODO: check if this should be allowed
           */
          return;
        }

        const preparedEmailResult = this.deps.emailCompiler.compile({
          event: event,
          payload: payload,
          recipientEmail: recipientEmail,
          bodyTemplate: eventSettings.template,
          subjectTemplate: eventSettings.subject,
          senderEmail: smtpConfiguration.senderEmail,
          senderName: smtpConfiguration.senderName,
        });

        if (preparedEmailResult.isErr()) {
          return; // todo log + what should we do?
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
            mailData: preparedEmailResult.value,
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
