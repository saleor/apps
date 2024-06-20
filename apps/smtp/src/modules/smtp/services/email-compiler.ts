import { IMjmlCompiler } from "./mjml-compiler";
import { ITemplateCompiler } from "./handlebars-template-compiler";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { IHtmlToTextCompiler } from "./html-to-text-compiler";
import { createLogger } from "../../../logger";
import { BaseError } from "../../../errors";
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

  private resolveEmailSubject = (subjectTemplate: string, payload: unknown) =>
    this.templateCompiler
      .compile(subjectTemplate, payload)
      .orElse((error) =>
        err(
          new EmailCompiler.CompilationFailedError("Failed to compile email subject template", {
            errors: [error],
          }),
        ),
      )
      .andThen((value) => {
        if (!value.template || !value.template?.length) {
          return err(
            new EmailCompiler.EmptyEmailSubjectError("Mjml subject message is empty, skipping", {
              props: {
                subject: value.template,
              },
            }),
          );
        }

        return ok(value);
      });

  private resolveBodyTemplate(
    bodyTemplate: string,
    payload: unknown,
  ): Result<{ template: string }, InstanceType<typeof EmailCompiler.EmailCompilerError>> {
    return this.templateCompiler
      .compile(bodyTemplate, payload)
      .orElse((error) => {
        return err(
          new EmailCompiler.CompilationFailedError("Failed to compile email body template", {
            errors: [error],
          }),
        );
      })
      .andThen((value) => {
        if (!value.template || !value.template?.length) {
          return err(new EmailCompiler.EmptyEmailBodyError("MJML template body is empty"));
        }

        return ok(value);
      });
  }

  private resolveBodyMjml = (emailTemplate: string) =>
    this.mjmlCompiler.compile(emailTemplate).orElse((error) => {
      return err(
        new EmailCompiler.CompilationFailedError("Failed to compile MJML", {
          errors: [error],
        }),
      );
    });

  private resolveBodyPlainText = (
    html: string,
  ): Result<string, InstanceType<typeof EmailCompiler.CompilationFailedError>> =>
    this.htmlToTextCompiler.compile(html).orElse((error) =>
      err(
        new EmailCompiler.CompilationFailedError("Failed to compile body to plain text", {
          errors: [error],
        }),
      ),
    );

  compile({
    payload,
    recipientEmail,
    event,
    subjectTemplate,
    bodyTemplate,
    senderEmail,
    senderName,
  }: CompileArgs): Result<CompiledEmail, InstanceType<typeof EmailCompiler.EmailCompilerError>> {
    const logger = createLogger("EmailCompiler", {
      event,
    });

    const subjectCompilationResult = this.resolveEmailSubject(subjectTemplate, payload);
    const bodyCompilationInHtmlResult = this.resolveBodyTemplate(bodyTemplate, payload).andThen(
      (value) => {
        return this.resolveBodyMjml(value.template);
      },
    );

    return Result.combine([subjectCompilationResult, bodyCompilationInHtmlResult]).andThen(
      ([subjectCompiled, bodyCompiledHtml]) => {
        return this.resolveBodyPlainText(bodyCompiledHtml).andThen((bodyPlainText) => {
          logger.debug("Resolved compiled email template");

          return ok({
            text: bodyPlainText,
            html: bodyCompiledHtml,
            from: `${senderName} <${senderEmail}>`,
            to: recipientEmail,
            subject: subjectCompiled.template,
          });
        });
      },
    );
  }
}
