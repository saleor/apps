import { describe, expect, it } from "vitest";
import { AppConfig } from "./app-config";

describe("AppConfig", function () {
  describe("Construction", () => {
    it("Constructs empty state", () => {
      const instance = new AppConfig();

      expect(instance.getRootConfig()).toEqual({
        channelConfig: {},
        s3: null,
        attributeMapping: {
          brandAttributeIds: [],
          colorAttributeIds: [],
          patternAttributeIds: [],
          materialAttributeIds: [],
          sizeAttributeIds: [],
        },
        titleTemplate: "{{variant.product.name}} - {{variant.name}}",
      });
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
              storefrontUrl: "https://example.com/p/{{ variant.product.slug }}",
            },
          },
        },
        attributeMapping: {
          brandAttributeIds: [],
          colorAttributeIds: [],
          patternAttributeIds: [],
          materialAttributeIds: [],
          sizeAttributeIds: [],
        },
        titleTemplate: "{{ variant.name }}",
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
              storefrontUrl: "https://example.com/p/{{ variant.product.slug }}",
            },
          },
        },
        attributeMapping: {
          brandAttributeIds: [],
          colorAttributeIds: [],
          patternAttributeIds: [],
          materialAttributeIds: [],
          sizeAttributeIds: [],
        },
        titleTemplate: "{{ variant.name }}",
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
        attributeMapping: {
          brandAttributeIds: [],
          colorAttributeIds: [],
          patternAttributeIds: [],
          materialAttributeIds: [],
          sizeAttributeIds: [],
        },
        titleTemplate: "{{ variant.name }}",
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
        attributeMapping: {
          brandAttributeIds: [],
          colorAttributeIds: [],
          patternAttributeIds: [],
          materialAttributeIds: [],
          sizeAttributeIds: [],
        },
        titleTemplate: "{{ variant.name }}",
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
            storefrontUrl: "https://example.com/p/{{ variant.product.slug }}",
          },
        },
      },
      attributeMapping: {
        brandAttributeIds: [],
        colorAttributeIds: [],
        patternAttributeIds: [],
        materialAttributeIds: [],
        sizeAttributeIds: ["size-id"],
      },
      titleTemplate: "{{ variant.product.name }} - {{ variant.name }}",
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
              storefrontUrl: "https://example.com/p/{{ variant.product.slug }}",
            },
          },
        },
        attributeMapping: {
          brandAttributeIds: [],
          colorAttributeIds: [],
          patternAttributeIds: [],
          materialAttributeIds: [],
          sizeAttributeIds: ["size-id"],
        },
        titleTemplate: "{{ variant.product.name }} - {{ variant.name }}",
      });
    });

    it("getUrlsForChannel gets data for given channel or undefined if doesn't exist", () => {
      expect(instance.getUrlsForChannel("test")).toEqual({
        productStorefrontUrl: "https://example.com",
        storefrontUrl: "https://example.com/p/{{ variant.product.slug }}",
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

    it("getAttributeMapping gets attribute data", () => {
      expect(instance.getAttributeMapping()).toEqual({
        brandAttributeIds: [],
        colorAttributeIds: [],
        patternAttributeIds: [],
        materialAttributeIds: [],
        sizeAttributeIds: ["size-id"],
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
        storefrontUrl: "https://example.com/p/{{ variant.product.slug }}",
      });

      expect(instance.getUrlsForChannel("test")).toEqual({
        productStorefrontUrl: "https://example.com",
        storefrontUrl: "https://example.com/p/{{ variant.product.slug }}",
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
