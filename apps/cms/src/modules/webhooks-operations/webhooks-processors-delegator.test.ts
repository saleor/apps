import { beforeEach, describe, expect, it, vi } from "vitest";

import { type CmsProblemReporter } from "@/modules/app-problems/cms-problem-reporter";

import { type WebhookProductVariantFragment } from "../../../generated/graphql";
import {
  AppConfig,
  type ContentfulProviderConfig,
  type DatocmsProviderConfig,
} from "../configuration";
import { type ProductWebhooksProcessor } from "./product-webhooks-processor";
import { classifyError, WebhooksProcessorsDelegator } from "./webhooks-processors-delegator";

const getMockContentfulInput = (): ContentfulProviderConfig.InputShape => {
  return {
    configName: "Test",
    type: "contentful",
    contentId: "test",
    authToken: "test",
    environment: "test",
    productVariantFieldsMapping: {
      channels: "channels",
      productId: "productId",
      productName: "productName",
      productSlug: "productSlug",
      variantId: "variantId",
      variantName: "variantName",
      sku: "sku",
    },
    spaceId: "test",
  };
};

const getMockDatocmsInput = (): DatocmsProviderConfig.InputShape => {
  return {
    configName: "Test",
    type: "datocms",
    itemType: "test",
    authToken: "test",
    productVariantFieldsMapping: {
      channels: "channels",
      productId: "productId",
      productName: "productName",
      productSlug: "productSlug",
      variantId: "variantId",
      variantName: "variantName",
      sku: "sku",
    },
  };
};

const mockWebookProcessor: ProductWebhooksProcessor = {
  onProductUpdated: vi.fn(),
  onProductVariantCreated: vi.fn(),
  onProductVariantDeleted: vi.fn(),
  onProductVariantUpdated: vi.fn(),
};

const prepareFilledAppConfig = () => {
  const appConfig = new AppConfig();

  appConfig.providers.addProvider(getMockContentfulInput());
  appConfig.providers.addProvider(getMockDatocmsInput());

  appConfig.connections.addConnection({
    providerId: appConfig.providers.getProviders()[0].id,
    channelSlug: "test",
    providerType: "contentful",
  });

  appConfig.connections.addConnection({
    providerId: appConfig.providers.getProviders()[1].id,
    channelSlug: "test",
    providerType: "contentful",
  });

  /**
   * This one will be ignored by delegator for update and created, because mocks are set for slug "test"
   */
  appConfig.connections.addConnection({
    providerId: appConfig.providers.getProviders()[1].id,
    channelSlug: "test-2",
    providerType: "contentful",
  });

  return appConfig;
};

const getMockProductVariantWebhookFragment = (): WebhookProductVariantFragment => {
  return {
    id: "variant-id",
    name: "variant-name",
    sku: "test-sku",
    product: {
      id: "product-id",
      name: "product-name",
      slug: "product-slug",
    },
    channelListings: [
      {
        channel: {
          id: "channel-id",
          slug: "test",
        },
      },
    ],
  };
};

const createMockProblemReporter = () =>
  ({
    reportProviderAuthError: vi.fn().mockResolvedValue(undefined),
    reportBuilderIoFailure: vi.fn().mockResolvedValue(undefined),
    reportFieldMismatch: vi.fn().mockResolvedValue(undefined),
    reportSyncFailure: vi.fn().mockResolvedValue(undefined),
    clearProblemsForProvider: vi.fn().mockResolvedValue(undefined),
  }) as unknown as CmsProblemReporter;

describe("WebhooksProcessorsDelegator", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Variant Created Operations", () => {
    it("Calls processor CREATE method every for every connection that matches channel slug", async () => {
      const appConfig = prepareFilledAppConfig();

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => mockWebookProcessor,
        context: {
          connections: appConfig.connections.getConnections(),
          providers: appConfig.providers.getProviders(),
        },
      });

      await delegator.delegateVariantCreatedOperations(getMockProductVariantWebhookFragment());

      expect(mockWebookProcessor.onProductVariantCreated).toHaveBeenCalledTimes(2);
    });
  });

  describe("Variant Updated Operations", () => {
    it("Calls processor UPDATE method every for every connection that matches channel slug", async () => {
      const appConfig = prepareFilledAppConfig();

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => mockWebookProcessor,
        context: {
          connections: appConfig.connections.getConnections(),
          providers: appConfig.providers.getProviders(),
        },
      });

      await delegator.delegateVariantUpdatedOperations(getMockProductVariantWebhookFragment());

      expect(mockWebookProcessor.onProductVariantUpdated).toHaveBeenCalledTimes(2);
    });
  });

  describe("Variant Deleted Operations", () => {
    it("Calls processor DELETE method for every connection, even if channel slug does not match, so CMS is not left with orphans", async () => {
      const appConfig = prepareFilledAppConfig();

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => mockWebookProcessor,
        context: {
          connections: appConfig.connections.getConnections(),
          providers: appConfig.providers.getProviders(),
        },
      });

      await delegator.delegateVariantDeletedOperations(getMockProductVariantWebhookFragment());

      /**
       * Will be called 3 times
       */
      expect(mockWebookProcessor.onProductVariantDeleted).toHaveBeenCalledTimes(3);
    });
  });

  describe("Product Updated Operations", () => {
    it("Calls processor UPDATE PRODUCT method for every connection, even if channel slug does not match, so CMS is not left with orphans", async () => {
      const appConfig = prepareFilledAppConfig();

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => mockWebookProcessor,
        context: {
          connections: appConfig.connections.getConnections(),
          providers: appConfig.providers.getProviders(),
        },
      });

      await delegator.delegateProductUpdatedOperations({
        id: "product-id",
        name: "product-name",
        slug: "product-slug",
        channelListings: [
          {
            channel: {
              id: "channel-id",
              slug: "test",
            },
            id: "channel-listing-id",
          },
        ],
        variants: [
          {
            id: "variant-id",
            name: "variant-name",
          },
        ],
      });

      /**
       * Will be called 3 times
       */
      expect(mockWebookProcessor.onProductUpdated).toHaveBeenCalledTimes(3);
    });
  });

  describe("Problem reporting", () => {
    it("reports problem when processor throws an error", async () => {
      const appConfig = prepareFilledAppConfig();
      const mockReporter = createMockProblemReporter();

      const failingProcessor: ProductWebhooksProcessor = {
        onProductUpdated: vi.fn(),
        onProductVariantCreated: vi.fn().mockRejectedValue(new Error("connection timeout")),
        onProductVariantDeleted: vi.fn(),
        onProductVariantUpdated: vi.fn(),
      };

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => failingProcessor,
        problemReporter: mockReporter,
        context: {
          connections: appConfig.connections
            .getConnections()
            .filter((c) => c.channelSlug === "test"),
          providers: appConfig.providers.getProviders(),
        },
      });

      await expect(
        delegator.delegateVariantCreatedOperations(getMockProductVariantWebhookFragment()),
      ).rejects.toThrow("connection timeout");

      expect(mockReporter.reportSyncFailure).toHaveBeenCalled();
    });

    it("reports auth error for 401 status", async () => {
      const appConfig = prepareFilledAppConfig();
      const mockReporter = createMockProblemReporter();

      const failingProcessor: ProductWebhooksProcessor = {
        onProductUpdated: vi.fn(),
        onProductVariantCreated: vi.fn(),
        onProductVariantDeleted: vi.fn(),
        onProductVariantUpdated: vi.fn().mockRejectedValue(new Error("HTTP 401: Unauthorized")),
      };

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => failingProcessor,
        problemReporter: mockReporter,
        context: {
          connections: appConfig.connections
            .getConnections()
            .filter((c) => c.channelSlug === "test"),
          providers: appConfig.providers.getProviders(),
        },
      });

      await expect(
        delegator.delegateVariantUpdatedOperations(getMockProductVariantWebhookFragment()),
      ).rejects.toThrow();

      expect(mockReporter.reportProviderAuthError).toHaveBeenCalled();
    });

    it("clears problems on successful processing", async () => {
      const appConfig = prepareFilledAppConfig();
      const mockReporter = createMockProblemReporter();

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => mockWebookProcessor,
        problemReporter: mockReporter,
        context: {
          connections: appConfig.connections
            .getConnections()
            .filter((c) => c.channelSlug === "test"),
          providers: appConfig.providers.getProviders(),
        },
      });

      await delegator.delegateVariantCreatedOperations(getMockProductVariantWebhookFragment());

      expect(mockReporter.clearProblemsForProvider).toHaveBeenCalled();
    });

    it("re-throws error after reporting problem", async () => {
      const appConfig = prepareFilledAppConfig();
      const mockReporter = createMockProblemReporter();

      const failingProcessor: ProductWebhooksProcessor = {
        onProductUpdated: vi.fn(),
        onProductVariantCreated: vi.fn(),
        onProductVariantDeleted: vi.fn().mockRejectedValue(new Error("delete failed")),
        onProductVariantUpdated: vi.fn(),
      };

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => failingProcessor,
        problemReporter: mockReporter,
        context: {
          connections: appConfig.connections.getConnections(),
          providers: appConfig.providers.getProviders(),
        },
      });

      await expect(
        delegator.delegateVariantDeletedOperations(getMockProductVariantWebhookFragment()),
      ).rejects.toThrow("delete failed");
    });

    it("works without problemReporter (backward compatibility)", async () => {
      const appConfig = prepareFilledAppConfig();

      const failingProcessor: ProductWebhooksProcessor = {
        onProductUpdated: vi.fn(),
        onProductVariantCreated: vi.fn().mockRejectedValue(new Error("some error")),
        onProductVariantDeleted: vi.fn(),
        onProductVariantUpdated: vi.fn(),
      };

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => failingProcessor,
        context: {
          connections: appConfig.connections
            .getConnections()
            .filter((c) => c.channelSlug === "test"),
          providers: appConfig.providers.getProviders(),
        },
      });

      await expect(
        delegator.delegateVariantCreatedOperations(getMockProductVariantWebhookFragment()),
      ).rejects.toThrow("some error");
    });
  });
});

describe("classifyError", () => {
  it("classifies 401 as auth error", () => {
    expect(classifyError(new Error("HTTP 401: Unauthorized"), "contentful")).toBe("auth");
  });

  it("classifies 403 as auth error", () => {
    expect(classifyError(new Error("HTTP 403: Forbidden"), "datocms")).toBe("auth");
  });

  it("classifies 'unauthorized' message as auth error", () => {
    expect(classifyError(new Error("unauthorized access"), "contentful")).toBe("auth");
  });

  it("classifies 'authentication' message as auth error", () => {
    expect(classifyError(new Error("Authentication failed"), "builder.io")).toBe("auth");
  });

  it("classifies 'access token' message as auth error", () => {
    expect(classifyError(new Error("invalid access token"), "contentful")).toBe("auth");
  });

  it("classifies builder.io non-auth error as builder-io-failure", () => {
    expect(classifyError(new Error("HTTP 500: Internal Server Error"), "builder.io")).toBe(
      "builder-io-failure",
    );
  });

  it("classifies contentful 422 as field-mismatch", () => {
    expect(classifyError(new Error("HTTP 422: Unprocessable Entity"), "contentful")).toBe(
      "field-mismatch",
    );
  });

  it("classifies contentful validation error as field-mismatch", () => {
    expect(classifyError(new Error("Validation failed for field"), "contentful")).toBe(
      "field-mismatch",
    );
  });

  it("classifies other errors as sync-failure", () => {
    expect(classifyError(new Error("connection timeout"), "contentful")).toBe("sync-failure");
  });

  it("classifies non-Error values as sync-failure", () => {
    expect(classifyError("string error", "datocms")).toBe("sync-failure");
  });
});
