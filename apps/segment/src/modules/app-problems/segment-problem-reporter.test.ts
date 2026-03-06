import { AppProblemsReporter } from "@saleor/app-problems";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PROBLEM_KEYS, SegmentProblemReporter } from "./segment-problem-reporter";

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
  }),
}));

const mockReportProblem = vi.fn();
const mockClearProblems = vi.fn();

describe("SegmentProblemReporter", () => {
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

  describe("reportConfigMissing", () => {
    it("calls reportProblem with correct key, criticalThreshold, and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new SegmentProblemReporter(mockClient);

      await reporter.reportConfigMissing();

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "segment-config-missing",
        criticalThreshold: 1,
        message: expect.stringContaining("no configuration saved"),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new SegmentProblemReporter(mockClient);

      await expect(reporter.reportConfigMissing()).resolves.toBeUndefined();
    });
  });

  describe("reportTrackingFailed", () => {
    it("calls reportProblem with correct key and includes error message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new SegmentProblemReporter(mockClient);

      await reporter.reportTrackingFailed("Invalid write key");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "segment-tracking-failed",
        message: expect.stringContaining("Invalid write key"),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new SegmentProblemReporter(mockClient);

      await expect(reporter.reportTrackingFailed("some error")).resolves.toBeUndefined();
    });
  });

  describe("reportWebhooksDisabled", () => {
    it("calls reportProblem with correct key, criticalThreshold, and includes error message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new SegmentProblemReporter(mockClient);

      await reporter.reportWebhooksDisabled("Unauthorized");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "segment-webhooks-disabled",
        criticalThreshold: 1,
        message: expect.stringContaining("Unauthorized"),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new SegmentProblemReporter(mockClient);

      await expect(reporter.reportWebhooksDisabled("error")).resolves.toBeUndefined();
    });
  });

  describe("clearAllProblems", () => {
    it("clears all 3 problem keys", async () => {
      mockClearProblems.mockResolvedValue(ok(undefined));
      const reporter = new SegmentProblemReporter(mockClient);

      await reporter.clearAllProblems();

      expect(mockClearProblems).toHaveBeenCalledWith([
        "segment-config-missing",
        "segment-tracking-failed",
        "segment-webhooks-disabled",
      ]);
    });

    it("does not throw when clearProblems fails", async () => {
      mockClearProblems.mockResolvedValue(err(new Error("network error")));
      const reporter = new SegmentProblemReporter(mockClient);

      await expect(reporter.clearAllProblems()).resolves.toBeUndefined();
    });
  });
});

describe("PROBLEM_KEYS", () => {
  it("has correct static string values", () => {
    expect(PROBLEM_KEYS.configMissing).toBe("segment-config-missing");
    expect(PROBLEM_KEYS.trackingFailed).toBe("segment-tracking-failed");
    expect(PROBLEM_KEYS.webhooksDisabled).toBe("segment-webhooks-disabled");
  });
});
