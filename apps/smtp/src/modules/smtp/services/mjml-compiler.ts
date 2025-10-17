import compile from "mjml";
import { err, fromThrowable, ok, Result } from "neverthrow";

import { BaseError } from "../../../errors";
import { createLogger } from "../../../logger";
import { TemplateErrorCode, templateErrorCodes } from "./template-error-codes";

export interface IMjmlCompiler {
  compile(mjml: string): Result<string, InstanceType<typeof MjmlCompiler.MjmlCompilerError>>;
}

export class MjmlCompiler implements IMjmlCompiler {
  static MjmlCompilerError = BaseError.subclass("MjmlCompilerError", {
    props: {} as { publicMessage: string; errorCode: TemplateErrorCode },
  });
  static FailedToCompileError = this.MjmlCompilerError.subclass("FailedToCompileError", {
    props: {
      publicMessage: "MJML syntax compilation error",
      errorCode: templateErrorCodes.MJML_COMPILE_ERROR,
    },
  });

  private logger = createLogger("MjmlCompiler");

  compile(mjml: string): Result<string, InstanceType<typeof MjmlCompiler.FailedToCompileError>> {
    this.logger.debug("Trying to compile MJML template");

    const safeCompile = fromThrowable(compile, (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to compile MJML";

      return new MjmlCompiler.FailedToCompileError(errorMessage, {
        errors: [error],
        props: {
          publicMessage: errorMessage,
          errorCode: templateErrorCodes.MJML_COMPILE_ERROR,
        },
      });
    });

    return safeCompile(mjml).andThen((value) => {
      if (value.errors && value.errors.length > 0) {
        const errorMessage =
          value.errors[0]?.message || `MJML validation failed with ${value.errors.length} error(s)`;

        const errorCode = templateErrorCodes.MJML_VALIDATION_ERROR;

        return err(
          new MjmlCompiler.FailedToCompileError(errorMessage, {
            errors: value.errors,
            props: {
              publicMessage: errorMessage,
              errorCode,
            },
          }),
        );
      } else {
        return ok(value.html);
      }
    });
  }
}
