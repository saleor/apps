import {
  IGetSmtpConfiguration,
  SmtpConfigurationService,
} from "../smtp/configuration/smtp-configuration.service";
import { IEmailCompiler } from "../smtp/services/email-compiler";
import { MessageEventTypes } from "./message-event-types";
import { createLogger } from "../../logger";
import { ISMTPEmailSender, SendMailArgs } from "../smtp/services/smtp-email-sender";
import { BaseError } from "../../errors";
import { errAsync } from "neverthrow";

/*
 * todo test
 * todo: how this service should handle error for one config and success for another?
 */
export class SendEventMessagesUseCase {
  private logger = createLogger("SendEventMessagesUseCase");

  static SendEventMessagesUseCaseError = BaseError.subclass("SendEventMessagesUseCaseError");
  static FailedToFetchConfigurationError = this.SendEventMessagesUseCaseError.subclass(
    "FailedToFetchConfigurationError",
  );
  static MissingAvailableConfigurationError = this.SendEventMessagesUseCaseError.subclass(
    "MissingAvailableConfigurationError",
  );

  constructor(
    private deps: {
      smtpConfigurationService: IGetSmtpConfiguration;
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
    channelSlug: string;
    payload: unknown;
    recipientEmail: string;
    event: MessageEventTypes;
  }) {
    this.logger.info("Calling sendEventMessages", { channelSlug, event });

    const availableSmtpConfigurations = await this.deps.smtpConfigurationService.getConfigurations({
      active: true,
      availableInChannel: channelSlug,
    });

    if (availableSmtpConfigurations.isErr()) {
      return errAsync(
        new SendEventMessagesUseCase.FailedToFetchConfigurationError(
          "Failed to fetch configuration",
          {
            errors: [availableSmtpConfigurations.error],
            props: {
              channelSlug,
              event,
            },
          },
        ),
      );
    }

    if (availableSmtpConfigurations.value.length === 0) {
      return errAsync(
        new SendEventMessagesUseCase.MissingAvailableConfigurationError(
          "Missing configuration for this channel that is active",
          {
            errors: [],
            props: {
              channelSlug,
              event,
            },
          },
        ),
      );
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
