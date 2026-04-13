import { AppProblemsReporter } from "@saleor/app-problems";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PROBLEM_KEYS, SearchProblemReporter } from "./search-problem-reporter";

const ok = (value: unknown) => ({ isErr: () => false, value });
const err = (error: unknown) => ({ isErr: () => true, error });

vi.mock("@saleor/app-problems", () => {
  return {
    AppProblemsReporter: vi.fn(),
  };
});

vi.mock("../../lib/logger", () => ({
  createLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

const mockReportProblem = vi.fn();
const mockClearProblems = vi.fn();

const mockMutation = vi.fn();

describe("SearchProblemReporter", () => {
  const mockClient = {
    mutation: mockMutation,
  } as never;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReportProblem.mockReset();
    mockClearProblems.mockReset();
    mockMutation.mockReset();
    mockMutation.mockReturnValue({ toPromise: () => Promise.resolve({ data: {} }) });
    vi.mocked(AppProblemsReporter).mockImplementation(
      () =>
        ({
          reportProblem: mockReportProblem,
          clearProblems: mockClearProblems,
        }) as unknown as AppProblemsReporter,
    );
  });

  describe("reportAuthErrorAndDeactivate", () => {
    it("calls reportProblem with correct key and message including disabled notice", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new SearchProblemReporter(mockClient);

      await reporter.reportAuthErrorAndDeactivate("app-id");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "algolia-auth-error",
        criticalThreshold: 1,
        message:
          "Algolia API key is invalid or expired. Product indexing will fail until valid credentials are configured. Please update your Algolia credentials in the Search App settings. The app deactivation will be attempted.",
      });
    });

    it("calls appDeactivate mutation with the app ID", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new SearchProblemReporter(mockClient);

      await reporter.reportAuthErrorAndDeactivate("app-id");

      expect(mockMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          definitions: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({ value: "AppDeactivate" }),
            }),
          ]),
        }),
        { id: "app-id" },
      );
    });

    it("does not throw when reportProblem returns error result", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new SearchProblemReporter(mockClient);

      await expect(reporter.reportAuthErrorAndDeactivate("app-id")).resolves.toBeUndefined();
    });

    it("does not throw when reportProblem throws (e.g. older Saleor API)", async () => {
      mockReportProblem.mockRejectedValue(new Error("API not available"));
      const reporter = new SearchProblemReporter(mockClient);

      await expect(reporter.reportAuthErrorAndDeactivate("app-id")).resolves.toBeUndefined();
    });
  });

  describe("reportRecordTooLarge", () => {
    it("calls reportProblem with product variant context", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new SearchProblemReporter(mockClient);

      await reporter.reportRecordTooLarge({
        type: "product_variant",
        productId: "prod-123",
        variantId: "var-456",
      });

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "algolia-record-too-large",
        message: expect.stringContaining("Product variant var-456"),
      });
    });

    it("calls reportProblem with category context", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new SearchProblemReporter(mockClient);

      await reporter.reportRecordTooLarge({ type: "category", categoryId: "cat-789" });

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "algolia-record-too-large",
        message: expect.stringContaining("Category cat-789"),
      });
    });

    it("does not throw when reportProblem returns error result", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new SearchProblemReporter(mockClient);

      await expect(
        reporter.reportRecordTooLarge({
          type: "product_variant",
          productId: "prod-123",
          variantId: "var-456",
        }),
      ).resolves.toBeUndefined();
    });

    it("does not throw when reportProblem throws (e.g. older Saleor API)", async () => {
      mockReportProblem.mockRejectedValue(new Error("API not available"));
      const reporter = new SearchProblemReporter(mockClient);

      await expect(
        reporter.reportRecordTooLarge({
          type: "product_variant",
          productId: "prod-123",
          variantId: "var-456",
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe("reportIndexSetupFailed", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new SearchProblemReporter(mockClient);

      await reporter.reportIndexSetupFailed();

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "algolia-index-setup-failed",
        criticalThreshold: 1,
        message: expect.stringContaining("Failed to update Algolia index settings"),
      });
    });
  });

  describe("clearAuthProblems", () => {
    it("clears auth and index setup problem keys", async () => {
      mockClearProblems.mockResolvedValue(ok(undefined));
      const reporter = new SearchProblemReporter(mockClient);

      await reporter.clearAuthProblems();

      expect(mockClearProblems).toHaveBeenCalledWith([
        "algolia-auth-error",
        "algolia-index-setup-failed",
      ]);
    });

    it("does not throw when clearProblems returns error result", async () => {
      mockClearProblems.mockResolvedValue(err(new Error("network error")));
      const reporter = new SearchProblemReporter(mockClient);

      await expect(reporter.clearAuthProblems()).resolves.toBeUndefined();
    });

    it("does not throw when clearProblems throws (e.g. older Saleor API)", async () => {
      mockClearProblems.mockRejectedValue(new Error("API not available"));
      const reporter = new SearchProblemReporter(mockClient);

      await expect(reporter.clearAuthProblems()).resolves.toBeUndefined();
    });
  });
});

describe("PROBLEM_KEYS", () => {
  it("has correct key values", () => {
    expect(PROBLEM_KEYS.algoliaAuthError).toBe("algolia-auth-error");
    expect(PROBLEM_KEYS.algoliaRecordTooLarge).toBe("algolia-record-too-large");
    expect(PROBLEM_KEYS.algoliaIndexSetupFailed).toBe("algolia-index-setup-failed");
  });
});
