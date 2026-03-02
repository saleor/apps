import { AppProblemsReporter } from "@saleor/app-problems";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CmsProblemReporter, PROBLEM_KEYS } from "./cms-problem-reporter";

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

describe("CmsProblemReporter", () => {
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

  describe("reportProviderAuthError", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new CmsProblemReporter(mockClient);

      await reporter.reportProviderAuthError("provider-123", "contentful", "My CMS");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-provider-auth-error:provider-123",
        criticalThreshold: 1,
        message: expect.stringContaining("authentication error"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-provider-auth-error:provider-123",
        criticalThreshold: 1,
        message: expect.stringContaining('"My CMS"'),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-provider-auth-error:provider-123",
        criticalThreshold: 1,
        message: expect.stringContaining("contentful"),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new CmsProblemReporter(mockClient);

      await expect(
        reporter.reportProviderAuthError("provider-123", "contentful", "My CMS"),
      ).resolves.toBeUndefined();
    });
  });

  describe("reportBuilderIoFailure", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new CmsProblemReporter(mockClient);

      await reporter.reportBuilderIoFailure("provider-456", "Builder Config", "HTTP 500");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-builder-io-silent-failure:provider-456",
        criticalThreshold: 1,
        message: expect.stringContaining("Builder.io"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-builder-io-silent-failure:provider-456",
        criticalThreshold: 1,
        message: expect.stringContaining('"Builder Config"'),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-builder-io-silent-failure:provider-456",
        criticalThreshold: 1,
        message: expect.stringContaining("HTTP 500"),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new CmsProblemReporter(mockClient);

      await expect(
        reporter.reportBuilderIoFailure("provider-456", "Builder Config", "HTTP 500"),
      ).resolves.toBeUndefined();
    });
  });

  describe("reportFieldMismatch", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new CmsProblemReporter(mockClient);

      await reporter.reportFieldMismatch("provider-789", "Contentful Prod", "field not found");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-field-mismatch:provider-789",
        message: expect.stringContaining("field validation error"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-field-mismatch:provider-789",
        message: expect.stringContaining('"Contentful Prod"'),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-field-mismatch:provider-789",
        message: expect.stringContaining("field not found"),
      });
    });
  });

  describe("reportSyncFailure", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new CmsProblemReporter(mockClient);

      await reporter.reportSyncFailure(
        "provider-000",
        { type: "datocms", configName: "DatoCMS Prod" },
        "timeout",
      );

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-sync-failure:provider-000",
        criticalThreshold: 1,
        message: expect.stringContaining("failed to sync"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-sync-failure:provider-000",
        criticalThreshold: 1,
        message: expect.stringContaining('"DatoCMS Prod"'),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "cms-sync-failure:provider-000",
        criticalThreshold: 1,
        message: expect.stringContaining("timeout"),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new CmsProblemReporter(mockClient);

      await expect(
        reporter.reportSyncFailure(
          "provider-000",
          { type: "datocms", configName: "DatoCMS Prod" },
          "timeout",
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe("clearProblemsForProvider", () => {
    it("clears all 4 problem keys for the given providerId", async () => {
      mockClearProblems.mockResolvedValue(ok(undefined));
      const reporter = new CmsProblemReporter(mockClient);

      await reporter.clearProblemsForProvider("provider-abc");

      expect(mockClearProblems).toHaveBeenCalledWith([
        "cms-provider-auth-error:provider-abc",
        "cms-builder-io-silent-failure:provider-abc",
        "cms-field-mismatch:provider-abc",
        "cms-sync-failure:provider-abc",
      ]);
    });

    it("does not throw when clearProblems fails", async () => {
      mockClearProblems.mockResolvedValue(err(new Error("network error")));
      const reporter = new CmsProblemReporter(mockClient);

      await expect(reporter.clearProblemsForProvider("provider-abc")).resolves.toBeUndefined();
    });
  });
});

describe("PROBLEM_KEYS", () => {
  it("generates correct key patterns", () => {
    expect(PROBLEM_KEYS.providerAuthError("id1")).toBe("cms-provider-auth-error:id1");
    expect(PROBLEM_KEYS.builderIoFailure("id1")).toBe("cms-builder-io-silent-failure:id1");
    expect(PROBLEM_KEYS.fieldMismatch("id1")).toBe("cms-field-mismatch:id1");
    expect(PROBLEM_KEYS.syncFailure("id1")).toBe("cms-sync-failure:id1");
  });
});
