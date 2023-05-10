import mjml2html from "mjml";
import { logger as pinoLogger } from "../../lib/logger";

const logger = pinoLogger.child({
  fn: "compileMjml",
});

export const compileMjml = (mjml: string) => {
  logger.debug("Converting MJML template to HTML");
  try {
    return mjml2html(mjml);
  } catch (error) {
    logger.error(error);
    return {
      html: undefined,
      errors: [{ message: "Critical error during the mjml to html compilation" }],
    };
  }
};
