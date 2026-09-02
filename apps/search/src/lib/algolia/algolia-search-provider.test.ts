import { beforeEach, describe, expect, it, vi } from "vitest";

import { type ProductVariantWebhookPayloadFragment } from "../../../generated/graphql";
import { AlgoliaSearchProvider } from "./algoliaSearchProvider";

const saveObjects = vi.fn().mockResolvedValue(undefined);
const deleteObjects = vi.fn().mockResolvedValue(undefined);

vi.mock("algoliasearch", () => ({
  default: () => ({
    initIndex: () => ({ saveObjects, deleteObjects }),
  }),
}));

vi.mock("../logger", () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
}));

/**
 * Webhook payloads have no channel context, so Saleor always resolves this to 0.
 *
 * @see createVariantsAvailabilityFetcher
 */
const variant = {
  id: "variant-1",
  name: "variant name",
  trackInventory: true,
  quantityAvailable: 0,
  metadata: [],
  attributes: [],
  channelListings: [{ channel: { slug: "usd", currencyCode: "USD" } }],
  product: {
    id: "product-1",
    name: "product name",
    slug: "product-slug",
    metadata: [],
    attributes: [],
    channelListings: [{ channel: { slug: "usd", currencyCode: "USD" }, visibleInListings: true }],
  },
} as unknown as ProductVariantWebhookPayloadFragment;

/**
 * `inStock` is not part of AlgoliaRootFieldsKeys - it is always indexed and can't be toggled off
 * in the UI, so `enabledKeys` never contains it.
 */
const enabledKeys = ["attributes", "media", "categories"];

const createProvider = (fetchVariantsAvailability = vi.fn()) =>
  new AlgoliaSearchProvider({
    appId: "app-id",
    apiKey: "api-key",
    channels: [{ slug: "usd", currencyCode: "USD" }],
    enabledKeys,
    pageEnabledKeys: [],
    fetchVariantsAvailability,
  });

describe("AlgoliaSearchProvider inStock resolution", () => {
  beforeEach(() => {
    saveObjects.mockClear();
    deleteObjects.mockClear();
  });

  it("Fetches channel-scoped availability even though `inStock` is not in enabledKeys", async () => {
    const fetchVariantsAvailability = vi.fn().mockResolvedValue({ usd: { "variant-1": 7 } });

    await createProvider(fetchVariantsAvailability).updateProductVariant(variant);

    expect(fetchVariantsAvailability).toHaveBeenCalledWith({
      variantIds: ["variant-1"],
      channelSlugs: ["usd"],
    });
  });

  it("Indexes inStock: true when the channel-scoped quantity is positive", async () => {
    const fetchVariantsAvailability = vi.fn().mockResolvedValue({ usd: { "variant-1": 7 } });

    await createProvider(fetchVariantsAvailability).updateProductVariant(variant);

    expect(saveObjects).toHaveBeenCalledWith(
      [expect.objectContaining({ inStock: true })],
      expect.anything(),
    );
  });

  it("Indexes inStock: false when the channel-scoped quantity is zero", async () => {
    const fetchVariantsAvailability = vi.fn().mockResolvedValue({ usd: { "variant-1": 0 } });

    await createProvider(fetchVariantsAvailability).updateProductVariant(variant);

    expect(saveObjects).toHaveBeenCalledWith(
      [expect.objectContaining({ inStock: false })],
      expect.anything(),
    );
  });
});
