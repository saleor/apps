import { describe, expect, it } from "vitest";
import { AppConfig } from "./app-config";

describe("AppConfig", function () {
  describe("Construction", () => {
    it("Constructs empty state", () => {
      const instance = new AppConfig();

      expect(instance.getRootConfig()).toEqual({ channelConfig: {}, s3: null });
    });

    it("Constructs from initial state", () => {
      const instance = new AppConfig({
        s3: {
          region: "region",
          bucketName: "bucket",
          accessKeyId: "access",
          secretAccessKey: "secret",
        },
        channelConfig: {
          test: {
            storefrontUrls: {
              productStorefrontUrl: "https://example.com",
              storefrontUrl: "https://example.com/p/{productFeed}",
            },
          },
        },
      });

      expect(instance.getRootConfig()).toEqual({
        s3: {
          bucketName: "bucket",
          secretAccessKey: "secret",
          accessKeyId: "access",
          region: "region",
        },
        channelConfig: {
          test: {
            storefrontUrls: {
              productStorefrontUrl: "https://example.com",
              storefrontUrl: "https://example.com/p/{productFeed}",
            },
          },
        },
      });
    });

    it("Fails construction if invalid state provided", () => {
      expect(
        () =>
          new AppConfig({
            // @ts-expect-error
            foo: "bar",
          })
      ).toThrow();
    });

    it("Parses from string", () => {
      const instance1 = new AppConfig({
        s3: {
          region: "region",
          bucketName: "bucket",
          accessKeyId: "access",
          secretAccessKey: "secret",
        },
        channelConfig: {},
      });

      const serialized = instance1.serialize();

      const instance2 = AppConfig.parse(serialized);

      expect(instance2.getRootConfig()).toEqual({
        s3: {
          region: "region",
          bucketName: "bucket",
          accessKeyId: "access",
          secretAccessKey: "secret",
        },
        channelConfig: {},
      });
    });
  });

  describe("getters", () => {
    const instance = new AppConfig({
      s3: {
        region: "region",
        bucketName: "bucket",
        accessKeyId: "access",
        secretAccessKey: "secret",
      },
      channelConfig: {
        test: {
          storefrontUrls: {
            productStorefrontUrl: "https://example.com",
            storefrontUrl: "https://example.com/p/{productFeed}",
          },
        },
      },
    });

    it("getRootConfig returns root config data", () => {
      expect(instance.getRootConfig()).toEqual({
        s3: {
          region: "region",
          bucketName: "bucket",
          accessKeyId: "access",
          secretAccessKey: "secret",
        },
        channelConfig: {
          test: {
            storefrontUrls: {
              productStorefrontUrl: "https://example.com",
              storefrontUrl: "https://example.com/p/{productFeed}",
            },
          },
        },
      });
    });

    it("getUrlsForChannel gets data for given channel or undefined if doesnt exist", () => {
      expect(instance.getUrlsForChannel("test")).toEqual({
        productStorefrontUrl: "https://example.com",
        storefrontUrl: "https://example.com/p/{productFeed}",
      });

      expect(instance.getUrlsForChannel("not-existing")).toBeUndefined();
    });

    it("getS3Config gets s3 data", () => {
      expect(instance.getS3Config()).toEqual({
        region: "region",
        bucketName: "bucket",
        accessKeyId: "access",
        secretAccessKey: "secret",
      });
    });
  });

  describe("setters", () => {
    it("setS3 sets valid config to s3 key and rejects invalid config", () => {
      const instance = new AppConfig();

      instance.setS3({
        region: "region",
        bucketName: "bucket",
        accessKeyId: "access",
        secretAccessKey: "secret",
      });

      expect(instance.getS3Config()).toEqual({
        region: "region",
        bucketName: "bucket",
        accessKeyId: "access",
        secretAccessKey: "secret",
      });

      // @ts-expect-error
      expect(() => instance.setS3({ foo: "bar" })).toThrow();
    });

    it("setChannelUrls sets valid config to channelConfig[channelSlug] and rejects invalid config", () => {
      const instance = new AppConfig();

      instance.setChannelUrls("test", {
        productStorefrontUrl: "https://example.com",
        storefrontUrl: "https://example.com/p/{productFeed}",
      });

      expect(instance.getUrlsForChannel("test")).toEqual({
        productStorefrontUrl: "https://example.com",
        storefrontUrl: "https://example.com/p/{productFeed}",
      });

      // @ts-expect-error
      expect(() => instance.setChannelUrls("channel", "foo")).toThrow();
    });
  });

  it("Serializes to string", () => {
    const instance = new AppConfig();

    instance.setS3({
      region: "region",
      bucketName: "bucket",
      accessKeyId: "access",
      secretAccessKey: "secret",
    });

    const serialized = instance.serialize();

    /**
     * Only way to check if serialization works is to deserialize. Order of serialized fields is not given so string cant be asserted.
     * JSON.parse can be used but its testing implementation details
     */
    expect(AppConfig.parse(serialized).getS3Config()).toEqual({
      region: "region",
      bucketName: "bucket",
      accessKeyId: "access",
      secretAccessKey: "secret",
    });
  });
});
