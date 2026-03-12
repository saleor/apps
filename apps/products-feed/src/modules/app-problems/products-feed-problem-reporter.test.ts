import { AppProblemsReporter } from "@saleor/app-problems";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PROBLEM_KEYS, ProductsFeedProblemReporter } from "./products-feed-problem-reporter";

vi.mock("@saleor/app-problems", () => {
  return {
    AppProblemsReporter: vi.fn(),
  };
});

vi.mock("@/logger", () => ({
  createLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  }),
}));

const mockReportProblem = vi.fn();
const mockClearProblems = vi.fn();

describe("ProductsFeedProblemReporter", () => {
  const mockClient = {} as never;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReportProblem.mockReset();
    mockClearProblems.mockReset();
    vi.mocked(AppProblemsReporter).mockImplementation(
      () =>
        ({
          reportProblem: mockReportProblem,
          clearProblems: mockClearProblems,
        }) as unknown as AppProblemsReporter,
    );
  });

  describe("reportS3UploadFailed", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new ProductsFeedProblemReporter(mockClient);

      await reporter.reportS3UploadFailed("default-channel", "Access Denied");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "feed-s3-upload-failed:default-channel",
        message: expect.stringContaining("default-channel"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "feed-s3-upload-failed:default-channel",
        message: expect.stringContaining("Access Denied"),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new ProductsFeedProblemReporter(mockClient);

      await expect(
        reporter.reportS3UploadFailed("default-channel", "Access Denied"),
      ).resolves.toBeUndefined();
    });
  });

  describe("reportEmptyProducts", () => {
    it("calls reportProblem with correct key, criticalThreshold, and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new ProductsFeedProblemReporter(mockClient);

      await reporter.reportEmptyProducts("default-channel", "Query timeout");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "feed-empty-products:default-channel",
        criticalThreshold: 1,
        message: expect.stringContaining("default-channel"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "feed-empty-products:default-channel",
        criticalThreshold: 1,
        message: expect.stringContaining("Query timeout"),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new ProductsFeedProblemReporter(mockClient);

      await expect(
        reporter.reportEmptyProducts("default-channel", "Query timeout"),
      ).resolves.toBeUndefined();
    });
  });

  describe("reportS3NotConfigured", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new ProductsFeedProblemReporter(mockClient);

      await reporter.reportS3NotConfigured("default-channel");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "feed-s3-not-configured:default-channel",
        message: expect.stringContaining("default-channel"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "feed-s3-not-configured:default-channel",
        message: expect.stringContaining("S3 bucket is not configured"),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new ProductsFeedProblemReporter(mockClient);

      await expect(reporter.reportS3NotConfigured("default-channel")).resolves.toBeUndefined();
    });
  });

  describe("clearProblemsForChannel", () => {
    it("clears all 3 problem keys for the given channel", async () => {
      mockClearProblems.mockResolvedValue(ok(undefined));
      const reporter = new ProductsFeedProblemReporter(mockClient);

      await reporter.clearProblemsForChannel("default-channel");

      expect(mockClearProblems).toHaveBeenCalledWith([
        "feed-s3-upload-failed:default-channel",
        "feed-empty-products:default-channel",
        "feed-s3-not-configured:default-channel",
      ]);
    });

    it("does not throw when clearProblems fails", async () => {
      mockClearProblems.mockResolvedValue(err(new Error("network error")));
      const reporter = new ProductsFeedProblemReporter(mockClient);

      await expect(reporter.clearProblemsForChannel("default-channel")).resolves.toBeUndefined();
    });
  });
});

describe("PROBLEM_KEYS", () => {
  it("generates correct key patterns", () => {
    expect(PROBLEM_KEYS.s3UploadFailed("ch1")).toBe("feed-s3-upload-failed:ch1");
    expect(PROBLEM_KEYS.emptyProducts("ch1")).toBe("feed-empty-products:ch1");
    expect(PROBLEM_KEYS.s3NotConfigured("ch1")).toBe("feed-s3-not-configured:ch1");
  });
});
