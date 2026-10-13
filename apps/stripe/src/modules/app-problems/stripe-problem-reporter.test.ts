import { AppProblemsReporter } from "@saleor/app-problems";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  StripeAPIError,
  StripeAuthenticationError,
  StripeCardError,
  StripePermissionError,
} from "@/modules/stripe/stripe-api-error";

import { PROBLEM_KEYS, StripeProblemReporter } from "./stripe-problem-reporter";

vi.mock("@saleor/app-problems", () => {
  return {
    AppProblemsReporter: vi.fn(),
  };
});

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

const mockReportProblem = vi.fn();
const mockClearProblems = vi.fn();

describe("StripeProblemReporter", () => {
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

  describe("reportAuthFailure", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);

      await reporter.reportAuthFailure("config-123", "My Config");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "stripe-auth-failure:config-123",
        criticalThreshold: 1,
        message: expect.stringContaining("invalid or expired"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "stripe-auth-failure:config-123",
        criticalThreshold: 1,
        message: expect.stringContaining('"My Config"'),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new StripeProblemReporter(mockClient);

      await expect(reporter.reportAuthFailure("config-123", "My Config")).resolves.toBeUndefined();
    });
  });

  describe("reportPermissionError", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);

      await reporter.reportPermissionError("config-456", "Prod Config");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "stripe-permission-error:config-456",
        criticalThreshold: 1,
        message: expect.stringContaining("lacks required permissions"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "stripe-permission-error:config-456",
        criticalThreshold: 1,
        message: expect.stringContaining('"Prod Config"'),
      });
    });
  });

  describe("reportWebhookSecretMismatch", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);

      await reporter.reportWebhookSecretMismatch("config-789", "Test Config");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "stripe-webhook-secret-mismatch:config-789",
        criticalThreshold: 1,
        message: expect.stringContaining("Webhook signature verification failed"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "stripe-webhook-secret-mismatch:config-789",
        criticalThreshold: 1,
        message: expect.stringContaining('"Test Config"'),
      });
    });
  });

  describe("reportConfigMissing", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);

      await reporter.reportConfigMissing("config-000");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "stripe-config-missing:config-000",
        criticalThreshold: 1,
        message: expect.stringContaining("no matching configuration was found"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "stripe-config-missing:config-000",
        criticalThreshold: 1,
        message: expect.stringContaining('"config-000"'),
      });
    });
  });

  describe("reportLegacyWebhookOrphaned", () => {
    it("reports non-critical problem grouped per 24h", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);

      await reporter.reportLegacyWebhookOrphaned("config-old");

      expect(mockReportProblem).toHaveBeenCalledExactlyOnceWith({
        key: "stripe-legacy-webhook-orphaned:config-old",
        aggregationPeriod: 1440,
        message: expect.stringContaining('"config-old"'),
      });
    });
  });

  describe("reportObjectFromDifferentInstallation", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);

      await reporter.reportObjectFromDifferentInstallation("config-222", "My Config");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "stripe-object-from-different-installation:config-222",
        message: expect.stringContaining(
          'payments created by a different Saleor environment to configuration "My Config"',
        ),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new StripeProblemReporter(mockClient);

      await expect(
        reporter.reportObjectFromDifferentInstallation("config-222", "My Config"),
      ).resolves.toBeUndefined();
    });
  });

  describe("clearProblemsForConfig", () => {
    it("clears all problem keys for the given configId", async () => {
      mockClearProblems.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);

      await reporter.clearProblemsForConfig("config-abc");

      expect(mockClearProblems).toHaveBeenCalledWith([
        "stripe-auth-failure:config-abc",
        "stripe-permission-error:config-abc",
        "stripe-webhook-secret-mismatch:config-abc",
        "stripe-config-missing:config-abc",
        "stripe-object-from-different-installation:config-abc",
      ]);
    });

    it("does not throw when clearProblems fails", async () => {
      mockClearProblems.mockResolvedValue(err(new Error("network error")));
      const reporter = new StripeProblemReporter(mockClient);

      await expect(reporter.clearProblemsForConfig("config-abc")).resolves.toBeUndefined();
    });
  });

  describe("reportApiProblem", () => {
    it("calls reportAuthFailure for StripeAuthenticationError", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);
      const spy = vi.spyOn(reporter, "reportAuthFailure");

      await reporter.reportApiProblem(new StripeAuthenticationError("auth failed"), {
        id: "config-1",
        name: "My Config",
      });

      expect(spy).toHaveBeenCalledWith("config-1", "My Config");
    });

    it("calls reportPermissionError for StripePermissionError", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);
      const spy = vi.spyOn(reporter, "reportPermissionError");

      await reporter.reportApiProblem(new StripePermissionError("permission denied"), {
        id: "config-2",
        name: "Prod Config",
      });

      expect(spy).toHaveBeenCalledWith("config-2", "Prod Config");
    });

    it("does not report for StripeCardError", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);
      const authSpy = vi.spyOn(reporter, "reportAuthFailure");
      const permSpy = vi.spyOn(reporter, "reportPermissionError");

      await reporter.reportApiProblem(new StripeCardError("card declined"), {
        id: "config-3",
        name: "Config",
      });

      expect(authSpy).not.toHaveBeenCalled();
      expect(permSpy).not.toHaveBeenCalled();
    });

    it("does not report for other error types", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new StripeProblemReporter(mockClient);
      const authSpy = vi.spyOn(reporter, "reportAuthFailure");
      const permSpy = vi.spyOn(reporter, "reportPermissionError");

      await reporter.reportApiProblem(new StripeAPIError("api error"), {
        id: "config-4",
        name: "Config",
      });

      expect(authSpy).not.toHaveBeenCalled();
      expect(permSpy).not.toHaveBeenCalled();
    });
  });
});

describe("PROBLEM_KEYS", () => {
  it("generates correct key patterns", () => {
    expect(PROBLEM_KEYS.authFailure("id1")).toBe("stripe-auth-failure:id1");
    expect(PROBLEM_KEYS.permissionError("id1")).toBe("stripe-permission-error:id1");
    expect(PROBLEM_KEYS.webhookSecretMismatch("id1")).toBe("stripe-webhook-secret-mismatch:id1");
    expect(PROBLEM_KEYS.configMissing("id1")).toBe("stripe-config-missing:id1");
    expect(PROBLEM_KEYS.objectFromDifferentInstallation("id1")).toBe(
      "stripe-object-from-different-installation:id1",
    );
  });
});
