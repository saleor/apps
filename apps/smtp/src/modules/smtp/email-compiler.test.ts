import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { EmailCompiler } from "./email-compiler";
import { HandlebarsTemplateCompiler, ITemplateCompiler } from "./template-compiler";
import { err, ok, Result } from "neverthrow";

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
      smtpConfiguration: {
        senderEmail: "sender@saleor.io",
        senderName: "John Doe from Saleor",
        events: [
          {
            template: "template string",
            subject: "",
            eventType: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
            active: true,
          },
        ],
      },
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
      smtpConfiguration: {
        senderEmail: "sender@test.com",
        senderName: "sender test",
        events: [
          {
            template: "test {{foo}}",
            active: true,
            eventType: "ACCOUNT_DELETE",
            subject: "test subject",
          },
        ],
      },
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(EmailCompiler.CompilationFailedError);
  });

  it("Returns EmptyEmailBodyError if body of email is empty", () => {
    const result = compiler.compile({
      payload: { foo: 1 },
      recipientEmail: "recipien@test.com",
      event: "ACCOUNT_DELETE",
      smtpConfiguration: {
        senderEmail: "sender@test.com",
        senderName: "sender test",
        events: [
          {
            template: "",
            active: true,
            eventType: "ACCOUNT_DELETE",
            subject: "test subject",
          },
        ],
      },
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(EmailCompiler.EmptyEmailBodyError);
  });

  it("Returns valid compilation result", () => {
    const result = compiler.compile({
      payload: { foo: 2137 },
      recipientEmail: "recipien@test.com",
      event: "ACCOUNT_DELETE",
      smtpConfiguration: {
        senderEmail: "sender@test.com",
        senderName: "sender test",
        events: [
          {
            template: `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text >{{foo}}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
            active: true,
            eventType: "ACCOUNT_DELETE",
            subject: "test subject",
          },
        ],
      },
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
