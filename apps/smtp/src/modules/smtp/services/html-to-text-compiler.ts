import { convert } from "html-to-text";

import { createLogger } from "../../../logger";
import { fromThrowable, Result } from "neverthrow";
import { BaseError } from "../../../errors";

export interface IHtmlToTextCompiler {
  compile(html: string): Result<string, InstanceType<typeof BaseError>>;
}

export class HtmlToTextCompiler implements IHtmlToTextCompiler {
  static HtmlToTextCompilerError = BaseError.subclass("HtmlToTextCompilerError");
  static FailedToConvertError = this.HtmlToTextCompilerError.subclass("FailedToConvertError");

  private logger = createLogger("HtmlToTextCompiler");

  compile(html: string): Result<string, InstanceType<typeof BaseError>> {
    this.logger.debug("Trying to convert HTML to plaintext");

    return fromThrowable(
      convert,
      (err) =>
        new HtmlToTextCompiler.FailedToConvertError("Failed to compile HTML to plain text", {
          errors: [err],
        }),
    )(html);
  }
}
