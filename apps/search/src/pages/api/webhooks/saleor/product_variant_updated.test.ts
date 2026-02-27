import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSearchProblemReporter } from "../../../../modules/app-problems";
import { createWebhookContext } from "../../../../webhooks/webhook-context";
import { handler } from "./product_variant_updated";

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
const mockReportRecordTooLarge = vi.fn();

vi.mock("../../../../modules/app-problems", () => ({
  createSearchProblemReporter: vi.fn(() => ({
    reportAuthError: mockReportAuthError,
    reportRecordTooLarge: mockReportRecordTooLarge,
  })),
}));

const mockContext = {
  event: "PRODUCT_VARIANT_UPDATED",
  authData: {
    appId: "app-id",
    domain: "domain.saleor.io",
    token: "token",
    saleorApiUrl: "https://domain.saleor.io/graphql/",
  },
  payload: {
    __typename: "ProductVariantUpdated" as const,
    productVariant: {
      id: "var456",
      product: {
        id: "prod123",
      },
    },
  },
};

describe("product_variant_updated webhook handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockReportAuthError.mockResolvedValue(undefined);
    mockReportRecordTooLarge.mockResolvedValue(undefined);
  });

  it("Returns 200 when no productVariant in payload", async () => {
    const { req, res } = createMocks();

    const contextWithoutVariant = {
      ...mockContext,
      payload: { __typename: "ProductVariantUpdated" as const, productVariant: null },
    };

    // @ts-expect-error - mocking request for testing
    await handler(req, res, contextWithoutVariant);

    expect(res._getStatusCode()).toBe(200);
  });

  it("Returns 200 on successful update", async () => {
    const { req, res } = createMocks();

    const mockAlgoliaClient = {
      updateProductVariant: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(createWebhookContext).mockResolvedValue({
      algoliaClient: mockAlgoliaClient,
    } as any);

    // @ts-expect-error - mocking request for testing
    await handler(req, res, mockContext);

    expect(res._getStatusCode()).toBe(200);
    expect(mockAlgoliaClient.updateProductVariant).toHaveBeenCalledWith(
      mockContext.payload.productVariant,
    );
  });

  it("Returns 413 with actionable error message including variant ID when Algolia record size limit exceeded", async () => {
    const { req, res } = createMocks();

    const recordSizeError = {
      status: 400,
      message: "Record at the position 0 objectID=prod123_var456 is too big size=15000/10000 bytes",
    };

    const mockAlgoliaClient = {
      updateProductVariant: vi.fn().mockRejectedValue(recordSizeError),
    };

    vi.mocked(createWebhookContext).mockResolvedValue({
      algoliaClient: mockAlgoliaClient,
    } as any);

    // @ts-expect-error - mocking request for testing
    await handler(req, res, mockContext);

    expect(res._getStatusCode()).toBe(413);

    const responseBody = res._getData();

    // Should include variant ID in the message
    expect(responseBody).toContain("Product variant var456");
    expect(responseBody).toContain("exceeds Algolia's record size limit");
    expect(responseBody).toContain("Current size: 15000 bytes");
    expect(responseBody).toContain("Algolia fields filtering");
    expect(responseBody).toContain("algoliaDescription");
  });

  it("Returns 500 on other Algolia errors", async () => {
    const { req, res } = createMocks();

    const otherError = new Error("Some other error");

    const mockAlgoliaClient = {
      updateProductVariant: vi.fn().mockRejectedValue(otherError),
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
    expect(res._getJSONData()).toStrictEqual({ message: "Config error" });
  });

  it("Reports auth error problem when Algolia returns 403", async () => {
    const { req, res } = createMocks();

    const authError = { status: 403, message: "Invalid Application-ID or API key" };

    const mockAlgoliaClient = {
      updateProductVariant: vi.fn().mockRejectedValue(authError),
    };

    vi.mocked(createWebhookContext).mockResolvedValue({
      algoliaClient: mockAlgoliaClient,
    } as any);

    // @ts-expect-error - mocking request for testing
    await handler(req, res, mockContext);

    expect(res._getStatusCode()).toBe(401);
    expect(mockReportAuthError).toHaveBeenCalled();
    expect(vi.mocked(createSearchProblemReporter)).toHaveBeenCalledWith(mockContext.authData);
  });

  it("Reports record too large problem when Algolia record size limit exceeded", async () => {
    const { req, res } = createMocks();

    const recordSizeError = {
      status: 400,
      message: "Record at the position 0 objectID=prod123_var456 is too big size=15000/10000 bytes",
    };

    const mockAlgoliaClient = {
      updateProductVariant: vi.fn().mockRejectedValue(recordSizeError),
    };

    vi.mocked(createWebhookContext).mockResolvedValue({
      algoliaClient: mockAlgoliaClient,
    } as any);

    // @ts-expect-error - mocking request for testing
    await handler(req, res, mockContext);

    expect(res._getStatusCode()).toBe(413);
    expect(mockReportRecordTooLarge).toHaveBeenCalledWith({
      productId: "prod123",
      variantId: "var456",
    });
    expect(vi.mocked(createSearchProblemReporter)).toHaveBeenCalledWith(mockContext.authData);
  });
});
