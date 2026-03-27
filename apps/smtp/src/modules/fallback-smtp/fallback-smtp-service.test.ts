import { beforeEach, describe, expect, it, vi } from "vitest";

import { FallbackSmtpService } from "./fallback-smtp-service";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

const mockGetFallbackConfig = vi.fn();
const mockSetFallbackConfig = vi.fn();

vi.mock("./fallback-smtp-config-repository", () => ({
  FallbackSmtpConfigRepository: vi.fn().mockImplementation(() => ({
    getFallbackConfig: mockGetFallbackConfig,
    setFallbackConfig: mockSetFallbackConfig,
  })),
}));

const mockGetDynamoEnv = vi.fn();

vi.mock("../../env-dynamodb", () => ({
  getDynamoEnv: (...args: unknown[]) => mockGetDynamoEnv(...args),
}));

vi.mock("../dynamodb/dynamo-main-table", () => ({
  createDynamoMainTable: vi.fn().mockReturnValue({}),
}));

const mockGetFallbackSmtpConfigSchema = vi.fn();

vi.mock("../smtp/configuration/smtp-config-schema", () => ({
  getFallbackSmtpConfigSchema: (...args: unknown[]) => mockGetFallbackSmtpConfigSchema(...args),
}));

describe("FallbackSmtpService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFallbackConfig", () => {
    it("returns error when SMTP fallback env vars are not configured", async () => {
      mockGetFallbackSmtpConfigSchema.mockReturnValue(null);

      const service = new FallbackSmtpService({
        saleorApiUrl: "https://test.saleor.cloud/graphql/",
      });
      const result = await service.getFallbackConfig();

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        FallbackSmtpService.FallbackSmtpNotAvailableError,
      );
    });

    it("returns error when DynamoDB env vars are not configured", async () => {
      mockGetFallbackSmtpConfigSchema.mockReturnValue({ smtpHost: "host" });
      mockGetDynamoEnv.mockImplementation(() => {
        throw new Error("Missing DYNAMODB_MAIN_TABLE_NAME");
      });

      const service = new FallbackSmtpService({
        saleorApiUrl: "https://test.saleor.cloud/graphql/",
      });
      const result = await service.getFallbackConfig();

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        FallbackSmtpService.FallbackSmtpNotAvailableError,
      );
    });

    it("delegates to repo when both env vars and DynamoDB are configured", async () => {
      mockGetFallbackSmtpConfigSchema.mockReturnValue({ smtpHost: "host" });
      mockGetDynamoEnv.mockReturnValue({
        DYNAMODB_MAIN_TABLE_NAME: "test-table",
        AWS_REGION: "localhost",
        AWS_ACCESS_KEY_ID: "local",
        AWS_SECRET_ACCESS_KEY: "local",
        DYNAMODB_REQUEST_TIMEOUT_MS: 5000,
        DYNAMODB_CONNECTION_TIMEOUT_MS: 2000,
      });

      const { okAsync } = await import("neverthrow");

      mockGetFallbackConfig.mockReturnValue(
        okAsync({ fallbackEnabled: true, fallbackRedirectEmail: null }),
      );

      const service = new FallbackSmtpService({
        saleorApiUrl: "https://test.saleor.cloud/graphql/",
      });
      const result = await service.getFallbackConfig();

      expect(result._unsafeUnwrap()).toStrictEqual({
        fallbackEnabled: true,
        fallbackRedirectEmail: null,
      });
    });

    it("caches the repo instance on subsequent calls", async () => {
      mockGetFallbackSmtpConfigSchema.mockReturnValue({ smtpHost: "host" });
      mockGetDynamoEnv.mockReturnValue({
        DYNAMODB_MAIN_TABLE_NAME: "test-table",
        AWS_REGION: "localhost",
        AWS_ACCESS_KEY_ID: "local",
        AWS_SECRET_ACCESS_KEY: "local",
        DYNAMODB_REQUEST_TIMEOUT_MS: 5000,
        DYNAMODB_CONNECTION_TIMEOUT_MS: 2000,
      });

      const { okAsync } = await import("neverthrow");

      mockGetFallbackConfig.mockReturnValue(
        okAsync({ fallbackEnabled: true, fallbackRedirectEmail: null }),
      );

      const service = new FallbackSmtpService({
        saleorApiUrl: "https://test.saleor.cloud/graphql/",
      });

      await service.getFallbackConfig();
      await service.getFallbackConfig();

      expect(mockGetDynamoEnv).toHaveBeenCalledTimes(1);
    });
  });

  describe("setFallbackConfig", () => {
    it("returns error when SMTP fallback env vars are not configured", async () => {
      mockGetFallbackSmtpConfigSchema.mockReturnValue(null);

      const service = new FallbackSmtpService({
        saleorApiUrl: "https://test.saleor.cloud/graphql/",
      });
      const result = await service.setFallbackConfig({
        fallbackEnabled: true,
        fallbackRedirectEmail: null,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        FallbackSmtpService.FallbackSmtpNotAvailableError,
      );
    });

    it("delegates to repo when configured", async () => {
      mockGetFallbackSmtpConfigSchema.mockReturnValue({ smtpHost: "host" });
      mockGetDynamoEnv.mockReturnValue({
        DYNAMODB_MAIN_TABLE_NAME: "test-table",
        AWS_REGION: "localhost",
        AWS_ACCESS_KEY_ID: "local",
        AWS_SECRET_ACCESS_KEY: "local",
        DYNAMODB_REQUEST_TIMEOUT_MS: 5000,
        DYNAMODB_CONNECTION_TIMEOUT_MS: 2000,
      });

      const { okAsync } = await import("neverthrow");

      mockSetFallbackConfig.mockReturnValue(okAsync(undefined));

      const service = new FallbackSmtpService({
        saleorApiUrl: "https://test.saleor.cloud/graphql/",
      });
      const result = await service.setFallbackConfig({
        fallbackEnabled: false,
        fallbackRedirectEmail: "redirect@example.com",
      });

      expect(result.isOk()).toBe(true);
      expect(mockSetFallbackConfig).toHaveBeenCalledWith({
        fallbackEnabled: false,
        fallbackRedirectEmail: "redirect@example.com",
      });
    });
  });
});
