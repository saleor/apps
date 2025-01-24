import { describe, expect, it } from "vitest";

import { filterEmptyValuesFromObject } from "./filter-empty-values-from-object";

describe("filterEmptyValues", () => {
  it("removes null and undefined values", () => {
    const input = {
      a: 1,
      b: null,
      c: undefined,
      d: "test",
    };

    expect(filterEmptyValuesFromObject(input)).toMatchInlineSnapshot(`
      {
        "a": 1,
        "d": "test",
      }
    `);
  });

  it("should remove null or undefined from nested objects", () => {
    const input = {
      a: 1,
      b: {
        c: null,
        d: undefined,
        e: "test",
        arry: [
          {
            key: undefined,
            value: null,
            one: 1,
          },
        ],
      },
    };

    expect(filterEmptyValuesFromObject(input)).toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": {
          "arry": [
            {
              "one": 1,
            },
          ],
          "e": "test",
        },
      }
    `);
  });
});
