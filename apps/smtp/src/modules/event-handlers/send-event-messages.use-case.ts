import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { EmailCompiler } from "../smtp/send-smtp";
import { MessageEventTypes } from "./message-event-types";
import { createLogger } from "../../logger";
import { SmtpEmailSender } from "../smtp/send-email-with-smtp";

export class SendEventMessagesUseCase {
  private logger = createLogger("SendEventMessagesUseCase");

  constructor(
    private deps: {
      smtpConfigurationService: SmtpConfigurationService;
      emailCompiler: EmailCompiler;
      emailSender: SmtpEmailSender;
    },
  ) {}

  async sendEventMessages({
    event,
    payload,
    recipientEmail,
    channel,
  }: {
    channel: string; // todo: id or slug
    payload: any; // todo can be narrowed?
    recipientEmail: string;
    event: MessageEventTypes;
  }) {
    this.logger.info("Calling sendEventMessages", { channel, event });

    const availableSmtpConfigurations = await this.deps.smtpConfigurationService.getConfigurations({
      active: true,
      availableInChannel: channel,
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

        const result = await this.deps.emailSender.sendEmailWithSmtp(preparedEmail);

        /**
         * TODO: Implement modern-errors
         */
        if (result?.errors?.length) {
          this.logger.error("SMTP returned errors", { error: result?.errors });
        }
      } catch (e) {
        this.logger.error("Error compiling");
      }
    }
  }
}
