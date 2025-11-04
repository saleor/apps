import { chunkArray } from "./chunk-array";

export class ChunkCaller<T> {
  constructor(
    private items: string[],
    private maxParallelCalls: number,
    private executeFn: (item: string) => Promise<T>,
  ) {}

  async executeCalls(): Promise<T[]> {
    const cursorChunks = chunkArray(this.items, this.maxParallelCalls);
    const results: T[] = [];

    for (const chunk of cursorChunks) {
      const chunkPromises = chunk.map(async (cursor) => {
        return this.executeFn(cursor);
      });

      const chunkResults = await Promise.all(chunkPromises);

      results.push(...chunkResults);
    }

    return results;
  }
}
