import { describe, expect, it, vi } from "vitest";
import { CmsClientOperations } from "../types";
import { createCmsOperations } from "./clients-operations";
import { ProductVariantProviderInstancesToAlter } from "./settings";

vi.mock("../../metadata", () => ({
  createSettingsManager: () => ({}),
}));

vi.mock("./settings", () => ({
  getChannelsSettings: async () => ({}),
  getProviderInstancesSettings: async () => ({}),
  getProductVariantProviderInstancesToAlter: async () =>
    ({
      toCreate: [],
      toUpdate: [],
      toRemove: [],
    } as ProductVariantProviderInstancesToAlter),
}));

describe("CMS Clients Operations", () => {
  it("should return no creation operations when no channels to update passed and no cms to update passed", async () => {
    const cmsOperations = await createCmsOperations({
      context: {
        authData: {
          saleorApiUrl: "url",
          token: "token",
          appId: "appId",
          domain: "domain",
          jwks: "jwks",
        },
        baseUrl: "baseUrl",
        event: "event",
        payload: {
          productVariant: {
            id: "1",
            sku: "sku",
            name: "name",
            product: {
              id: "1",
              name: "name",
              slug: "slug",
              media: [
                {
                  url: "url",
                },
              ],
            },
            channelListings: [
              {
                channel: {
                  slug: "slug",
                },
              },
            ],
          },
        },
      },
      channelsToUpdate: [],
      cmsKeysToUpdate: [],
    });

    expect(cmsOperations).toEqual<CmsClientOperations[]>([]);
  });
});
