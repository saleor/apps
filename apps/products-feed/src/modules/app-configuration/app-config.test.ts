import { describe, expect, it } from "vitest";
import { AppConfig, RootConfig } from "./app-config";

const exampleChannelConfig: RootConfig["channelConfig"] = {
  test: {
    storefrontUrls: {
      productStorefrontUrl: "https://example.com",
      storefrontUrl: "https://example.com/p/{{ variant.product.slug }}",
    },
  },
};

const exampleS3Config: RootConfig["s3"] = {
  accessKeyId: "example-access-key",
  bucketName: "example-bucket-name",
  region: "eu-west-1",
  secretAccessKey: "example-secret-key",
};

const exampleAttributeMappingConfig: RootConfig["attributeMapping"] = {
  brandAttributeIds: ["brand-attribute-1"],
  colorAttributeIds: [],
  patternAttributeIds: [],
  materialAttributeIds: [],
  sizeAttributeIds: [],
  gtinAttributeIds: [],
};

const exampleTitleTemplate: RootConfig["titleTemplate"] =
  "Example {{ variant.product.name }} - {{ variant.name }}";

const exampleImageSize: RootConfig["imageSize"] = 1024;

const exampleConfiguration: RootConfig = {
  channelConfig: exampleChannelConfig,
  s3: exampleS3Config,
  attributeMapping: exampleAttributeMappingConfig,
  titleTemplate: exampleTitleTemplate,
  imageSize: exampleImageSize,
};

describe("AppConfig", function () {
  describe("Construction", () => {
    it("Constructs configuration with default values, when empty object is passed as initial data", () => {
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
          gtinAttributeIds: [],
        },
        titleTemplate: "{{variant.product.name}} - {{variant.name}}",
        imageSize: 1024,
      });
    });

    it("Constructs configuration, when valid initial state is passed", () => {
      const instance = new AppConfig(exampleConfiguration);

      expect(instance.getRootConfig()).toEqual(exampleConfiguration);
    });

    it("Fill attribute mapping, image size and title template with default values, when initial data are lacking those fields", () => {
      const configurationWithoutMapping = structuredClone(exampleConfiguration);

      // @ts-expect-error: Simulating data before the migration
      delete configurationWithoutMapping.attributeMapping;
      // @ts-expect-error
      delete configurationWithoutMapping.titleTemplate;
      // @ts-expect-error
      delete configurationWithoutMapping.imageSize;

      const instance = new AppConfig(configurationWithoutMapping as any); // Casting used to prevent TS from reporting an error

      expect(instance.getRootConfig()).toEqual({
        ...exampleConfiguration,
        attributeMapping: {
          brandAttributeIds: [],
          colorAttributeIds: [],
          patternAttributeIds: [],
          materialAttributeIds: [],
          sizeAttributeIds: [],
          gtinAttributeIds: [],
        },
        titleTemplate: "{{variant.product.name}} - {{variant.name}}",
        imageSize: 1024,
      });
    });

    it("Fails construction if invalid state provided", () => {
      expect(
        () =>
          new AppConfig({
            // @ts-expect-error
            foo: "bar",
          }),
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
          gtinAttributeIds: [],
        },
        titleTemplate: "{{ variant.name }}",
        imageSize: 1024,
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
          gtinAttributeIds: [],
        },
        titleTemplate: "{{ variant.name }}",
        imageSize: 1024,
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
        gtinAttributeIds: [],
      },
      titleTemplate: "{{ variant.product.name }} - {{ variant.name }}",
      imageSize: 1024,
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
          gtinAttributeIds: [],
        },
        titleTemplate: "{{ variant.product.name }} - {{ variant.name }}",
        imageSize: 1024,
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
        gtinAttributeIds: [],
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
      expect(() => instance.setS3({ foo: "bar" })).toThrowError();
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
      expect(() => instance.setChannelUrls("channel", "foo")).toThrowError();
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
