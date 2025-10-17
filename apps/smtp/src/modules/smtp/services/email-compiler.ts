import { err, ok, Result } from "neverthrow";

import { BaseError } from "../../../errors";
import { createLogger } from "../../../logger";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { ITemplateCompiler } from "./handlebars-template-compiler";
import { IHtmlToTextCompiler } from "./html-to-text-compiler";
import { IMjmlCompiler } from "./mjml-compiler";
import { hasErrorCode, TemplateErrorCode, templateErrorCodes } from "./template-error-codes";

export interface CompileArgs {
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

export type ErrorContext = "SUBJECT" | "BODY_TEMPLATE" | "BODY_MJML";

interface CompilationFailedProps {
  errorContext?: ErrorContext;
}

interface EmptyEmailSubjectProps {
  subject?: string;
}

export interface IEmailCompiler {
  compile(args: CompileArgs): Result<CompiledEmail, InstanceType<typeof BaseError>>;
}

export class EmailCompiler implements IEmailCompiler {
  static EmailCompilerError = BaseError.subclass("EmailCompilerError");
  static CompilationFailedError = this.EmailCompilerError.subclass("CompilationFailedError", {
    props: {} as CompilationFailedProps & {
      publicMessage: string;
      errorCode: TemplateErrorCode;
    },
  });
  static EmptyEmailSubjectError = this.EmailCompilerError.subclass("EmptyEmailSubjectError", {
    props: {} as EmptyEmailSubjectProps & {
      publicMessage: string;
      errorCode: TemplateErrorCode;
    },
  });
  static EmptyEmailBodyError = this.EmailCompilerError.subclass("EmptyEmailBodyError", {
    props: {} as { publicMessage: string; errorCode: TemplateErrorCode },
  });

  constructor(
    private templateCompiler: ITemplateCompiler,
    private htmlToTextCompiler: IHtmlToTextCompiler,
    private mjmlCompiler: IMjmlCompiler,
  ) {}

  private extractErrorCode = (error: unknown, fallback: TemplateErrorCode): TemplateErrorCode => {
    if (hasErrorCode(error) && error.errorCode) {
      return error.errorCode;
    }

    return fallback;
  };

  private resolveEmailSubject = (subjectTemplate: string, payload: unknown) =>
    this.templateCompiler
      .compile(subjectTemplate, payload)
      .orElse((error) =>
        err(
          new EmailCompiler.CompilationFailedError(error.message, {
            errors: [error],
            props: {
              errorContext: "SUBJECT" as ErrorContext,
              publicMessage: error.publicMessage || error.message,
              errorCode: this.extractErrorCode(error, templateErrorCodes.HANDLEBARS_COMPILE_ERROR),
            },
          }),
        ),
      )
      .andThen((value) => {
        if (!value.template || !value.template?.length) {
          return err(
            new EmailCompiler.EmptyEmailSubjectError("Email subject is empty", {
              props: {
                subject: value.template,
                publicMessage: "Email subject is empty",
                errorCode: templateErrorCodes.EMPTY_EMAIL_SUBJECT,
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
          new EmailCompiler.CompilationFailedError(error.message, {
            errors: [error],
            props: {
              errorContext: "BODY_TEMPLATE" as ErrorContext,
              publicMessage: error.publicMessage || error.message,
              errorCode: this.extractErrorCode(error, templateErrorCodes.HANDLEBARS_COMPILE_ERROR),
            },
          }),
        );
      })
      .andThen((value) => {
        if (!value.template || !value.template?.length) {
          return err(
            new EmailCompiler.EmptyEmailBodyError("Email body template is empty", {
              props: {
                publicMessage: "Email body template is empty",
                errorCode: templateErrorCodes.EMPTY_EMAIL_BODY,
              },
            }),
          );
        }

        return ok(value);
      });
  }

  private resolveBodyMjml = (emailTemplate: string) =>
    this.mjmlCompiler.compile(emailTemplate).orElse((error) => {
      return err(
        new EmailCompiler.CompilationFailedError(error.message, {
          errors: [error],
          props: {
            errorContext: "BODY_MJML" as ErrorContext,
            publicMessage: error.publicMessage || error.message,
            errorCode: this.extractErrorCode(error, templateErrorCodes.MJML_COMPILE_ERROR),
          },
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
          props: {
            publicMessage: "Failed to compile body to plain text",
            errorCode: this.extractErrorCode(
              error,
              templateErrorCodes.PLAINTEXT_COMPILATION_FAILED,
            ),
          },
        }),
      ),
    );

  private resolveBodyTemplateAndMjml(bodyTemplate: string, payload: unknown) {
    return this.resolveBodyTemplate(bodyTemplate, payload).andThen((value) => {
      return this.resolveBodyMjml(value.template);
    });
  }

  /**
   * Validate templates without full compilation (no email recipients needed)
   * Useful for validating user input before saving or previewing
   */
  validate(
    subjectTemplate: string,
    bodyTemplate: string,
    payload: unknown,
  ): Result<
    void,
    | InstanceType<typeof EmailCompiler.EmailCompilerError>
    | InstanceType<typeof EmailCompiler.CompilationFailedError>
  > {
    const logger = createLogger("EmailCompiler");

    logger.debug("Validating email templates");

    const subjectValidationResult = this.resolveEmailSubject(subjectTemplate, payload);
    const bodyValidationResult = this.resolveBodyTemplateAndMjml(bodyTemplate, payload);

    return Result.combine([subjectValidationResult, bodyValidationResult]).andThen(() => {
      logger.debug("Templates validated successfully");

      return ok(undefined);
    });
  }

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
    const bodyCompilationInHtmlResult = this.resolveBodyTemplateAndMjml(bodyTemplate, payload);

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
