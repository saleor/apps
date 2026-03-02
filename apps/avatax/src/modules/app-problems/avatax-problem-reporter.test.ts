import { AppProblemsReporter } from "@saleor/app-problems";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AvataxEntityNotFoundError,
  AvataxForbiddenAccessError,
  AvataxGetTaxSystemError,
  AvataxGetTaxWrongUserInputError,
  AvataxInvalidCredentialsError,
} from "@/modules/taxes/tax-error";

import { AvataxProblemReporter, PROBLEM_KEYS } from "./avatax-problem-reporter";

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

describe("AvataxProblemReporter", () => {
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

  describe("reportInvalidCredentials", () => {
    it("calls reportProblem with correct key, threshold, and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.reportInvalidCredentials("config-123", "My Config");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-invalid-credentials:config-123",
        criticalThreshold: 1,
        message: expect.stringContaining("invalid"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-invalid-credentials:config-123",
        criticalThreshold: 1,
        message: expect.stringContaining('"My Config"'),
      });
    });

    it("does not throw when reportProblem fails", async () => {
      mockReportProblem.mockResolvedValue(err(new Error("network error")));
      const reporter = new AvataxProblemReporter(mockClient);

      await expect(
        reporter.reportInvalidCredentials("config-123", "My Config"),
      ).resolves.toBeUndefined();
    });
  });

  describe("reportForbiddenAccess", () => {
    it("calls reportProblem with correct key and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.reportForbiddenAccess("config-456", "Prod Config");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-forbidden-access:config-456",
        criticalThreshold: 1,
        message: expect.stringContaining("lack required permissions"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-forbidden-access:config-456",
        criticalThreshold: 1,
        message: expect.stringContaining('"Prod Config"'),
      });
    });
  });

  describe("reportCompanyInactive", () => {
    it("calls reportProblem with correct key, threshold, and message including company code", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.reportCompanyInactive("config-789", "Test Config", "COMPANY1");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-company-inactive:config-789",
        criticalThreshold: 1,
        message: expect.stringContaining('"COMPANY1"'),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-company-inactive:config-789",
        criticalThreshold: 1,
        message: expect.stringContaining("inactive"),
      });
    });
  });

  describe("reportCompanyNotFound", () => {
    it("calls reportProblem with correct key and message including company code", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.reportCompanyNotFound("config-000", "Config", "MISSING_CO");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-company-not-found:config-000",
        criticalThreshold: 1,
        message: expect.stringContaining('"MISSING_CO"'),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-company-not-found:config-000",
        criticalThreshold: 1,
        message: expect.stringContaining("not found"),
      });
    });
  });

  describe("reportEntityNotFound", () => {
    it("calls reportProblem with correct key, threshold, and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.reportEntityNotFound("config-111", "My Config", "CompanyCode not found");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-entity-not-found:config-111",
        criticalThreshold: 1,
        message: expect.stringContaining("Entity not found"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-entity-not-found:config-111",
        criticalThreshold: 1,
        message: expect.stringContaining('"My Config"'),
      });
    });
  });

  describe("reportChannelConfigMissing", () => {
    it("calls reportProblem with correct key, threshold, and message", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.reportChannelConfigMissing(
        "default-channel",
        "Channel references a provider configuration that no longer exists",
      );

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-channel-config-missing:default-channel",
        criticalThreshold: 1,
        message: expect.stringContaining('"default-channel"'),
      });
      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-channel-config-missing:default-channel",
        criticalThreshold: 1,
        message: expect.stringContaining("no longer exists"),
      });
    });
  });

  describe("clearChannelConfigProblem", () => {
    it("clears the channel config missing problem key", async () => {
      mockClearProblems.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.clearChannelConfigProblem("default-channel");

      expect(mockClearProblems).toHaveBeenCalledWith([
        "avatax-channel-config-missing:default-channel",
      ]);
    });

    it("does not throw when clearProblems fails", async () => {
      mockClearProblems.mockResolvedValue(err(new Error("network error")));
      const reporter = new AvataxProblemReporter(mockClient);

      await expect(reporter.clearChannelConfigProblem("default-channel")).resolves.toBeUndefined();
    });
  });

  describe("reportSuspiciousZeroTax", () => {
    it("calls reportProblem without criticalThreshold", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.reportSuspiciousZeroTax("config-111", "My Config");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-suspicious-zero-tax:config-111",
        message: expect.stringContaining("zero tax"),
      });
      expect(mockReportProblem).toHaveBeenCalledWith(
        expect.not.objectContaining({ criticalThreshold: expect.anything() }),
      );
    });
  });

  describe("reportTaxCodePermission", () => {
    it("calls reportProblem without criticalThreshold", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.reportTaxCodePermission("config-222", "Config");

      expect(mockReportProblem).toHaveBeenCalledWith({
        key: "avatax-tax-code-permission:config-222",
        message: expect.stringContaining("Not Permitted"),
      });
    });
  });

  describe("clearProblemsForConfig", () => {
    it("clears all 7 problem keys for the given configId", async () => {
      mockClearProblems.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.clearProblemsForConfig("config-abc");

      expect(mockClearProblems).toHaveBeenCalledWith([
        "avatax-invalid-credentials:config-abc",
        "avatax-forbidden-access:config-abc",
        "avatax-company-inactive:config-abc",
        "avatax-company-not-found:config-abc",
        "avatax-entity-not-found:config-abc",
        "avatax-suspicious-zero-tax:config-abc",
        "avatax-tax-code-permission:config-abc",
      ]);
    });

    it("does not throw when clearProblems fails", async () => {
      mockClearProblems.mockResolvedValue(err(new Error("network error")));
      const reporter = new AvataxProblemReporter(mockClient);

      await expect(reporter.clearProblemsForConfig("config-abc")).resolves.toBeUndefined();
    });
  });

  describe("reportApiProblem", () => {
    it("calls reportInvalidCredentials for AvataxInvalidCredentialsError", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);
      const spy = vi.spyOn(reporter, "reportInvalidCredentials");

      await reporter.reportApiProblem(new AvataxInvalidCredentialsError("auth failed"), {
        id: "config-1",
        name: "My Config",
      });

      expect(spy).toHaveBeenCalledWith("config-1", "My Config");
    });

    it("calls reportForbiddenAccess for AvataxForbiddenAccessError", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);
      const spy = vi.spyOn(reporter, "reportForbiddenAccess");

      await reporter.reportApiProblem(new AvataxForbiddenAccessError("forbidden"), {
        id: "config-2",
        name: "Prod Config",
      });

      expect(spy).toHaveBeenCalledWith("config-2", "Prod Config");
    });

    it("calls reportCompanyInactive for AvataxGetTaxSystemError with InactiveCompanyError faultSubCode", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);
      const spy = vi.spyOn(reporter, "reportCompanyInactive");

      const error = new AvataxGetTaxSystemError("system error", {
        props: {
          faultSubCode: "InactiveCompanyError",
          description: "Company is inactive",
          message: "system error",
        },
      });

      await reporter.reportApiProblem(error, {
        id: "config-3",
        name: "Config",
        companyCode: "COMPANY1",
      });

      expect(spy).toHaveBeenCalledWith("config-3", "Config", "COMPANY1");
    });

    it("calls reportCompanyNotFound for AvataxGetTaxSystemError with CompanyNotFoundError faultSubCode", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);
      const spy = vi.spyOn(reporter, "reportCompanyNotFound");

      const error = new AvataxGetTaxSystemError("system error", {
        props: {
          faultSubCode: "CompanyNotFoundError",
          description: "Company not found",
          message: "system error",
        },
      });

      await reporter.reportApiProblem(error, {
        id: "config-4",
        name: "Config",
        companyCode: "MISSING_CO",
      });

      expect(spy).toHaveBeenCalledWith("config-4", "Config", "MISSING_CO");
    });

    it("calls reportEntityNotFound for AvataxEntityNotFoundError", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);
      const spy = vi.spyOn(reporter, "reportEntityNotFound");

      const error = new AvataxEntityNotFoundError("entity not found", {
        props: { description: "CompanyCode not found" },
      });

      await reporter.reportApiProblem(error, {
        id: "config-7",
        name: "My Config",
      });

      expect(spy).toHaveBeenCalledWith("config-7", "My Config", "CompanyCode not found");
    });

    it("does not report for AvataxGetTaxWrongUserInputError", async () => {
      mockReportProblem.mockResolvedValue(ok(undefined));
      const reporter = new AvataxProblemReporter(mockClient);
      const credSpy = vi.spyOn(reporter, "reportInvalidCredentials");
      const forbidSpy = vi.spyOn(reporter, "reportForbiddenAccess");
      const inactiveSpy = vi.spyOn(reporter, "reportCompanyInactive");
      const notFoundSpy = vi.spyOn(reporter, "reportCompanyNotFound");

      await reporter.reportApiProblem(
        new AvataxGetTaxWrongUserInputError("wrong input", {
          props: { faultSubCode: "test", description: "test", message: "test" },
        }),
        { id: "config-5", name: "Config" },
      );

      expect(credSpy).not.toHaveBeenCalled();
      expect(forbidSpy).not.toHaveBeenCalled();
      expect(inactiveSpy).not.toHaveBeenCalled();
      expect(notFoundSpy).not.toHaveBeenCalled();
    });

    it("does not report for unknown error types", async () => {
      const reporter = new AvataxProblemReporter(mockClient);

      await reporter.reportApiProblem(new Error("unknown"), {
        id: "config-6",
        name: "Config",
      });

      expect(mockReportProblem).not.toHaveBeenCalled();
    });
  });
});

describe("PROBLEM_KEYS", () => {
  it("generates correct key patterns", () => {
    expect(PROBLEM_KEYS.invalidCredentials("id1")).toBe("avatax-invalid-credentials:id1");
    expect(PROBLEM_KEYS.forbiddenAccess("id1")).toBe("avatax-forbidden-access:id1");
    expect(PROBLEM_KEYS.companyInactive("id1")).toBe("avatax-company-inactive:id1");
    expect(PROBLEM_KEYS.companyNotFound("id1")).toBe("avatax-company-not-found:id1");
    expect(PROBLEM_KEYS.entityNotFound("id1")).toBe("avatax-entity-not-found:id1");
    expect(PROBLEM_KEYS.suspiciousZeroTax("id1")).toBe("avatax-suspicious-zero-tax:id1");
    expect(PROBLEM_KEYS.taxCodePermission("id1")).toBe("avatax-tax-code-permission:id1");
    expect(PROBLEM_KEYS.channelConfigMissing("default-channel")).toBe(
      "avatax-channel-config-missing:default-channel",
    );
  });
});
