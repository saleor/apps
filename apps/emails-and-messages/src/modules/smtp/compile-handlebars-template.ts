import Handlebars from "handlebars";
import { logger as pinoLogger } from "../../lib/logger";

const logger = pinoLogger.child({
  fn: "compileHandlebarsTemplate",
});

export const compileHandlebarsTemplate = (template: string, variables: any) => {
  logger.debug("Compiling handlebars template");
  try {
    const templateDelegate = Handlebars.compile(template);
    const htmlTemplate = templateDelegate(variables);
    logger.debug("Template successfully compiled");
    return {
      template: htmlTemplate,
    };
  } catch (error) {
    logger.error(error);
    return {
      errors: [{ message: "Error during the using the handlebars template" }],
    };
  }
};
