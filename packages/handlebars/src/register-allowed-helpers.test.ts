import Handlebars from "handlebars";
import handlebarsHelpers from "handlebars-helpers";
import { beforeEach, describe, expect, it } from "vitest";

import { ALLOWED_HELPERS } from "./allowed-helpers";
import { registerAllowedHelpers } from "./register-allowed-helpers";

const allAllowedHelpers = Object.entries(ALLOWED_HELPERS).flatMap(([group, names]) =>
  names.map((name) => ({ group, name })),
);

describe("registerAllowedHelpers", () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
  });

  describe("registers each allowed helper", () => {
    it.each(allAllowedHelpers)(
      "registers $group helper: $name",
      ({ name }) => {
        registerAllowedHelpers(hbs, handlebarsHelpers);

        expect(hbs.helpers[name], `Expected helper "${name}" to be registered`).toBeDefined();
      },
    );
  });

  it("does not register helpers beyond the allow list", () => {
    registerAllowedHelpers(hbs, handlebarsHelpers);

    const builtInHelpers = new Set(Object.keys(Handlebars.create().helpers));
    const allowedNames = new Set(Object.values(ALLOWED_HELPERS).flat());

    const registeredCustomHelpers = Object.keys(hbs.helpers).filter(
      (name) => !builtInHelpers.has(name),
    );

    registeredCustomHelpers.forEach((name) => {
      expect(
        allowedNames.has(name),
        `Helper "${name}" was registered but is not in ALLOWED_HELPERS`,
      ).toBe(true);
    });
  });

  describe("removed groups are not loaded", () => {
    it.each(["fs", "logging", "markdown", "match", "object"])(
      "does not include removed group: %s",
      (group) => {
        expect(
          ALLOWED_HELPERS[group],
          `Group "${group}" should not be in ALLOWED_HELPERS`,
        ).toBeUndefined();
      },
    );
  });

  describe("individually removed helpers are not registered", () => {
    it.each(["embed", "resolve"])(
      "does not register removed helper: %s",
      (name) => {
        registerAllowedHelpers(hbs, handlebarsHelpers);

        expect(hbs.helpers[name], `Helper "${name}" should NOT be registered`).toBeUndefined();
      },
    );
  });

  it("allows using comparison helpers in templates", () => {
    registerAllowedHelpers(hbs, handlebarsHelpers);

    const template = hbs.compile('{{#eq foo "bar"}}yes{{else}}no{{/eq}}');

    expect(template({ foo: "bar" })).toBe("yes");
    expect(template({ foo: "baz" })).toBe("no");
  });

  it("allows using string helpers in templates", () => {
    registerAllowedHelpers(hbs, handlebarsHelpers);

    const template = hbs.compile("{{uppercase name}}");

    expect(template({ name: "hello" })).toBe("HELLO");
  });

  it("allows using math helpers in templates", () => {
    registerAllowedHelpers(hbs, handlebarsHelpers);

    const template = hbs.compile("{{add a b}}");

    expect(template({ a: 1, b: 2 })).toBe("3");
  });

  it("throws when using a helper that was not registered", () => {
    const template = hbs.compile("{{unknownHelper foo}}");

    expect(() => template({ foo: "bar" })).toThrow();
  });
});
