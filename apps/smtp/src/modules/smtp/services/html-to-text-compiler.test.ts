import { describe, expect, it } from "vitest";
import { HtmlToTextCompiler } from "./html-to-text-compiler";

describe("HtmlToTextCompiler", () => {
  it("Compiles HTML to plain text", () => {
    const compiler = new HtmlToTextCompiler();

    const result = compiler.compile("<div>Foo: <span>bar</span></div>");

    expect(result._unsafeUnwrap()).toEqual("Foo: bar");
  });

  it("Fallbacks to empty string when HTML is broken", () => {
    const compiler = new HtmlToTextCompiler();

    const result = compiler.compile("<div? aaa bbb");

    expect(result._unsafeUnwrap()).toEqual("");
  });
});
