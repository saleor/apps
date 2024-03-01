// TODO: PF and EAM apps use handlebars. Extract this module to shared package.

import Handlebars from "handlebars";
import { createLogger } from "../../logger";

const logger = createLogger("renderHandlebarsTemplate");

interface RenderHandlebarsTemplateArgs {
  template: string;
  data: Record<string, unknown>;
}

export const renderHandlebarsTemplate = ({ template, data }: RenderHandlebarsTemplateArgs) => {
  try {
    const compiledTemplate = Handlebars.compile(template);

    return compiledTemplate(data);
  } catch (error) {
    logger.error(error, "Template compilation failed");
    throw new Error("Could not render the template");
  }
};
