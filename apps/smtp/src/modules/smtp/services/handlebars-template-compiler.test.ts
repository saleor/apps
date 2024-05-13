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
});
