import { ITemplateStringCompressor } from "../smtp/services/template-string-compressor";
import { ITemplateStringValidator } from "../smtp/services/template-string-validator";

interface ValidateTemplateProps {
  template: string;
  templateStringValidator: ITemplateStringValidator;
  templateStringCompressor: ITemplateStringCompressor;
}

export function validateTemplate({
  templateStringValidator,
  template,
  templateStringCompressor,
}: ValidateTemplateProps) {
  if (!templateStringCompressor.isCompressed(template)) {
    const compressedTemplateResult = templateStringCompressor.compress(template);
    const compressTemplate = compressedTemplateResult.isOk()
      ? compressedTemplateResult.value
      : template;

    return templateStringValidator.validate(compressTemplate);
  }

  return templateStringValidator.validate(template);
}
