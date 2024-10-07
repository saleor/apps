import { minify, prettify } from "htmlfy";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "../../../errors";

export interface ITemplateStringCompressor {
  isCompressed(template: string): Result<boolean, InstanceType<typeof BaseError>>;

  compress(template: string): Result<string, InstanceType<typeof BaseError>>;

  decompress(template: string): Result<string, InstanceType<typeof BaseError>>;
}

export class TemplateStringCompressor implements ITemplateStringCompressor {
  static TemplateStringFormaterError = BaseError.subclass("TemplateStringFormaterError");

  isCompressed(template: string): Result<boolean, InstanceType<typeof BaseError>> {
    return ok(/\s/g.test(template));
  }

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
