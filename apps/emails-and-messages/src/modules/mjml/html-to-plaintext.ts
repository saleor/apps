import { convert } from "html-to-text";
import { logger as pinoLogger } from "../../lib/logger";

const logger = pinoLogger.child({
  fn: "htmlToPlaintext",
});

export const htmlToPlaintext = (html: string) => {
  logger.debug("Converting HTML template to plaintext");
  try {
    const plaintext = convert(html);
    logger.debug("Converted successfully");
    return {
      plaintext,
    };
  } catch (error) {
    logger.error(error);
    return {
      errors: [{ message: "Could not convert html to plaintext" }],
    };
  }
};
