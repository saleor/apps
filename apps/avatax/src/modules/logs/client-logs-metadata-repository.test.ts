import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { vi, expect, it, describe } from "vitest";
import { z } from "zod";
import { ClientLogsMetadataRepository } from "./client-logs-metadata-repository";

const logSchema = z.object({
  date: z.string(),
});

let mockSettingsManager = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
} as unknown as EncryptedMetadataManager;

const logsRepository = new ClientLogsMetadataRepository({
  metadataKey: `test-logs`,
  schema: logSchema,
  settingsManager: mockSettingsManager,
  options: {
    limit: 2,
  },
});

describe("ClientLogsMetadataRepository", () => {
  it("should push logs", async () => {
    const log = {
      date: "2021-09-02",
    };

    await logsRepository.push(log);

    expect(mockSettingsManager.set).toHaveBeenCalledWith({
      key: "test-logs",
      value: JSON.stringify([log]),
    });
  });
  it("should upsert logs", async () => {
    const log = {
      date: "2021-09-02",
    };

    logsRepository.push(log);

    expect(mockSettingsManager.set).toHaveBeenCalledWith({
      key: "test-logs",
      value: JSON.stringify([log]),
    });

    const nextLog = {
      date: "2021-09-03",
    };

    await logsRepository.push(nextLog);

    expect(mockSettingsManager.set).toHaveBeenCalledWith({
      key: "test-logs",
      value: JSON.stringify([nextLog, log]),
    });
  });
  it("should remove last log when pushed log exceeds limit", async () => {
    const log = {
      date: "2021-09-02",
    };

    logsRepository.push(log);

    expect(mockSettingsManager.set).toHaveBeenCalledWith({
      key: "test-logs",
      value: JSON.stringify([log]),
    });

    const nextLog = {
      date: "2021-09-03",
    };

    logsRepository.push(nextLog);

    expect(mockSettingsManager.set).toHaveBeenCalledWith({
      key: "test-logs",
      value: JSON.stringify([nextLog, log]),
    });

    const lastLog = {
      date: "2021-09-04",
    };

    await logsRepository.push(lastLog);

    expect(mockSettingsManager.set).toHaveBeenCalledWith({
      key: "test-logs",
      value: JSON.stringify([lastLog, nextLog]),
    });
  });
  it("should return all logs", async () => {
    mockSettingsManager = {
      set: vi.fn(),
      get: vi.fn().mockReturnValueOnce(JSON.stringify([{ date: "2021-09-02" }])),
      delete: vi.fn(),
    } as unknown as EncryptedMetadataManager;

    const logsRepository = new ClientLogsMetadataRepository({
      metadataKey: `test-logs`,
      schema: logSchema,
      settingsManager: mockSettingsManager,
      options: {
        limit: 2,
      },
    });

    const logs = await logsRepository.getAll();

    expect(logs).toEqual([{ date: "2021-09-02" }]);
  });
});
