import { describe, expect, it } from "vitest";

import { chunkArray } from "./chunk-array";

describe("chunkArray", () => {
  it("should split array into chunks of specified size", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const result = chunkArray(input, 2);

    expect(result).toStrictEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it("should handle arrays that don't divide evenly", () => {
    const input = [1, 2, 3, 4, 5];
    const result = chunkArray(input, 2);

    expect(result).toStrictEqual([[1, 2], [3, 4], [5]]);
  });

  it("should return empty array for empty input", () => {
    const result = chunkArray([], 3);

    expect(result).toStrictEqual([]);
  });

  it("should return single chunk when size is larger than array", () => {
    const input = [1, 2, 3];
    const result = chunkArray(input, 10);

    expect(result).toStrictEqual([[1, 2, 3]]);
  });

  it("should create chunks of size 1", () => {
    const input = [1, 2, 3];
    const result = chunkArray(input, 1);

    expect(result).toStrictEqual([[1], [2], [3]]);
  });

  it("should work with string arrays", () => {
    const input = ["a", "b", "c", "d", "e"];
    const result = chunkArray(input, 2);

    expect(result).toStrictEqual([["a", "b"], ["c", "d"], ["e"]]);
  });

  it("should work with object arrays", () => {
    const input = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ];
    const result = chunkArray(input, 2);

    expect(result).toStrictEqual([
      [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
      [{ id: 3, name: "Charlie" }],
    ]);
  });

  it("should handle chunk size equal to array length", () => {
    const input = [1, 2, 3];
    const result = chunkArray(input, 3);

    expect(result).toStrictEqual([[1, 2, 3]]);
  });

  it("should handle large arrays with multiple chunks", () => {
    const input = Array.from({ length: 100 }, (_, i) => i + 1);
    const result = chunkArray(input, 10);

    expect(result).toHaveLength(10);
    expect(result[0]).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result[9]).toStrictEqual([91, 92, 93, 94, 95, 96, 97, 98, 99, 100]);
  });

  it("should not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const inputCopy = [...input];

    chunkArray(input, 2);

    expect(input).toStrictEqual(inputCopy);
  });

  it("should throw error when chunk size is zero", () => {
    expect(() => chunkArray([1, 2, 3], 0)).toThrow("Chunk size must be a positive integer");
  });

  it("should throw error when chunk size is negative", () => {
    expect(() => chunkArray([1, 2, 3], -5)).toThrow("Chunk size must be a positive integer");
  });

  it("should throw error when chunk size is a float", () => {
    expect(() => chunkArray([1, 2, 3], 2.5)).toThrow("Chunk size must be a positive integer");
  });

  it("should throw error when chunk size is NaN", () => {
    expect(() => chunkArray([1, 2, 3], NaN)).toThrow("Chunk size must be a positive integer");
  });
});
