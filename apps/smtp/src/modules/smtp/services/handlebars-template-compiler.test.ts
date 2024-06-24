import { describe, expect, it } from "vitest";
import { HandlebarsTemplateCompiler } from "./handlebars-template-compiler";

describe("HandlebarsTemplateCompiler", () => {
  it("Compiles template", () => {
    const compiler = new HandlebarsTemplateCompiler();
    const result = compiler.compile("Template {{foo}}", { foo: "bar" });

    expect(result._unsafeUnwrap()).toEqual({ template: "Template bar" });
  });

  it("Returns error if compilation failed", () => {
    const compiler = new HandlebarsTemplateCompiler();
    const result = compiler.compile("{{{", { foo: "bar" });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(HandlebarsTemplateCompiler.FailedCompileError);
  });

  it("Supports syntax from handlebars helpers", () => {
    const template = `{{#is foo "bar"}}I should render{{else}}I should render otherwise{{/is}}`;

    const compiler = new HandlebarsTemplateCompiler();
    const result1 = compiler.compile(template, { foo: "bar" });
    const result2 = compiler.compile(template, { foo: "not-bar" });

    expect(result1._unsafeUnwrap()).toEqual({
      template: "I should render",
    });

    expect(result2._unsafeUnwrap()).toEqual({
      template: "I should render otherwise",
    });
  });
});
