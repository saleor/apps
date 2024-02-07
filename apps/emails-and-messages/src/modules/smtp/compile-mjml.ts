import mjml2html from "mjml";
import { createLogger } from "../../logger";

const logger = createLogger("compileMjml");

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
