import { err, Result } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmailCompiler } from "./email-compiler";
import { HandlebarsTemplateCompiler } from "./handlebars-template-compiler";
import { HtmlToTextCompiler } from "./html-to-text-compiler";
import { MjmlCompiler } from "./mjml-compiler";

const getMjmlTemplate = (injectedValue: string | number) => `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text >${{ injectedValue }}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

describe("EmailCompiler", () => {
  let compiler = new EmailCompiler(
    new HandlebarsTemplateCompiler(),
    new HtmlToTextCompiler(),
    new MjmlCompiler(),
  );

  beforeEach(() => {
    vi.resetAllMocks();

    compiler = new EmailCompiler(
      new HandlebarsTemplateCompiler(),
      new HtmlToTextCompiler(),
      new MjmlCompiler(),
    );
  });

  it("Returns EmptyEmailSubjectError error if subject is empty", () => {
    const result = compiler.compile({
      event: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
      recipientEmail: "foo@bar.com",
      payload: {},
      bodyTemplate: getMjmlTemplate("2137"),
      senderEmail: "sender@saleor.io",
      senderName: "John Doe from Saleor",
      subjectTemplate: "",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(EmailCompiler.EmptyEmailSubjectError);
  });

  it("Returns CompilationFailedError if underlying template compiler fails to compile", () => {
    const compiler = new EmailCompiler(
      {
        compile(): Result<
          {
            template: string;
          },
          InstanceType<typeof HandlebarsTemplateCompiler.HandlebarsTemplateCompilerError>
        > {
          return err(
            new HandlebarsTemplateCompiler.HandlebarsTemplateCompilerError("Error to compile"),
          );
        },
      },
      new HtmlToTextCompiler(),
      new MjmlCompiler(),
    );

    const result = compiler.compile({
      payload: { foo: 1 },
      recipientEmail: "recipien@test.com",
      event: "ACCOUNT_DELETE",
      bodyTemplate: getMjmlTemplate("2137"),
      senderEmail: "sender@saleor.io",
      senderName: "John Doe from Saleor",
      subjectTemplate: "",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(EmailCompiler.CompilationFailedError);
  });

  it("Returns EmptyEmailBodyError if body of email is empty", () => {
    const result = compiler.compile({
      payload: { foo: 1 },
      recipientEmail: "recipien@test.com",
      event: "ACCOUNT_DELETE",
      bodyTemplate: "",
      senderEmail: "sender@saleor.io",
      senderName: "John Doe from Saleor",
      subjectTemplate: "subject",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(EmailCompiler.EmptyEmailBodyError);
  });

  it("Returns valid compilation result", () => {
    const result = compiler.compile({
      payload: { foo: 2137 },
      recipientEmail: "recipien@test.com",
      event: "ACCOUNT_DELETE",
      subjectTemplate: "test subject",
      senderEmail: "sender@saleor.io",
      senderName: "John Doe from Saleor",
      bodyTemplate: `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text >{{foo}}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    });

    const resultValue = result._unsafeUnwrap();

    expect(resultValue.from).toStrictEqual("John Doe from Saleor <sender@saleor.io>");
    expect(resultValue.to).toStrictEqual("recipien@test.com");
    expect(resultValue.subject).toStrictEqual("test subject");
    expect(resultValue.text).toStrictEqual("2137");
    // Simple assertion to check if result HTML includes injected value
    expect(resultValue.html.includes("2137")).toBe(true);
  });

  describe("validate", () => {
    it("Returns success for valid subject and MJML templates", () => {
      const result = compiler.validate("Order {{order.number}}", getMjmlTemplate("test"), {
        order: { number: "123" },
      });

      expect(result.isOk()).toBe(true);
    });

    it("Returns error with errorContext SUBJECT for invalid Handlebars in subject", () => {
      const result = compiler.validate("Order {{#if}}", getMjmlTemplate("test"), {});

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr() as InstanceType<
        typeof EmailCompiler.CompilationFailedError
      >;

      expect(error).toBeInstanceOf(EmailCompiler.CompilationFailedError);
      expect(error.errorContext).toBe("SUBJECT");
    });

    it("Returns error with errorContext BODY_TEMPLATE for invalid Handlebars in body", () => {
      const invalidHandlebarsTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>{{#if}}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

      const result = compiler.validate("Valid subject", invalidHandlebarsTemplate, {});

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr() as InstanceType<
        typeof EmailCompiler.CompilationFailedError
      >;

      expect(error).toBeInstanceOf(EmailCompiler.CompilationFailedError);
      expect(error.errorContext).toBe("BODY_TEMPLATE");
    });

    it("Returns error with errorContext BODY_MJML for invalid MJML syntax", () => {
      const invalidMjmlTemplate = `<mjml>
  <mj-body>
    <mj-invalid-tag>Test</mj-invalid-tag>
  </mj-body>
</mjml>`;

      const result = compiler.validate("Valid subject", invalidMjmlTemplate, {});

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr() as InstanceType<
        typeof EmailCompiler.CompilationFailedError
      >;

      expect(error).toBeInstanceOf(EmailCompiler.CompilationFailedError);
      expect(error.errorContext).toBe("BODY_MJML");
    });

    it("Returns error for empty subject", () => {
      const result = compiler.validate("", getMjmlTemplate("test"), {});

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(EmailCompiler.EmptyEmailSubjectError);
    });
  });
});
