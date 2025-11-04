import { describe, expect, it, vi } from "vitest";

import { ChunkCaller } from "./chunk-caller";

describe("ChunkCaller", () => {
  it("should execute all operations and return results", async () => {
    const items = ["item1", "item2", "item3"];
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller(items, 2, executeFn);
    const results = await caller.executeCalls();

    expect(results).toStrictEqual(["result-item1", "result-item2", "result-item3"]);
    expect(executeFn).toHaveBeenCalledTimes(3);
    expect(executeFn).toHaveBeenCalledWith("item1");
    expect(executeFn).toHaveBeenCalledWith("item2");
    expect(executeFn).toHaveBeenCalledWith("item3");
  });

  it("should process items in controlled parallel batches", async () => {
    const items = ["item1", "item2", "item3", "item4", "item5"];
    const executionOrder: string[] = [];
    let activeCount = 0;
    let maxActiveCount = 0;

    const executeFn = vi.fn(async (item: string) => {
      activeCount++;
      maxActiveCount = Math.max(maxActiveCount, activeCount);
      executionOrder.push(`start-${item}`);

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      executionOrder.push(`end-${item}`);
      activeCount--;

      return `result-${item}`;
    });

    const caller = new ChunkCaller(items, 2, executeFn);

    await caller.executeCalls();

    // With maxParallelCalls=2 and 5 items, we should never have more than 2 active at once
    expect(maxActiveCount).toBeLessThanOrEqual(2);

    // First chunk should complete before second chunk starts
    const firstChunkEndIndex = executionOrder.indexOf("end-item2");
    const thirdItemStartIndex = executionOrder.indexOf("start-item3");

    expect(firstChunkEndIndex).toBeLessThan(thirdItemStartIndex);
  });

  it("should handle empty array", async () => {
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller([], 2, executeFn);
    const results = await caller.executeCalls();

    expect(results).toStrictEqual([]);
    expect(executeFn).not.toHaveBeenCalled();
  });

  it("should handle single item", async () => {
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller(["item1"], 5, executeFn);
    const results = await caller.executeCalls();

    expect(results).toStrictEqual(["result-item1"]);
    expect(executeFn).toHaveBeenCalledTimes(1);
  });

  it("should handle chunk size larger than items array", async () => {
    const items = ["item1", "item2", "item3"];
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller(items, 10, executeFn);
    const results = await caller.executeCalls();

    expect(results).toStrictEqual(["result-item1", "result-item2", "result-item3"]);
    expect(executeFn).toHaveBeenCalledTimes(3);
  });

  it("should handle chunk size of 1", async () => {
    const items = ["item1", "item2", "item3"];
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller(items, 1, executeFn);
    const results = await caller.executeCalls();

    expect(results).toStrictEqual(["result-item1", "result-item2", "result-item3"]);
    expect(executeFn).toHaveBeenCalledTimes(3);
  });

  it("should handle items that divide evenly into chunks", async () => {
    const items = ["item1", "item2", "item3", "item4", "item5", "item6"];
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller(items, 3, executeFn);
    const results = await caller.executeCalls();

    expect(results).toStrictEqual([
      "result-item1",
      "result-item2",
      "result-item3",
      "result-item4",
      "result-item5",
      "result-item6",
    ]);
    expect(executeFn).toHaveBeenCalledTimes(6);
  });

  it("should propagate errors from execute function", async () => {
    const items = ["item1", "item2", "item3"];
    const executeFn = vi.fn(async (item: string) => {
      if (item === "item2") {
        throw new Error("Execution failed for item2");
      }

      return `result-${item}`;
    });

    const caller = new ChunkCaller(items, 2, executeFn);

    await expect(caller.executeCalls()).rejects.toThrow("Execution failed for item2");
  });

  it("should work with different result types", async () => {
    interface Result {
      id: string;
      processed: boolean;
    }

    const items = ["id1", "id2", "id3"];
    const executeFn = vi.fn(
      async (item: string): Promise<Result> => ({
        id: item,
        processed: true,
      }),
    );

    const caller = new ChunkCaller<Result>(items, 2, executeFn);
    const results = await caller.executeCalls();

    expect(results).toStrictEqual([
      { id: "id1", processed: true },
      { id: "id2", processed: true },
      { id: "id3", processed: true },
    ]);
  });

  it("should preserve result order matching input order", async () => {
    const items = Array.from({ length: 10 }, (_, i) => `item${i}`);

    // Add random delays to make execution times vary
    const executeFn = vi.fn(async (item: string) => {
      const delay = Math.random() * 20;

      await new Promise((resolve) => setTimeout(resolve, delay));

      return `result-${item}`;
    });

    const caller = new ChunkCaller(items, 3, executeFn);
    const results = await caller.executeCalls();

    const expectedResults = items.map((item) => `result-${item}`);

    expect(results).toStrictEqual(expectedResults);
  });

  it("should handle large number of items", async () => {
    const items = Array.from({ length: 100 }, (_, i) => `item${i}`);
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller(items, 10, executeFn);
    const results = await caller.executeCalls();

    expect(results).toHaveLength(100);
    expect(executeFn).toHaveBeenCalledTimes(100);
    expect(results[0]).toBe("result-item0");
    expect(results[99]).toBe("result-item99");
  });

  it("should execute all items in a chunk in parallel", async () => {
    const items = ["item1", "item2", "item3"];
    const startTimes: Record<string, number> = {};
    const endTimes: Record<string, number> = {};

    const executeFn = vi.fn(async (item: string) => {
      startTimes[item] = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 50));
      endTimes[item] = Date.now();

      return `result-${item}`;
    });

    const caller = new ChunkCaller(items, 3, executeFn);

    await caller.executeCalls();

    // All items in the same chunk should start within a small time window
    const startTimeValues = Object.values(startTimes);
    const maxStartDiff = Math.max(...startTimeValues) - Math.min(...startTimeValues);

    // Allow 20ms tolerance for execution timing variance
    expect(maxStartDiff).toBeLessThan(20);
  });
});
