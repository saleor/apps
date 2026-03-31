import { describe, expect, it } from "vitest";

import { removeDigitalContentUrlFromQuery } from "./remove-digital-content-url-from-query";

describe("removeDigitalContentUrlFromQuery", () => {
  it("returns null when query is null", () => {
    expect(removeDigitalContentUrlFromQuery(null)).toBeNull();
  });

  it("returns null when query is undefined", () => {
    expect(removeDigitalContentUrlFromQuery(undefined)).toBeNull();
  });

  it("returns unchanged query when no digitalContentUrl present", () => {
    const query = "fragment OrderDetails on Order { id number status userEmail }";

    expect(removeDigitalContentUrlFromQuery(query)).toStrictEqual({
      query: "fragment OrderDetails on Order { id number status userEmail }",
      changed: false,
    });
  });

  it("removes digitalContentUrl from minified query", () => {
    const query = "fragment OrderDetails on Order { id number digitalContentUrl status userEmail }";

    expect(removeDigitalContentUrlFromQuery(query)).toStrictEqual({
      query: "fragment OrderDetails on Order { id number status userEmail }",
      changed: true,
    });
  });

  it("removes digitalContentUrl with selection set from minified query", () => {
    const query =
      "fragment OrderDetails on Order { id number digitalContentUrl { url contentType } status userEmail }";

    expect(removeDigitalContentUrlFromQuery(query)).toStrictEqual({
      query: "fragment OrderDetails on Order { id number status userEmail }",
      changed: true,
    });
  });

  it("removes digitalContentUrl from multi-line query", () => {
    const query = [
      "fragment OrderDetails on Order {",
      "  id",
      "  number",
      "  digitalContentUrl",
      "  status",
      "  userEmail",
      "}",
    ].join("\n");

    expect(removeDigitalContentUrlFromQuery(query)).toStrictEqual({
      query: [
        "fragment OrderDetails on Order {",
        "  id",
        "  number",
        "  status",
        "  userEmail",
        "}",
      ].join("\n"),
      changed: true,
    });
  });

  it("removes digitalContentUrl with selection set from multi-line query", () => {
    const query = [
      "fragment OrderDetails on Order {",
      "  id",
      "  digitalContentUrl {",
      "    url",
      "    contentType",
      "  }",
      "  status",
      "}",
    ].join("\n");

    expect(removeDigitalContentUrlFromQuery(query)).toStrictEqual({
      query: ["fragment OrderDetails on Order {", "  id", "  status", "}"].join("\n"),
      changed: true,
    });
  });

  it("preserves surrounding fields and structure in complex minified query", () => {
    const query =
      "fragment OrderCreatedWebhookPayload on OrderCreated { order { ...OrderDetails } } fragment OrderDetails on Order { id number status digitalContentUrl userEmail channel { slug name } lines { id productName } } subscription OrderCreated { event { ...OrderCreatedWebhookPayload } }";

    expect(removeDigitalContentUrlFromQuery(query)).toStrictEqual({
      query:
        "fragment OrderCreatedWebhookPayload on OrderCreated { order { ...OrderDetails } } fragment OrderDetails on Order { id number status userEmail channel { slug name } lines { id productName } } subscription OrderCreated { event { ...OrderCreatedWebhookPayload } }",
      changed: true,
    });
  });
});
