import { describe, expect, it } from "vitest";

import { extractPaths } from "./monaco-completions";

describe("extractPaths", () => {
  it("returns empty array for null", () => {
    expect(extractPaths(null)).toStrictEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(extractPaths(undefined)).toStrictEqual([]);
  });

  it("returns empty array for primitives", () => {
    expect(extractPaths("string")).toStrictEqual([]);
    expect(extractPaths(42)).toStrictEqual([]);
    expect(extractPaths(true)).toStrictEqual([]);
  });

  it("returns empty array for empty object", () => {
    expect(extractPaths({})).toStrictEqual([]);
  });

  it("extracts flat scalar paths", () => {
    const result = extractPaths({ name: "John", age: 30 });

    expect(result).toStrictEqual([
      { path: "name", isArray: false },
      { path: "age", isArray: false },
    ]);
  });

  it("extracts nested object paths", () => {
    const result = extractPaths({ order: { id: "123", total: 100 } });

    expect(result).toStrictEqual([
      { path: "order", isArray: false },
      { path: "order.id", isArray: false },
      { path: "order.total", isArray: false },
    ]);
  });

  it("marks arrays with isArray: true", () => {
    const result = extractPaths({ tags: ["a", "b"] });

    expect(result).toStrictEqual([{ path: "tags", isArray: true }]);
  });

  it("recurses into first element of object arrays with 'this' prefix", () => {
    const result = extractPaths({
      lines: [{ productName: "Shirt", quantity: 2 }],
    });

    expect(result).toStrictEqual([
      { path: "lines", isArray: true },
      { path: "this.productName", isArray: false },
      { path: "this.quantity", isArray: false },
    ]);
  });

  it("does not recurse into empty arrays", () => {
    const result = extractPaths({ items: [] });

    expect(result).toStrictEqual([{ path: "items", isArray: true }]);
  });

  it("does not recurse into arrays of primitives", () => {
    const result = extractPaths({ ids: [1, 2, 3] });

    expect(result).toStrictEqual([{ path: "ids", isArray: true }]);
  });

  it("handles deeply nested structures", () => {
    const result = extractPaths({
      order: {
        billingAddress: {
          city: "Warsaw",
          country: { code: "PL" },
        },
      },
    });

    expect(result).toStrictEqual([
      { path: "order", isArray: false },
      { path: "order.billingAddress", isArray: false },
      { path: "order.billingAddress.city", isArray: false },
      { path: "order.billingAddress.country", isArray: false },
      { path: "order.billingAddress.country.code", isArray: false },
    ]);
  });

  it("uses custom prefix", () => {
    const result = extractPaths({ name: "test" }, "root");

    expect(result).toStrictEqual([{ path: "root.name", isArray: false }]);
  });

  it("handles mixed nested objects and arrays", () => {
    const result = extractPaths({
      order: {
        id: "123",
        lines: [{ productName: "Shirt" }],
      },
    });

    expect(result).toStrictEqual([
      { path: "order", isArray: false },
      { path: "order.id", isArray: false },
      { path: "order.lines", isArray: true },
      { path: "this.productName", isArray: false },
    ]);
  });
});
