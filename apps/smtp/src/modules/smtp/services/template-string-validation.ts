import { ITemplateStringFormater, TemplateStringFormater } from "./template-string-formater";

export interface ITemplateStringValidator {
  validate(template: string): boolean;
}

const MAX_TEMPLATE_SIZE_IN_BYTES = 2500; // 2.5KB

export class TemplateStringValidator implements ITemplateStringValidator {
  constructor(private templateStringFormater: ITemplateStringFormater) {}

  validate(template: string): boolean {
    const compressedTemplate = this.templateStringFormater.compress(template);
    const templateSize = new Blob([compressedTemplate]).size;

    console.log("templateSize", templateSize);

    return templateSize <= MAX_TEMPLATE_SIZE_IN_BYTES;
  }
}
