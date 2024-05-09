import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { sendSmtp } from "../smtp/send-smtp";
import { MessageEventTypes } from "./message-event-types";
import { createLogger } from "../../logger";

export class SendEventMessagesUseCase {
  private logger = createLogger("SendEventMessagesUseCase");

  constructor(
    private deps: {
      smtpConfigurationService: SmtpConfigurationService;
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
      const smtpStatus = await sendSmtp({
        event: event,
        payload: payload,
        recipientEmail: recipientEmail,
        smtpConfiguration,
      });

      /**
       * TODO: Implement modern-errors
       */
      if (smtpStatus?.errors.length) {
        this.logger.error("SMTP returned errors", { error: smtpStatus?.errors });
      }
    }
  }
}
