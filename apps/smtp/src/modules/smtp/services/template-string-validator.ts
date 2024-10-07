import { ok, Result } from "neverthrow";

import { BaseError } from "../../../errors";
import { createLogger } from "../../../logger";

export interface ITemplateStringValidator {
  validate(template: string): Result<boolean, InstanceType<typeof BaseError>>;
}

const MAX_TEMPLATE_SIZE_IN_BYTES = 2500; // 2.5KB

export class TemplateStringValidator implements ITemplateStringValidator {
  private logger = createLogger("TemplateStringValidator");

  validate(template: string): Result<boolean, InstanceType<typeof BaseError>> {
    const templateSize = new Blob([template]).size;
    const isTemplateSizeValid = templateSize <= MAX_TEMPLATE_SIZE_IN_BYTES;

    if (isTemplateSizeValid) {
      this.logger.info("Template size valid", { templateSize });
    } else {
      this.logger.warn("Template size invalid", { templateSize });
    }

    return ok(isTemplateSizeValid);
  }
}
