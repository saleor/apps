import { describe, expect, it, vi } from "vitest";
import { GoogleFeedSettingsFetcher } from "./get-google-feed-settings";
import { AppConfig } from "../app-configuration/app-config";

describe("GoogleFeedSettingsFetcher", () => {
  it("Fetches channel-specific config with S3 config from Metadata", async () => {
    const getMetadataMock = vi.fn().mockImplementation(async () => {
      const appConfig = new AppConfig({
        channelConfig: {
          testChannel: {
            storefrontUrls: {
              storefrontUrl: "https://example.com",
              productStorefrontUrl:
                "https://example.com/p/{{ variant.product.slug }}/v/{{ variant.slug }}",
            },
          },
          anotherChannel: {
            storefrontUrls: {
              storefrontUrl: "https://another.example.com",
              productStorefrontUrl:
                "https://another.example.com/p/{{ variant.product.slug }}/v/{{ variant.slug }}",
            },
          },
        },
        s3: {
          accessKeyId: "accessKeyId",
          bucketName: "bucketName",
          region: "region",
          secretAccessKey: "secretAccessKey",
        },
        attributeMapping: null,
        titleTemplate: "{{ variant.name }}",
        imageSize: 1024,
      });

      return appConfig.serialize();
    });

    const instance = new GoogleFeedSettingsFetcher({
      settingsManager: {
        get: getMetadataMock,
      },
    });

    const result = await instance.fetch("testChannel");

    expect(result).toStrictEqual({
      storefrontUrl: "https://example.com",
      productStorefrontUrl: "https://example.com/p/{{ variant.product.slug }}/v/{{ variant.slug }}",
      s3BucketConfiguration: {
        bucketName: "bucketName",
        secretAccessKey: "secretAccessKey",
        accessKeyId: "accessKeyId",
        region: "region",
      },
      attributeMapping: null,
      titleTemplate: "{{ variant.name }}",
      imageSize: 1024,
    });
  });
});
