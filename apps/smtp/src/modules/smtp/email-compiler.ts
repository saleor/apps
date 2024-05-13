import { compileMjml } from "./compile-mjml";
import { ITemplateCompiler } from "./template-compiler";
import { MessageEventTypes } from "../event-handlers/message-event-types";
import { htmlToPlaintext } from "./html-to-plaintext";
import { SmtpConfiguration } from "./configuration/smtp-config-schema";
import { createLogger } from "../../logger";
import { BaseError } from "../../errors";
import { err, ok, Result } from "neverthrow";

interface CompileArgs {
  smtpConfiguration: SmtpConfiguration;
  recipientEmail: string;
  event: MessageEventTypes;
  payload: any;
}

export interface CompiledEmail {
  from: string;
  to: string;
  text: string;
  html: string;
  subject: string;
}

export interface IEmailCompiler {
  compile(args: CompileArgs): Result<CompiledEmail, InstanceType<typeof BaseError>>;
}

/*
 * todo introduce modern-errors
 */
export class EmailCompiler implements IEmailCompiler {
  static EmailCompilerError = BaseError.subclass("EmailCompilerError");
  static MissingEventSettingsError = this.EmailCompilerError.subclass("MissingEventSettingsError");
  static EventNotEnabledInSettingsError = this.EmailCompilerError.subclass(
    "EventNotEnabledInSettingsError",
  );
  static CompilationFailedError = this.EmailCompilerError.subclass("CompilationFailedError");
  static EmptyEmailSubjectError = this.EmailCompilerError.subclass("EmptyEmailSubjectError");
  static EmptyEmailBodyError = this.EmailCompilerError.subclass("EmptyEmailBodyError");

  constructor(private templateCompiler: ITemplateCompiler) {}

  compile({
    payload,
    recipientEmail,
    event,
    smtpConfiguration,
  }: CompileArgs): Result<CompiledEmail, InstanceType<typeof EmailCompiler.EmailCompilerError>> {
    const logger = createLogger("sendSmtp", {
      name: "sendSmtp",
      event,
    });

    const eventSettings = smtpConfiguration.events.find((e) => e.eventType === event);

    if (!eventSettings) {
      logger.debug("No active settings for this event, skipping");

      return err(new EmailCompiler.MissingEventSettingsError("No active settings for this event"));
    }

    if (!eventSettings.active) {
      logger.debug("Event settings are not active, skipping");

      return err(new EmailCompiler.EventNotEnabledInSettingsError("Event settings are not active"));
    }

    logger.debug("Compiling an email using MJML");

    const { template: rawTemplate, subject } = eventSettings;

    const subjectCompilationResult = this.templateCompiler.compile(subject, payload);

    if (subjectCompilationResult.isErr()) {
      return err(
        new EmailCompiler.CompilationFailedError("Failed to compile email subject template", {
          errors: [subjectCompilationResult.error],
        }),
      );
    }

    const { template: emailSubject } = subjectCompilationResult.value;

    if (!emailSubject || !emailSubject?.length) {
      logger.error("Mjml subject message is empty, skipping");

      return err(
        new EmailCompiler.EmptyEmailSubjectError("Mjml subject message is empty, skipping", {
          props: {
            subject: emailSubject,
          },
        }),
      );
    }

    logger.debug({ emailSubject }, "Subject compiled");

    const bodyCompilationResult = this.templateCompiler.compile(rawTemplate, payload);

    if (bodyCompilationResult.isErr()) {
      return err(
        new EmailCompiler.CompilationFailedError("Failed to compile email body template", {
          errors: [bodyCompilationResult.error],
        }),
      );
    }

    const { template: emailTemplate } = bodyCompilationResult.value;

    if (!emailTemplate || !emailTemplate?.length) {
      return err(new EmailCompiler.EmptyEmailBodyError("MJML template body is empty"));
    }

    logger.debug("Handlebars template compiled");

    const { html: emailBodyHtml, errors: mjmlCompilationErrors } = compileMjml(emailTemplate);

    if (mjmlCompilationErrors.length) {
      logger.error("Error during the MJML compilation");
      logger.error(mjmlCompilationErrors);

      throw new Error("Error during the MJML compilation. Please Validate your MJML template");
    }

    if (!emailBodyHtml || !emailBodyHtml?.length) {
      logger.error("No MJML template returned after the compilation");

      throw new Error("No MJML template returned after the compilation");
    }

    logger.debug("MJML template compiled");

    const { plaintext: emailBodyPlaintext } = htmlToPlaintext(emailBodyHtml);

    if (!emailBodyPlaintext || !emailBodyPlaintext?.length) {
      logger.error("Email body could not be converted to plaintext");

      throw new Error("Email body could not be converted to plaintext");
    }

    logger.debug("Email body converted to plaintext");

    return ok({
      text: emailBodyPlaintext,
      html: emailBodyHtml,
      from: `${smtpConfiguration.senderName} <${smtpConfiguration.senderEmail}>`,
      to: recipientEmail,
      subject: emailSubject,
    });
  }
}
