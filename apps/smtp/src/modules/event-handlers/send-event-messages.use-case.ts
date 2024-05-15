import {
  IGetSmtpConfiguration,
  SmtpConfigurationService,
} from "../smtp/configuration/smtp-configuration.service";
import { IEmailCompiler } from "../smtp/services/email-compiler";
import { MessageEventTypes } from "./message-event-types";
import { createLogger } from "../../logger";
import { ISMTPEmailSender, SendMailArgs } from "../smtp/services/smtp-email-sender";
import { BaseError } from "../../errors";
import { err, errAsync, okAsync } from "neverthrow";

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
  static EmailCompilationError =
    this.SendEventMessagesUseCaseError.subclass("EmailCompilationError");
  static InvalidSenderConfigError = this.SendEventMessagesUseCaseError.subclass(
    "InvalidSenderConfigError",
  );
  static EventConfigNotActiveError = this.SendEventMessagesUseCaseError.subclass(
    "EventConfigNotActiveError",
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
      this.logger.warn("Failed to fetch configuration");

      return err(
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
      this.logger.warn("Configuration list is empty, app is not configured");

      return err(
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
      this.logger.info("Detected configuration, will attempt to send email");

      try {
        const eventSettings = smtpConfiguration.events.find((e) => e.eventType === event);

        if (!eventSettings) {
          this.logger.info("Configuration found but settings for this event are missing");
          /*
           * Config missing, ignore
           * todo log
           *  todo this probalby should be for / continue instead, or Promise.all
           */
          return;
        }

        if (!eventSettings.active) {
          this.logger.info("Configuration found, but setting for this event are not active");

          return errAsync(
            new SendEventMessagesUseCase.EventConfigNotActiveError("Event config is disabled", {
              props: {
                event: eventSettings.eventType,
              },
            }),
          );
        }

        if (!smtpConfiguration.senderName || !smtpConfiguration.senderEmail) {
          this.logger.warn("Configuration is invalid: missing sender data", {
            senderName: smtpConfiguration.senderName,
            senderEmail: smtpConfiguration.senderEmail,
          });

          return errAsync(
            new SendEventMessagesUseCase.InvalidSenderConfigError("Missing sender name or email", {
              props: {
                senderName: smtpConfiguration.senderName,
                senderEmail: smtpConfiguration.senderEmail,
              },
            }),
          );
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
          this.logger.warn("Failed to compile email template");

          return errAsync(
            new SendEventMessagesUseCase.EmailCompilationError("Failed to compile error", {
              errors: [preparedEmailResult.error],
              props: {
                channelSlug,
                event,
              },
            }),
          );
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
          // todo get errors from smtp and map to proper response
          await this.deps.emailSender.sendEmailWithSmtp({
            mailData: preparedEmailResult.value,
            smtpSettings,
          });

          return okAsync(null); // todo result
        } catch (e) {
          this.logger.error("SMTP returned errors", { error: e });
        }
      } catch (e) {
        this.logger.error("Error compiling");
      }
    }
  }
}
