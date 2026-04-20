import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AlgoliaInvalidAppIdError } from "../lib/algolia/algolia-errors";
import { handleInvalidAppIdError } from "./handle-invalid-app-id-error";

const mockReportInvalidAppIdAndDeactivate = vi.fn();

vi.mock("../modules/app-problems", () => ({
  createSearchProblemReporter: vi.fn(() => ({
    reportInvalidAppIdAndDeactivate: mockReportInvalidAppIdAndDeactivate,
  })),
}));

const authData = {
  appId: "app-id",
  domain: "domain.saleor.io",
  token: "token",
  saleorApiUrl: "https://domain.saleor.io/graphql/",
};

const logger = { warn: vi.fn() };

describe("handleInvalidAppIdError", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockReportInvalidAppIdAndDeactivate.mockResolvedValue(undefined);
  });

  it("returns false for non-AlgoliaInvalidAppIdError errors", async () => {
    const { res } = createMocks();

    const result = await handleInvalidAppIdError({
      error: new Error("some other error"),
      authData,
      res,
      logger,
    });

    expect(result).toBe(false);
    expect(logger.warn).not.toHaveBeenCalled();
    expect(mockReportInvalidAppIdAndDeactivate).not.toHaveBeenCalled();
  });

  it("returns true and sends 401 for AlgoliaInvalidAppIdError", async () => {
    const { res } = createMocks();

    const result = await handleInvalidAppIdError({
      error: new AlgoliaInvalidAppIdError("test"),
      authData,
      res,
      logger,
    });

    expect(result).toBe(true);
    expect(res._getStatusCode()).toBe(401);
    expect(res._getData()).toContain("Algolia Application ID does not exist");
  });

  it("reports problem and deactivates app", async () => {
    const { res } = createMocks();

    await handleInvalidAppIdError({
      error: new AlgoliaInvalidAppIdError("test"),
      authData,
      res,
      logger,
    });

    expect(mockReportInvalidAppIdAndDeactivate).toHaveBeenCalledWith("app-id");
  });

  it("logs a warning with the app ID", async () => {
    const { res } = createMocks();

    await handleInvalidAppIdError({
      error: new AlgoliaInvalidAppIdError("test"),
      authData,
      res,
      logger,
    });

    expect(logger.warn).toHaveBeenCalledWith(
      "Algolia Application ID does not exist, deactivating app",
      { appId: "app-id" },
    );
  });
});
