import Handlebars from "handlebars";
import { describe, it, expect, beforeEach } from "vitest";

import { ALLOWED_HELPERS } from "./allowed-helpers";
import { registerAllowedHelpers } from "./register-allowed-helpers";

describe("registerAllowedHelpers", () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
  });

  it("registers all allowed helpers", () => {
    registerAllowedHelpers(hbs);

    const registeredHelpers = hbs.helpers;

    for (const helperName of Object.keys(ALLOWED_HELPERS)) {
      expect(registeredHelpers[helperName], `Expected helper "${helperName}" to be registered`).toBeDefined();
    }
  });

  it("does not register helpers that are not in the allow list", () => {
    registerAllowedHelpers(hbs);

    const builtInHelpers = new Set(Object.keys(Handlebars.create().helpers));
    const registeredCustomHelpers = Object.keys(hbs.helpers).filter(
      (name) => !builtInHelpers.has(name),
    );

    for (const name of registeredCustomHelpers) {
      expect(
        ALLOWED_HELPERS,
        `Helper "${name}" was registered but is not in ALLOWED_HELPERS`,
      ).toHaveProperty(name);
    }
  });

  it("allows using registered comparison helpers in templates", () => {
    registerAllowedHelpers(hbs);

    const template = hbs.compile('{{#eq foo "bar"}}yes{{else}}no{{/eq}}');

    expect(template({ foo: "bar" })).toBe("yes");
    expect(template({ foo: "baz" })).toBe("no");
  });

  it("allows using registered string helpers in templates", () => {
    registerAllowedHelpers(hbs);

    const template = hbs.compile("{{uppercase name}}");

    expect(template({ name: "hello" })).toBe("HELLO");
  });

  it("allows using registered math helpers in templates", () => {
    registerAllowedHelpers(hbs);

    const template = hbs.compile("{{add a b}}");

    expect(template({ a: 1, b: 2 })).toBe("3");
  });

  it("throws when using a helper that was not registered", () => {
    // Register with an empty allow list by not calling registerAllowedHelpers
    const template = hbs.compile("{{unknownHelper foo}}");

    expect(() => template({ foo: "bar" })).toThrow();
  });

  describe("denied helpers are not registered", () => {
    const deniedHelpers = [
      // fs group — filesystem access
      { name: "read", group: "fs" },
      { name: "readdir", group: "fs" },
      // logging group — all helpers ("log" is a built-in Handlebars helper, so excluded from this check)
      { name: "info", group: "logging" },
      { name: "warn", group: "logging" },
      { name: "error", group: "logging" },
      { name: "debug", group: "logging" },
      // markdown group — all helpers
      { name: "markdown", group: "markdown" },
      { name: "md", group: "markdown" },
      // match group — all helpers
      { name: "match", group: "match" },
      { name: "isMatch", group: "match" },
      { name: "mm", group: "match" },
      // code group — embed
      { name: "embed", group: "code" },
      // object group — all helpers
      { name: "extend", group: "object" },
      { name: "forIn", group: "object" },
      { name: "forOwn", group: "object" },
      { name: "toPath", group: "object" },
      { name: "get", group: "object" },
      { name: "getObject", group: "object" },
      { name: "hasOwn", group: "object" },
      { name: "isObject", group: "object" },
      { name: "JSONparse", group: "object" },
      { name: "JSONstringify", group: "object" },
      { name: "merge", group: "object" },
      { name: "pick", group: "object" },
      // path group — resolve
      { name: "resolve", group: "path" },
    ];

    it.each(deniedHelpers)(
      "does not register $group helper: $name",
      ({ name }) => {
        registerAllowedHelpers(hbs);

        expect(
          hbs.helpers[name],
          `Helper "${name}" should NOT be registered`,
        ).toBeUndefined();
      },
    );

    it("denied helpers are not in ALLOWED_HELPERS", () => {
      for (const { name } of deniedHelpers) {
        expect(ALLOWED_HELPERS).not.toHaveProperty(name);
      }
    });
  });
});
