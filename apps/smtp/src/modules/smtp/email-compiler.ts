import { IMjmlCompiler } from "./compile-mjml";
import { ITemplateCompiler } from "./template-compiler";
import { MessageEventTypes } from "../event-handlers/message-event-types";
import { IHtmlToTextCompiler } from "./html-to-plaintext";
import { createLogger } from "../../logger";
import { BaseError } from "../../errors";
import { err, ok, Result } from "neverthrow";

interface CompileArgs {
  recipientEmail: string;
  event: MessageEventTypes;
  payload: unknown;
  bodyTemplate: string;
  subjectTemplate: string;
  senderName: string;
  senderEmail: string;
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

export class EmailCompiler implements IEmailCompiler {
  static EmailCompilerError = BaseError.subclass("EmailCompilerError");
  static CompilationFailedError = this.EmailCompilerError.subclass("CompilationFailedError");
  static EmptyEmailSubjectError = this.EmailCompilerError.subclass("EmptyEmailSubjectError");
  static EmptyEmailBodyError = this.EmailCompilerError.subclass("EmptyEmailBodyError");

  constructor(
    private templateCompiler: ITemplateCompiler,
    private htmlToTextCompiler: IHtmlToTextCompiler,
    private mjmlCompiler: IMjmlCompiler,
  ) {}

  compile({
    payload,
    recipientEmail,
    event,
    subjectTemplate,
    bodyTemplate,
    senderEmail,
    senderName,
  }: CompileArgs): Result<CompiledEmail, InstanceType<typeof EmailCompiler.EmailCompilerError>> {
    const logger = createLogger("sendSmtp", {
      name: "sendSmtp",
      event,
    });

    logger.debug("Compiling an email using MJML");

    const subjectCompilationResult = this.templateCompiler.compile(subjectTemplate, payload);

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

    const bodyCompilationResult = this.templateCompiler.compile(bodyTemplate, payload);

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

    const mjmlCompilationResult = this.mjmlCompiler.compile(emailTemplate);

    if (mjmlCompilationResult.isErr()) {
      return err(
        new EmailCompiler.CompilationFailedError("Failed to compile MJML", {
          errors: [mjmlCompilationResult.error],
        }),
      );
    }

    logger.debug("MJML template compiled");

    const plainTextCompilationResult = this.htmlToTextCompiler.compile(mjmlCompilationResult.value);

    if (plainTextCompilationResult.isErr()) {
      return err(
        new EmailCompiler.CompilationFailedError("Failed to compile body to plain text", {
          errors: [plainTextCompilationResult.error],
        }),
      );
    }

    logger.debug("Email body converted to plaintext");

    return ok({
      text: plainTextCompilationResult.value,
      html: mjmlCompilationResult.value,
      from: `${senderName} <${senderEmail}>`,
      to: recipientEmail,
      subject: emailSubject,
    });
  }
}
