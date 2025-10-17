export const templateErrorCodes = {
  INVALID_PAYLOAD_JSON: "INVALID_PAYLOAD_JSON",
  HANDLEBARS_MISSING_HELPER: "HANDLEBARS_MISSING_HELPER",
  HANDLEBARS_PARSE_ERROR: "HANDLEBARS_PARSE_ERROR",
  HANDLEBARS_COMPILE_ERROR: "HANDLEBARS_COMPILE_ERROR",
  MJML_VALIDATION_ERROR: "MJML_VALIDATION_ERROR",
  MJML_COMPILE_ERROR: "MJML_COMPILE_ERROR",
  EMPTY_EMAIL_SUBJECT: "EMPTY_EMAIL_SUBJECT",
  EMPTY_EMAIL_BODY: "EMPTY_EMAIL_BODY",
  PLAINTEXT_COMPILATION_FAILED: "PLAINTEXT_COMPILATION_FAILED",
} as const;

export type TemplateErrorCode = (typeof templateErrorCodes)[keyof typeof templateErrorCodes];

export const hasErrorCode = (error: unknown): error is { errorCode?: TemplateErrorCode } => {
  return typeof error === "object" && error !== null && "errorCode" in error;
};
