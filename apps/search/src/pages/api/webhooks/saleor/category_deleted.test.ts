import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AlgoliaInvalidAppIdError } from "../../../../lib/algolia/algolia-errors";
import { createSearchProblemReporter } from "../../../../modules/app-problems";
import { createWebhookContext } from "../../../../webhooks/webhook-context";
import { handler } from "./category_deleted";

vi.mock("../../../../webhooks/webhook-context", () => ({
  createWebhookContext: vi.fn(),
}));

vi.mock("../../../../lib/logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

const mockReportAuthError = vi.fn();
const mockReportInvalidAppIdAndDeactivate = vi.fn();

vi.mock("../../../../modules/app-problems", () => ({
  createSearchProblemReporter: vi.fn(() => ({
    reportAuthErrorAndDeactivate: mockReportAuthError,
    reportInvalidAppIdAndDeactivate: mockReportInvalidAppIdAndDeactivate,
  })),
}));

const mockContext = {
  event: "CATEGORY_DELETED",
  authData: {
    appId: "app-id",
    domain: "domain.saleor.io",
    token: "token",
    saleorApiUrl: "https://domain.saleor.io/graphql/",
  },
  payload: {
    __typename: "CategoryDeleted" as const,
    category: {
      id: "cat123",
    },
  },
};

describe("category_deleted webhook handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockReportAuthError.mockResolvedValue(undefined);
    mockReportInvalidAppIdAndDeactivate.mockResolvedValue(undefined);
  });

  it("Returns 200 when no category in payload", async () => {
    const { req, res } = createMocks();

    const contextWithoutCategory = {
      ...mockContext,
      payload: { __typename: "CategoryDeleted" as const, category: null },
    };

    // @ts-expect-error - mocking request for testing
    await handler(req, res, contextWithoutCategory);

    expect(res._getStatusCode()).toBe(200);
  });

  it("Returns 200 on successful delete", async () => {
    const { req, res } = createMocks();

    const mockAlgoliaClient = {
      deleteCategory: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(createWebhookContext).mockResolvedValue({
      algoliaClient: mockAlgoliaClient,
    } as any);

    // @ts-expect-error - mocking request for testing
    await handler(req, res, mockContext);

    expect(res._getStatusCode()).toBe(200);
    expect(mockAlgoliaClient.deleteCategory).toHaveBeenCalledWith("cat123");
  });

  it("Returns 500 on other Algolia errors", async () => {
    const { req, res } = createMocks();

    const otherError = new Error("Some other error");

    const mockAlgoliaClient = {
      deleteCategory: vi.fn().mockRejectedValue(otherError),
    };

    vi.mocked(createWebhookContext).mockResolvedValue({
      algoliaClient: mockAlgoliaClient,
    } as any);

    // @ts-expect-error - mocking request for testing
    await handler(req, res, mockContext);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toContain("Operation failed due to error");
  });

  it("Returns 400 when webhook context creation fails", async () => {
    const { req, res } = createMocks();

    vi.mocked(createWebhookContext).mockRejectedValue(new Error("Config error"));

    // @ts-expect-error - mocking request for testing
    await handler(req, res, mockContext);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toBe("Config error");
  });

  it("Reports auth error problem when Algolia returns 403", async () => {
    const { req, res } = createMocks();

    const authError = { status: 403, message: "Invalid Application-ID or API key" };

    const mockAlgoliaClient = {
      deleteCategory: vi.fn().mockRejectedValue(authError),
    };

    vi.mocked(createWebhookContext).mockResolvedValue({
      algoliaClient: mockAlgoliaClient,
    } as any);

    // @ts-expect-error - mocking request for testing
    await handler(req, res, mockContext);

    expect(res._getStatusCode()).toBe(401);
    expect(mockReportAuthError).toHaveBeenCalledWith("app-id");
    expect(vi.mocked(createSearchProblemReporter)).toHaveBeenCalledWith(mockContext.authData);
  });

  it("Returns 401 and deactivates app when Algolia Application ID is invalid", async () => {
    const { req, res } = createMocks();

    const mockAlgoliaClient = {
      deleteCategory: vi
        .fn()
        .mockRejectedValue(
          new AlgoliaInvalidAppIdError("Algolia Application ID does not exist or is unreachable"),
        ),
    };

    vi.mocked(createWebhookContext).mockResolvedValue({
      algoliaClient: mockAlgoliaClient,
    } as any);

    // @ts-expect-error - mocking request for testing
    await handler(req, res, mockContext);

    expect(res._getStatusCode()).toBe(401);
    expect(res._getData()).toContain("Algolia Application ID does not exist");
    expect(mockReportInvalidAppIdAndDeactivate).toHaveBeenCalledWith("app-id");
  });
});
