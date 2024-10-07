import { minify, prettify } from "htmlfy";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "../../../errors";

export interface ITemplateStringCompressor {
  compress(template: string): Result<string, InstanceType<typeof BaseError>>;

  decompress(template: string): Result<string, InstanceType<typeof BaseError>>;
}

export class TemplateStringCompressor implements ITemplateStringCompressor {
  static TemplateStringFormaterError = BaseError.subclass("TemplateStringFormaterError");

  compress(templateString: string): Result<string, any> {
    try {
      return ok(minify(templateString));
    } catch (error) {
      return err(
        new TemplateStringCompressor.TemplateStringFormaterError("Can not minify template string", {
          errors: [error],
        }),
      );
    }
  }

  decompress(templateString: string): Result<string, any> {
    try {
      return ok(prettify(templateString));
    } catch (error) {
      return err(
        new TemplateStringCompressor.TemplateStringFormaterError("Can not format template string", {
          errors: [error],
        }),
      );
    }
  }
}
