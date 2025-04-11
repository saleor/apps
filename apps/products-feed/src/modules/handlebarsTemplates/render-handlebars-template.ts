// TODO: PF and EAM apps use handlebars. Extract this module to shared package.

import Handlebars from "handlebars";
import handlebars_helpers from "handlebars-helpers";

import { createLogger } from "../../logger";

const logger = createLogger("renderHandlebarsTemplate");

// Register handlebars-helpers with Handlebars
handlebars_helpers({ handlebars: Handlebars });

interface RenderHandlebarsTemplateArgs {
  template: string;
  data: Record<string, unknown>;
}

export const renderHandlebarsTemplate = ({ template, data }: RenderHandlebarsTemplateArgs) => {
  try {
    const compiledTemplate = Handlebars.compile(template);

    return compiledTemplate(data);
  } catch (error) {
    logger.warn("Template compilation failed", { error: error });
    throw new Error("Could not render the template");
  }
};
