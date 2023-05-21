import { describe, expect, it, vi } from "vitest";
import { EditorJsPlaintextRenderer } from "./editor-js-plaintext-renderer";

describe("EditorJsPlaintextRenderer", () => {
  it("Empty response for invalid input", () => {
    expect(EditorJsPlaintextRenderer({ stringData: "not json" })).toBe(undefined);
    expect(EditorJsPlaintextRenderer({ stringData: "" })).toBe(undefined);
  });
  it("Paragraph with no formatting", () => {
    expect(
      EditorJsPlaintextRenderer({
        stringData:
          '{"time": 1684697732024, "blocks": [{"id": "HVJ8gMNIXY", "data": {"text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris nibh lacus, dignissim at aliquet et, gravida sed velit. Suspendisse at volutpat erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}, "type": "paragraph"}], "version": "2.24.3"}',
      })
    ).toBe(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris nibh lacus, dignissim at aliquet et, gravida sed velit. Suspendisse at volutpat erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    );
  });
  it("Paragraph with additional formatting", () => {
    expect(
      EditorJsPlaintextRenderer({
        stringData:
          '{"time": 1684697809104, "blocks": [{"id": "HVJ8gMNIXY", "data": {"text": "Lorem ipsum dolor sit <b>amet</b>, consectetur adipiscing elit. Mauris <s>nibh lacus</s>, dignissim at aliquet et, gravida sed velit. Suspendisse at volutpat erat. <i>Lorem ipsum </i>dolor sit amet, consectetur adipiscing elit."}, "type": "paragraph"}], "version": "2.24.3"}',
      })
    ).toBe(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris nibh lacus, dignissim at aliquet et, gravida sed velit. Suspendisse at volutpat erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    );
  });
  it("Ordered list", () => {
    expect(
      EditorJsPlaintextRenderer({
        stringData:
          '{"time": 1684697916091, "blocks": [{"id": "BNL219JhYr", "data": {"items": ["Apples", "Oranges", "Bananas"], "style": "ordered"}, "type": "list"}], "version": "2.24.3"}',
      })
    ).toBe("1. Apples\n2. Oranges\n3. Bananas");
  });
  it("Unordered list", () => {
    expect(
      EditorJsPlaintextRenderer({
        stringData:
          '{"time": 1684697984679, "blocks": [{"id": "BNL219JhYr", "data": {"items": ["Apples", "Oranges", "Bananas"], "style": "unordered"}, "type": "list"}], "version": "2.24.3"}',
      })
    ).toBe("- Apples\n- Oranges\n- Bananas");
  });
  it("Header", () => {
    expect(
      EditorJsPlaintextRenderer({
        stringData:
          '{"time": 1684698075115, "blocks": [{"id": "nC-oNRu-pp", "data": {"text": "Lorem ipsum", "level": 1}, "type": "header"}], "version": "2.24.3"}',
      })
    ).toBe("Lorem ipsum");
  });
  it("Multiple styling option in one entry", () => {
    expect(
      EditorJsPlaintextRenderer({
        stringData:
          '{"time": 1684698250098, "blocks": [{"id": "nC-oNRu-pp", "data": {"text": "Lorem ipsum", "level": 1}, "type": "header"}, {"id": "1ADVi9cvw8", "data": {"text": "This is <b>introduction</b> to the list of things"}, "type": "paragraph"}, {"id": "7OFi_vE_hc", "data": {"items": ["Red", "Blue"], "style": "ordered"}, "type": "list"}, {"id": "PYLABJ1KWZ", "data": {"text": "Closing thoughts."}, "type": "paragraph"}], "version": "2.24.3"}',
      })
    ).toBe(
      "Lorem ipsum\n\nThis is introduction to the list of things\n1. Red\n2. Blue\nClosing thoughts."
    );
  });
});
