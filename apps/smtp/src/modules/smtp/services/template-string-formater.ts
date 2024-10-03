import { minify, prettify } from "htmlfy";

export interface ITemplateStringFormater {
  compress(template: string): string;

  format(template: string): string;
}

export class TemplateStringFormater implements ITemplateStringFormater {
  compress(templateString: string): string {
    return minify(templateString);
  }

  format(templateString: string): string {
    return prettify(templateString);
  }
}
