import { Client } from "urql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AvataxForbiddenAccessError,
  AvataxGetTaxSystemError,
  AvataxInvalidCredentialsError,
} from "@/modules/taxes/tax-error";

import {
  AVATAX_PROBLEM_KEYS,
  isSaleorVersionCompatible,
  reportAvataxProblemFromError,
} from "./avatax-problem-reporter";

const mockReportProblem = vi.fn();

vi.mock("@saleor/app-problems", () => ({
  AppProblemsReporter: vi.fn().mockImplementation(() => ({
    reportProblem: mockReportProblem,
  })),
}));

function createMockClient(): Client {
  return {} as Client;
}

const COMPATIBLE_VERSION = "3.22.0";

describe("isSaleorVersionCompatible", () => {
  it("returns true for version 3.22.0", () => {
    expect(isSaleorVersionCompatible("3.22.0")).toBe(true);
  });

  it("returns true for version 3.22", () => {
    expect(isSaleorVersionCompatible("3.22")).toBe(true);
  });

  it("returns true for version 3.23.1", () => {
    expect(isSaleorVersionCompatible("3.23.1")).toBe(true);
  });

  it("returns true for version 4.0.0", () => {
    expect(isSaleorVersionCompatible("4.0.0")).toBe(true);
  });

  it("returns false for version 3.21.0", () => {
    expect(isSaleorVersionCompatible("3.21.0")).toBe(false);
  });

  it("returns false for version 3.20.4", () => {
    expect(isSaleorVersionCompatible("3.20.4")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isSaleorVersionCompatible(undefined)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isSaleorVersionCompatible(null)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isSaleorVersionCompatible("")).toBe(false);
  });

  it("returns false for invalid version string", () => {
    expect(isSaleorVersionCompatible("abc")).toBe(false);
  });
});

describe("reportAvataxProblemFromError", () => {
  beforeEach(() => {
    mockReportProblem.mockReset();
    mockReportProblem.mockResolvedValue({ isOk: () => true, mapErr: vi.fn() });
  });

  it("skips reporting when saleor version is below 3.22", async () => {
    const error = new AvataxInvalidCredentialsError("Auth failed");

    await reportAvataxProblemFromError(createMockClient(), error, "3.20.4");

    expect(mockReportProblem).not.toHaveBeenCalled();
  });

  it("skips reporting when saleor version is undefined", async () => {
    const error = new AvataxInvalidCredentialsError("Auth failed");

    await reportAvataxProblemFromError(createMockClient(), error, undefined);

    expect(mockReportProblem).not.toHaveBeenCalled();
  });

  it("reports invalid credentials for AvataxInvalidCredentialsError", async () => {
    const error = new AvataxInvalidCredentialsError("Auth failed");

    await reportAvataxProblemFromError(createMockClient(), error, COMPATIBLE_VERSION);

    expect(mockReportProblem).toHaveBeenCalledWith(
      expect.objectContaining({
        key: AVATAX_PROBLEM_KEYS.INVALID_CREDENTIALS,
        criticalThreshold: 1,
      }),
    );
  });

  it("reports forbidden access for AvataxForbiddenAccessError", async () => {
    const error = new AvataxForbiddenAccessError("PermissionRequired");

    await reportAvataxProblemFromError(createMockClient(), error, COMPATIBLE_VERSION);

    expect(mockReportProblem).toHaveBeenCalledWith(
      expect.objectContaining({
        key: AVATAX_PROBLEM_KEYS.FORBIDDEN_ACCESS,
        criticalThreshold: 1,
      }),
    );
  });

  it("reports company inactive for AvataxGetTaxSystemError with InactiveCompanyError faultSubCode", async () => {
    const error = new AvataxGetTaxSystemError("GetTaxError", {
      props: {
        faultSubCode: "InactiveCompanyError",
        description: "Company is inactive",
        message: "Error",
      },
    });

    await reportAvataxProblemFromError(createMockClient(), error, COMPATIBLE_VERSION);

    expect(mockReportProblem).toHaveBeenCalledWith(
      expect.objectContaining({
        key: AVATAX_PROBLEM_KEYS.COMPANY_INACTIVE,
        criticalThreshold: 1,
      }),
    );
  });

  it("reports company not found for AvataxGetTaxSystemError with CompanyNotFoundError faultSubCode", async () => {
    const error = new AvataxGetTaxSystemError("GetTaxError", {
      props: {
        faultSubCode: "CompanyNotFoundError",
        description: "Company not found",
        message: "Error",
      },
    });

    await reportAvataxProblemFromError(createMockClient(), error, COMPATIBLE_VERSION);

    expect(mockReportProblem).toHaveBeenCalledWith(
      expect.objectContaining({
        key: AVATAX_PROBLEM_KEYS.COMPANY_NOT_FOUND,
        criticalThreshold: 1,
      }),
    );
  });

  it("does not report for AvataxGetTaxSystemError with unrelated faultSubCode", async () => {
    const error = new AvataxGetTaxSystemError("GetTaxError", {
      props: {
        faultSubCode: "TaxRegionError",
        description: "Region error",
        message: "Error",
      },
    });

    await reportAvataxProblemFromError(createMockClient(), error, COMPATIBLE_VERSION);

    expect(mockReportProblem).not.toHaveBeenCalled();
  });

  it("does not report for unrelated errors", async () => {
    await reportAvataxProblemFromError(
      createMockClient(),
      new Error("Some random error"),
      COMPATIBLE_VERSION,
    );

    expect(mockReportProblem).not.toHaveBeenCalled();
  });

  it("does not report for undefined/null errors", async () => {
    await reportAvataxProblemFromError(createMockClient(), undefined, COMPATIBLE_VERSION);

    expect(mockReportProblem).not.toHaveBeenCalled();
  });
});
