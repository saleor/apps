import { chunkArray } from "./chunk-array";

export class ChunkCaller<T, R = T> {
  constructor(
    private params: {
      items: string[];
      maxParallelCalls: number;
      executeFn: (item: string) => Promise<T>;
      processChunkResults?: (chunkResults: T[]) => Promise<R[]>;
    },
  ) {}

  async executeCalls(): Promise<R[]> {
    const { items, processChunkResults, executeFn, maxParallelCalls } = this.params;

    const cursorChunks = chunkArray(items, maxParallelCalls);
    const results: R[] = [];

    for (const chunk of cursorChunks) {
      const chunkPromises = chunk.map(async (cursor) => {
        return executeFn(cursor);
      });

      const chunkResults = await Promise.all(chunkPromises);

      const processChunkResultsInner =
        processChunkResults ??
        async function (x: T[]): Promise<R[]> {
          // @ts-expect-error - identity function, fallback if not provided
          return x;
        };

      const processedResults = await processChunkResultsInner(chunkResults);

      results.push(...processedResults);
    }

    return results;
  }
}
