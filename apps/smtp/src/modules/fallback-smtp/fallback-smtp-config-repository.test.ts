import { beforeEach, describe, expect, it, vi } from "vitest";

import { FallbackSmtpConfigRepository } from "./fallback-smtp-config-repository";

const mockSend = vi.fn();

vi.mock("dynamodb-toolbox", () => {
  const mockBuilder = {
    key: vi.fn().mockReturnThis(),
    item: vi.fn().mockReturnThis(),
    send: (...args: unknown[]) => mockSend(...args),
  };

  return {
    Entity: vi.fn().mockImplementation(() => ({
      build: vi.fn().mockReturnValue(mockBuilder),
    })),
    GetItemCommand: "GetItemCommand",
    PutItemCommand: "PutItemCommand",
    item: vi.fn().mockReturnValue({}),
    string: vi.fn().mockReturnValue({ key: vi.fn().mockReturnValue({}) }),
    boolean: vi.fn().mockReturnValue({}),
    anyOf: vi.fn().mockReturnValue({ optional: vi.fn().mockReturnValue({}) }),
    nul: vi.fn().mockReturnValue({}),
  };
});

vi.mock("../dynamodb/dynamo-main-table", () => ({
  DynamoMainTable: {
    getPrimaryKeyScopedToSaleorApiUrl: vi.fn(
      ({ saleorApiUrl }: { saleorApiUrl: string }) => saleorApiUrl,
    ),
  },
}));

const createRepo = () =>
  new FallbackSmtpConfigRepository({
    table: {} as any,
    saleorApiUrl: "https://test.saleor.cloud/graphql/",
  });

describe("FallbackSmtpConfigRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFallbackConfig", () => {
    it("returns default enabled config when DynamoDB item does not exist", async () => {
      mockSend.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
        Item: undefined,
      });

      const repo = createRepo();
      const result = await repo.getFallbackConfig();

      expect(result._unsafeUnwrap()).toStrictEqual({
        fallbackEnabled: true,
        fallbackRedirectEmail: null,
      });
    });

    it("returns stored config when DynamoDB item exists", async () => {
      mockSend.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
        Item: {
          fallbackEnabled: false,
          fallbackRedirectEmail: "redirect@example.com",
        },
      });

      const repo = createRepo();
      const result = await repo.getFallbackConfig();

      expect(result._unsafeUnwrap()).toStrictEqual({
        fallbackEnabled: false,
        fallbackRedirectEmail: "redirect@example.com",
      });
    });

    it("returns null redirect email when not set in DynamoDB item", async () => {
      mockSend.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
        Item: {
          fallbackEnabled: true,
          fallbackRedirectEmail: undefined,
        },
      });

      const repo = createRepo();
      const result = await repo.getFallbackConfig();

      expect(result._unsafeUnwrap()).toStrictEqual({
        fallbackEnabled: true,
        fallbackRedirectEmail: null,
      });
    });

    it("returns FetchConfigError on non-200 DynamoDB response", async () => {
      mockSend.mockResolvedValue({
        $metadata: { httpStatusCode: 500 },
      });

      const repo = createRepo();
      const result = await repo.getFallbackConfig();

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        FallbackSmtpConfigRepository.FetchConfigError,
      );
    });

    it("returns FetchConfigError when DynamoDB throws", async () => {
      mockSend.mockRejectedValue(new Error("Connection refused"));

      const repo = createRepo();
      const result = await repo.getFallbackConfig();

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        FallbackSmtpConfigRepository.FetchConfigError,
      );
    });
  });

  describe("setFallbackConfig", () => {
    it("succeeds on 200 response", async () => {
      mockSend.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      const repo = createRepo();
      const result = await repo.setFallbackConfig({
        fallbackEnabled: true,
        fallbackRedirectEmail: "test@example.com",
      });

      expect(result.isOk()).toBe(true);
    });

    it("returns SaveConfigError on non-200 DynamoDB response", async () => {
      mockSend.mockResolvedValue({
        $metadata: { httpStatusCode: 500 },
      });

      const repo = createRepo();
      const result = await repo.setFallbackConfig({
        fallbackEnabled: true,
        fallbackRedirectEmail: null,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        FallbackSmtpConfigRepository.SaveConfigError,
      );
    });

    it("returns SaveConfigError when DynamoDB throws", async () => {
      mockSend.mockRejectedValue(new Error("Connection refused"));

      const repo = createRepo();
      const result = await repo.setFallbackConfig({
        fallbackEnabled: false,
        fallbackRedirectEmail: null,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        FallbackSmtpConfigRepository.SaveConfigError,
      );
    });
  });
});
