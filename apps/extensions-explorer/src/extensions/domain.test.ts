import { describe, expect, it } from "vitest";

import { decodeConfig, encodeConfig } from "./codec";
import {
  appendExtensions,
  type ExtensionConfig,
  normalize,
  toManifestExtension,
  validate,
  withUniqueIdentifiers,
} from "./domain";

describe("validate", () => {
  it("rejects WIDGET target on a mount that has no widget slot", () => {
    expect(
      validate({ label: "x", mount: "PRODUCT_DETAILS_MORE_ACTIONS", target: "WIDGET" }),
    ).toMatch(/not available/);
  });

  it("rejects options that belong to another mount or target", () => {
    expect(
      validate({ label: "x", mount: "PRODUCT_DETAILS_WIDGETS", target: "POPUP", method: "POST" }),
    ).toMatch(/Method/);
    expect(
      validate({ label: "x", mount: "HOMEPAGE_WIDGETS", target: "POPUP", views: ["ORDER_LIST"] }),
    ).toMatch(/SEARCH_ACTION/);
    expect(
      validate({ label: "x", mount: "ORDER_DETAILS_WIDGETS", target: "WIDGET", fullscreen: true }),
    ).toMatch(/Fullscreen/);
  });

  it("accepts valid combinations", () => {
    expect(
      validate({ label: "x", mount: "HOMEPAGE_WIDGETS", target: "WIDGET", fullscreen: true }),
    ).toBeNull();
    expect(
      validate({ label: "x", mount: "SEARCH_ACTION", target: "NEW_TAB", views: ["ORDER_LIST"] }),
    ).toBeNull();
  });
});

describe("normalize", () => {
  it("repairs a row after the mount changes under it", () => {
    const repaired = normalize({
      label: "x",
      mount: "PRODUCT_DETAILS_MORE_ACTIONS",
      target: "WIDGET",
      method: "POST",
      fullscreen: true,
    });

    expect(repaired).toStrictEqual({
      label: "x",
      mount: "PRODUCT_DETAILS_MORE_ACTIONS",
      target: "POPUP",
    });
    expect(validate(repaired)).toBeNull();
  });
});

describe("toManifestExtension", () => {
  it("uses homeWidgetTarget on the homepage and widgetTarget elsewhere", () => {
    expect(
      toManifestExtension(
        { label: "Home", mount: "HOMEPAGE_WIDGETS", target: "WIDGET", fullscreen: true },
        "https://app.example.com",
      ),
    ).toMatchObject({ options: { homeWidgetTarget: { method: "GET", fullscreen: true } } });

    expect(
      toManifestExtension(
        { label: "Order", mount: "ORDER_DETAILS_WIDGETS", target: "WIDGET" },
        "https://app.example.com",
      ),
    ).toMatchObject({ options: { widgetTarget: { method: "GET" } } });
  });

  it("points POST extensions at the API route and keeps APP_PAGE urls relative", () => {
    expect(
      toManifestExtension(
        { label: "Post", mount: "ORDER_DETAILS_WIDGETS", target: "WIDGET", method: "POST" },
        "https://app.example.com",
      ).url,
    ).toContain("https://app.example.com/api/placeholder?");

    expect(
      toManifestExtension(
        { label: "Page", mount: "NAVIGATION_ORDERS", target: "APP_PAGE" },
        "https://app.example.com",
      ).url.startsWith("/placeholder?"),
    ).toBe(true);
  });

  it("emits a hand-edited raw entry verbatim, however unsupported", () => {
    const raw = { label: "Custom", mount: "SOME_FUTURE_MOUNT", target: "POPUP", whatever: 1 };
    const extension = {
      label: "x",
      mount: "SEARCH_ACTION" as const,
      target: "POPUP" as const,
      raw,
    };

    expect(validate(extension)).toBeNull();
    expect(toManifestExtension(extension, "https://app.example.com")).toStrictEqual(raw);
  });

  it("derives an identifier from the label, unless one is set", () => {
    expect(
      toManifestExtension(
        { label: "Order widget", mount: "ORDER_DETAILS_WIDGETS", target: "WIDGET" },
        "https://app.example.com",
      ).identifier,
    ).toBe("order-widget");

    expect(
      toManifestExtension(
        { label: "ウィジェット", mount: "ORDER_DETAILS_WIDGETS", target: "WIDGET" },
        "https://app.example.com",
      ).identifier,
    ).toBe("order-details-widgets-extension");

    expect(
      toManifestExtension(
        {
          label: "Order widget",
          identifier: "my-widget",
          mount: "ORDER_DETAILS_WIDGETS",
          target: "WIDGET",
        },
        "https://app.example.com",
      ).identifier,
    ).toBe("my-widget");
  });

  it("drops blank aliases left over from typing", () => {
    expect(
      toManifestExtension(
        { label: "Search", mount: "SEARCH_ACTION", target: "POPUP", aliases: ["tax", " "] },
        "https://app.example.com",
      ),
    ).toMatchObject({ options: { aliases: ["tax"] } });
  });
});

describe("appendExtensions", () => {
  const row = (label: string, identifier?: string): ExtensionConfig => ({
    label,
    ...(identifier ? { identifier } : {}),
    mount: "PRODUCT_DETAILS_MORE_ACTIONS",
    target: "POPUP",
  });

  it("fills identifiers on added rows and steps around the ones already taken", () => {
    const list = appendExtensions(appendExtensions([], [row("New extension")]), [
      row("New extension"),
      row("New extension"),
      row("Other", "new-extension"),
    ]);

    expect(list.map((e) => e.identifier)).toStrictEqual([
      "new-extension",
      "new-extension-2",
      "new-extension-3",
      "new-extension-4",
    ]);
  });

  it("keeps identifiers that came from a shared config", () => {
    expect(appendExtensions([], [row("Widget", "my-widget")])[0].identifier).toBe("my-widget");
  });
});

describe("withUniqueIdentifiers", () => {
  it("suffixes collisions and leaves raw entries without an identifier alone", () => {
    const extension = { label: "x", mount: "HOMEPAGE_WIDGETS", target: "POPUP", permissions: [] };

    expect(
      withUniqueIdentifiers([
        { ...extension, identifier: "widget" },
        { ...extension, identifier: "widget" },
        { ...extension, identifier: "widget" },
        { ...extension },
      ] as never).map((e) => e.identifier),
    ).toStrictEqual(["widget", "widget-2", "widget-3", undefined]);
  });
});

describe("codec", () => {
  it("round-trips a config and returns null for garbage", () => {
    const config = {
      name: "Zażółć gęślą jaźń",
      extensions: [{ label: "x", mount: "SEARCH_ACTION" as const, target: "POPUP" as const }],
    };

    expect(decodeConfig(encodeConfig(config))).toStrictEqual(config);
    expect(encodeConfig(config)).not.toMatch(/[+/=]/);
    expect(decodeConfig("not-base64!!")).toBeNull();
    expect(decodeConfig(undefined)).toBeNull();
  });
});
