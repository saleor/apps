import { createLogger } from "../../../logger";
import { err, fromThrowable, ok, Result } from "neverthrow";
import { BaseError } from "../../../errors";

export interface IMjmlCompiler {
  compile(mjml: string): Result<string, InstanceType<typeof BaseError>>;
}

export class MjmlCompiler implements IMjmlCompiler {
  static MjmlCompilerError = BaseError.subclass("MjmlCompilerError");
  static FailedToCompileError = this.MjmlCompilerError.subclass("FailedToCompileError");

  private logger = createLogger("MjmlCompiler");

  compile(mjml: string): Result<string, InstanceType<typeof MjmlCompiler.FailedToCompileError>> {
    this.logger.debug("Trying to compile MJML template");

    const safeCompile = fromThrowable(
      // Used require on purpose - when import where used, modules resolution failed
      require("mjml"),
      (error) =>
        new MjmlCompiler.FailedToCompileError("Failed to compile MJML", {
          errors: [error],
        }),
    );

    return safeCompile(mjml).andThen((value) => {
      if (value.errors && value.errors.length > 0) {
        return err(
          new MjmlCompiler.FailedToCompileError("Failed to compile MJML", {
            errors: value.errors,
          }),
        );
      } else {
        return ok(value.html);
      }
    });
  }
}
