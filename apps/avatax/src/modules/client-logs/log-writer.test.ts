import { after } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { type ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { DynamoDbLogWriter } from "@/modules/client-logs/log-writer";
import { type ILogsRepository } from "@/modules/client-logs/logs-repository";

vi.mock("next/server", () => ({ after: vi.fn() }));

describe("DynamoDbLogWriter", () => {
  it("Defers the write until after the response", async () => {
    const repo = { writeLog: vi.fn() } as unknown as ILogsRepository;
    const writer = new DynamoDbLogWriter(repo, {
      appId: "app-id",
      saleorApiUrl: "https://example.com/graphql/",
    });
    const log = {} as ClientLogStoreRequest;

    await writer.writeLog(log);

    expect(repo.writeLog).not.toHaveBeenCalled();

    const [task] = vi.mocked(after).mock.calls[0];

    await (task as () => Promise<unknown>)();

    expect(repo.writeLog).toHaveBeenCalledWith({
      appId: "app-id",
      saleorApiUrl: "https://example.com/graphql/",
      clientLogRequest: log,
    });
  });
});
