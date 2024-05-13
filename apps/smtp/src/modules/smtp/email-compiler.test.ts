import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { EmailCompiler } from "./email-compiler";
import { HandlebarsTemplateCompiler, ITemplateCompiler } from "./template-compiler";
import { err, ok, Result } from "neverthrow";

const getMjmlTemplate = (injectedValue: string | number) => `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text >{{injectedValue}}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

describe("EmailCompiler", () => {
  let templateCompiler = new HandlebarsTemplateCompiler();
  let compiler = new EmailCompiler(new HandlebarsTemplateCompiler());

  beforeEach(() => {
    vi.resetAllMocks();

    templateCompiler = new HandlebarsTemplateCompiler();
    compiler = new EmailCompiler(templateCompiler);
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
    const compiler = new EmailCompiler({
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
    });

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
      bodyTemplate: getMjmlTemplate("2137"),
      senderEmail: "sender@saleor.io",
      senderName: "John Doe from Saleor",
      subjectTemplate: `<mjml>
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

    expect(resultValue.from).toEqual("sender test <sender@test.com>");
    expect(resultValue.to).toEqual("recipien@test.com");
    expect(resultValue.subject).toEqual("test subject");
    expect(resultValue.text).toEqual("2137");
    // Simple assertion to check if result HTML includes injected value
    expect(resultValue.html.includes("2137")).toBe(true);
  });
});
