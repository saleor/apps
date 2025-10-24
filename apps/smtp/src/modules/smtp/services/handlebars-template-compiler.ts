import Handlebars from "handlebars";
import handlebars_helpers from "handlebars-helpers";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "../../../errors";
import { createLogger } from "../../../logger";
import { TemplateErrorCode, templateErrorCodes } from "./template-error-codes";

const logger = createLogger("compileHandlebarsTemplate");

export interface ITemplateCompiler {
  compile(
    template: string,
    variables: unknown,
  ): Result<
    { template: string },
    InstanceType<typeof HandlebarsTemplateCompiler.HandlebarsTemplateCompilerError>
  >;
}

handlebars_helpers({ handlebars: Handlebars });

const resolveHandlebarsErrorCode = (message: string): TemplateErrorCode => {
  if (message.includes("Missing helper")) {
    return templateErrorCodes.HANDLEBARS_MISSING_HELPER;
  }

  if (message.includes("Parse error")) {
    return templateErrorCodes.HANDLEBARS_PARSE_ERROR;
  }

  return templateErrorCodes.HANDLEBARS_COMPILE_ERROR;
};

export class HandlebarsTemplateCompiler implements ITemplateCompiler {
  static HandlebarsTemplateCompilerError = BaseError.subclass("HandlebarsTemplateCompilerError", {
    props: {} as { publicMessage: string; errorCode: TemplateErrorCode },
  });
  static FailedCompileError = this.HandlebarsTemplateCompilerError.subclass("FailedCompileError", {
    props: {} as { publicMessage: string; errorCode: TemplateErrorCode },
  });

  compile(
    template: string,
    variables: any,
  ): Result<
    { template: string },
    InstanceType<typeof HandlebarsTemplateCompiler.FailedCompileError>
  > {
    logger.debug("Compiling handlebars template");
    try {
      const templateDelegate = Handlebars.compile(template);
      const htmlTemplate = templateDelegate(variables);

      logger.debug("Template successfully compiled");

      return ok({
        template: htmlTemplate,
      });
    } catch (error) {
      logger.warn("Failed to compile template - user configuration is invalid", { error: error });

      const errorMessage = error instanceof Error ? error.message : "Failed to compile template";
      const errorCode = resolveHandlebarsErrorCode(errorMessage);

      return err(
        new HandlebarsTemplateCompiler.FailedCompileError(errorMessage, {
          errors: [error],
          props: {
            publicMessage: errorMessage,
            errorCode,
          },
        }),
      );
    }
  }
}
