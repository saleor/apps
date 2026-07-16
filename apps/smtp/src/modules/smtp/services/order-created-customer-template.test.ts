import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { examplePayloads } from "../../event-handlers/default-payloads";
import { EmailCompiler } from "./email-compiler";
import { HandlebarsTemplateCompiler } from "./handlebars-template-compiler";
import { HtmlToTextCompiler } from "./html-to-text-compiler";
import { MjmlCompiler } from "./mjml-compiler";

const __dirname = dirname(fileURLToPath(import.meta.url));

const template = readFileSync(join(__dirname, "__fixtures__/order-created-template.mjml"), "utf-8");

const createCompiler = () =>
  new EmailCompiler(new HandlebarsTemplateCompiler(), new HtmlToTextCompiler(), new MjmlCompiler());

const compile = (payload: unknown) =>
  createCompiler().compile({
    recipientEmail: "recipient@example.com",
    event: "ORDER_CREATED",
    payload,
    bodyTemplate: template,
    subjectTemplate: "Order {{order.number}}",
    senderName: "Sender",
    senderEmail: "sender@example.com",
  });

describe("ORDER_CREATED customer template", () => {
  it("compiles with the ORDER_CREATED example payload used by preview", () => {
    const result = compile(examplePayloads.ORDER_CREATED);

    expect(result.isOk()).toBe(true);

    const email = result._unsafeUnwrap();

    expect(email.subject).toBe("Order 1042");
    expect(email.html).toContain("Thank you for your order!");
    expect(email.html).toContain("Discount");
    expect(email.text).toContain("Total (incl. tax)");
  });

  it("fails against an empty payload in the same way the old save validation did", () => {
    const result = compile({});

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toContain(
      "expected the first argument to be a number",
    );
  });
});

describe("ORDER_CREATED customer template payload assumptions", () => {
  it.each([
    [
      "null variant on a line",
      (payload: typeof examplePayloads.ORDER_CREATED) => {
        payload.order.lines[0].variant = null;
      },
    ],
    [
      "null thumbnail on a line",
      (payload: typeof examplePayloads.ORDER_CREATED) => {
        payload.order.lines[0].thumbnail = null;
      },
    ],
    [
      "null shipping address",
      (payload: typeof examplePayloads.ORDER_CREATED) => {
        payload.order.shippingAddress = null;
      },
    ],
    [
      "empty order lines",
      (payload: typeof examplePayloads.ORDER_CREATED) => {
        payload.order.lines = [];
      },
    ],
  ])("still compiles with %s", (_name, mutate) => {
    const payload = structuredClone(examplePayloads.ORDER_CREATED);

    mutate(payload);

    expect(compile(payload).isOk()).toBe(true);
  });

  it.each([
    [
      "missing order",
      (payload: typeof examplePayloads.ORDER_CREATED) => {
        delete payload.order;
      },
    ],
    [
      "null undiscounted total",
      (payload: typeof examplePayloads.ORDER_CREATED) => {
        payload.order.undiscountedTotal = null;
      },
    ],
    [
      "null total",
      (payload: typeof examplePayloads.ORDER_CREATED) => {
        payload.order.total = null;
      },
    ],
  ])("fails with %s because the discount helper needs totals", (_name, mutate) => {
    const payload = structuredClone(examplePayloads.ORDER_CREATED);

    mutate(payload);

    expect(compile(payload).isErr()).toBe(true);
  });
});
