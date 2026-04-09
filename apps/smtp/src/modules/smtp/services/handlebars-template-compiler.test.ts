import { describe, expect, it } from "vitest";

import { HandlebarsTemplateCompiler } from "./handlebars-template-compiler";

describe("HandlebarsTemplateCompiler", () => {
  it("Compiles template", () => {
    const compiler = new HandlebarsTemplateCompiler();
    const result = compiler.compile("Template {{foo}}", { foo: "bar" });

    expect(result._unsafeUnwrap()).toStrictEqual({ template: "Template bar" });
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

    expect(result1._unsafeUnwrap()).toStrictEqual({
      template: "I should render",
    });

    expect(result2._unsafeUnwrap()).toStrictEqual({
      template: "I should render otherwise",
    });
  });

  describe("allowed helpers work in templates", () => {
    const compiler = new HandlebarsTemplateCompiler();

    it("supports comparison helpers (eq)", () => {
      const result = compiler.compile(
        '{{#eq status "paid"}}Payment received{{else}}Pending{{/eq}}',
        { status: "paid" },
      );

      expect(result._unsafeUnwrap().template).toBe("Payment received");
    });

    it("supports string helpers (uppercase, lowercase, truncate)", () => {
      const result = compiler.compile("{{uppercase name}} - {{lowercase label}}", {
        name: "hello",
        label: "WORLD",
      });

      expect(result._unsafeUnwrap().template).toBe("HELLO - world");
    });

    it("supports math helpers (add, multiply)", () => {
      const result = compiler.compile("Total: {{multiply price qty}}", { price: 10, qty: 3 });

      expect(result._unsafeUnwrap().template).toBe("Total: 30");
    });

    it("supports number helpers (addCommas)", () => {
      const result = compiler.compile("{{addCommas amount}}", { amount: 1234567 });

      expect(result._unsafeUnwrap().template).toBe("1,234,567");
    });
  });

  describe("removed helpers are rejected", () => {
    const compiler = new HandlebarsTemplateCompiler();

    it("rejects fs helper: read (file system access)", () => {
      const result = compiler.compile('{{read "/etc/passwd"}}', {});

      expect(result.isErr()).toBe(true);

      const error = result._unsafeUnwrapErr();

      expect(error.errorCode).toBe("HANDLEBARS_MISSING_HELPER");
    });

    it("rejects fs helper: readdir (directory listing)", () => {
      const result = compiler.compile('{{readdir "/"}}', {});

      expect(result.isErr()).toBe(true);

      const error = result._unsafeUnwrapErr();

      expect(error.errorCode).toBe("HANDLEBARS_MISSING_HELPER");
    });

    it("rejects code helper: embed (file inclusion)", () => {
      const result = compiler.compile('{{embed "secret.js"}}', {});

      expect(result.isErr()).toBe(true);

      const error = result._unsafeUnwrapErr();

      expect(error.errorCode).toBe("HANDLEBARS_MISSING_HELPER");
    });

    it("allows object helper: JSONparse", () => {
      const result = compiler.compile(
        '{{#with (JSONparse \'{"name":"test"}\')}}{{name}}{{/with}}',
        {},
      );

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().template).toBe("test");
    });

    it("rejects object helpers: extend (prototype pollution)", () => {
      const result = compiler.compile("{{extend a b}}", { a: {}, b: {} });

      expect(result.isErr()).toBe(true);

      const error = result._unsafeUnwrapErr();

      expect(error.errorCode).toBe("HANDLEBARS_MISSING_HELPER");
    });

    it("rejects object helpers: merge (prototype pollution)", () => {
      const result = compiler.compile("{{merge a b}}", { a: {}, b: {} });

      expect(result.isErr()).toBe(true);

      const error = result._unsafeUnwrapErr();

      expect(error.errorCode).toBe("HANDLEBARS_MISSING_HELPER");
    });

    it("rejects path helper: resolve (path traversal)", () => {
      const result = compiler.compile('{{resolve "../../../etc/passwd"}}', {});

      expect(result.isErr()).toBe(true);

      const error = result._unsafeUnwrapErr();

      expect(error.errorCode).toBe("HANDLEBARS_MISSING_HELPER");
    });

    it("rejects markdown helper: md (arbitrary file read)", () => {
      const result = compiler.compile('{{md "/etc/passwd"}}', {});

      expect(result.isErr()).toBe(true);

      const error = result._unsafeUnwrapErr();

      expect(error.errorCode).toBe("HANDLEBARS_MISSING_HELPER");
    });

    it("rejects match helper: mm (regex DoS potential)", () => {
      const result = compiler.compile('{{mm value "pattern"}}', { value: "test" });

      expect(result.isErr()).toBe(true);

      const error = result._unsafeUnwrapErr();

      expect(error.errorCode).toBe("HANDLEBARS_MISSING_HELPER");
    });
  });
});
