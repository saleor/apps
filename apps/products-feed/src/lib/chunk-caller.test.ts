import { describe, expect, it, vi } from "vitest";

import { ChunkCaller } from "./chunk-caller";

describe("ChunkCaller", () => {
  it("should execute all operations and return results", async () => {
    const items = ["item1", "item2", "item3"];
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller({ items, maxParallelCalls: 2, executeFn });
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

    const caller = new ChunkCaller({ items, maxParallelCalls: 2, executeFn });

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

    const caller = new ChunkCaller({ items: [], maxParallelCalls: 2, executeFn });
    const results = await caller.executeCalls();

    expect(results).toStrictEqual([]);
    expect(executeFn).not.toHaveBeenCalled();
  });

  it("should handle single item", async () => {
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller({ items: ["item1"], maxParallelCalls: 5, executeFn });
    const results = await caller.executeCalls();

    expect(results).toStrictEqual(["result-item1"]);
    expect(executeFn).toHaveBeenCalledTimes(1);
  });

  it("should handle chunk size larger than items array", async () => {
    const items = ["item1", "item2", "item3"];
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller({ items, maxParallelCalls: 10, executeFn });
    const results = await caller.executeCalls();

    expect(results).toStrictEqual(["result-item1", "result-item2", "result-item3"]);
    expect(executeFn).toHaveBeenCalledTimes(3);
  });

  it("should handle chunk size of 1", async () => {
    const items = ["item1", "item2", "item3"];
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller({ items, maxParallelCalls: 1, executeFn });
    const results = await caller.executeCalls();

    expect(results).toStrictEqual(["result-item1", "result-item2", "result-item3"]);
    expect(executeFn).toHaveBeenCalledTimes(3);
  });

  it("should handle items that divide evenly into chunks", async () => {
    const items = ["item1", "item2", "item3", "item4", "item5", "item6"];
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller({ items, maxParallelCalls: 3, executeFn });
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

    const caller = new ChunkCaller({ items, maxParallelCalls: 2, executeFn });

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

    const caller = new ChunkCaller<Result>({ items, maxParallelCalls: 2, executeFn });
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

    const caller = new ChunkCaller({ items, maxParallelCalls: 3, executeFn });
    const results = await caller.executeCalls();

    const expectedResults = items.map((item) => `result-${item}`);

    expect(results).toStrictEqual(expectedResults);
  });

  it("should handle large number of items", async () => {
    const items = Array.from({ length: 100 }, (_, i) => `item${i}`);
    const executeFn = vi.fn(async (item: string) => `result-${item}`);

    const caller = new ChunkCaller({ items, maxParallelCalls: 10, executeFn });
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

    const caller = new ChunkCaller({ items, maxParallelCalls: 3, executeFn });

    await caller.executeCalls();

    // All items in the same chunk should start within a small time window
    const startTimeValues = Object.values(startTimes);
    const maxStartDiff = Math.max(...startTimeValues) - Math.min(...startTimeValues);

    // Allow 20ms tolerance for execution timing variance
    expect(maxStartDiff).toBeLessThan(20);
  });

  it("should process chunk results when processChunkResults is provided", async () => {
    interface MetadataResult {
      id: string;
      url: string;
    }

    const items = ["item1", "item2", "item3", "item4", "item5"];
    const executeFn = vi.fn(
      async (item: string): Promise<MetadataResult> => ({
        id: item,
        url: `https://example.com/${item}`,
      }),
    );

    const processChunkResults = vi.fn(async (chunkResults: MetadataResult[]) => {
      // Simulate fetching data from URLs
      return chunkResults.map((result) => `processed-${result.id}`);
    });

    const caller = new ChunkCaller({
      items,
      maxParallelCalls: 2,
      executeFn,
      processChunkResults,
    });
    const results = await caller.executeCalls();

    // Should have processed all items
    expect(results).toStrictEqual([
      "processed-item1",
      "processed-item2",
      "processed-item3",
      "processed-item4",
      "processed-item5",
    ]);

    // Execute function should be called for each item
    expect(executeFn).toHaveBeenCalledTimes(5);

    // Process function should be called for each chunk (3 chunks: 2+2+1)
    expect(processChunkResults).toHaveBeenCalledTimes(3);

    // Verify chunk sizes
    expect(processChunkResults).toHaveBeenNthCalledWith(1, [
      { id: "item1", url: "https://example.com/item1" },
      { id: "item2", url: "https://example.com/item2" },
    ]);
    expect(processChunkResults).toHaveBeenNthCalledWith(2, [
      { id: "item3", url: "https://example.com/item3" },
      { id: "item4", url: "https://example.com/item4" },
    ]);
    expect(processChunkResults).toHaveBeenNthCalledWith(3, [
      { id: "item5", url: "https://example.com/item5" },
    ]);
  });

  it("should process chunks sequentially", async () => {
    const items = ["item1", "item2", "item3", "item4"];
    const processingOrder: string[] = [];

    const executeFn = vi.fn(async (item: string) => {
      processingOrder.push(`execute-${item}`);

      return { id: item };
    });

    const processChunkResults = vi.fn(async (chunkResults: { id: string }[]) => {
      for (const result of chunkResults) {
        processingOrder.push(`process-${result.id}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 10));

      return chunkResults.map((r) => `processed-${r.id}`);
    });

    const caller = new ChunkCaller({
      items,
      maxParallelCalls: 2,
      executeFn,
      processChunkResults,
    });

    await caller.executeCalls();

    // First chunk should be fully processed before second chunk starts
    const firstChunkProcessIndex = processingOrder.indexOf("process-item2");
    const secondChunkExecuteIndex = processingOrder.indexOf("execute-item3");

    expect(firstChunkProcessIndex).toBeLessThan(secondChunkExecuteIndex);
  });
});
