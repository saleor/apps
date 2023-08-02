import { z } from "zod";

const attributeMappingSchema = z.object({
  brandAttributeIds: z.array(z.string()),
  colorAttributeIds: z.array(z.string()),
  sizeAttributeIds: z.array(z.string()),
  materialAttributeIds: z.array(z.string()),
  patternAttributeIds: z.array(z.string()),
});

const s3ConfigSchema = z.object({
  bucketName: z.string().min(1),
  secretAccessKey: z.string().min(1),
  accessKeyId: z.string().min(1),
  region: z.string().min(1),
});

const urlConfigurationSchema = z.object({
  storefrontUrl: z.string().min(1).url(),
  productStorefrontUrl: z.string().min(1).url(),
});

const rootAppConfigSchema = z.object({
  s3: s3ConfigSchema.nullable(),
  attributeMapping: attributeMappingSchema.nullable(),
  channelConfig: z.record(z.object({ storefrontUrls: urlConfigurationSchema })),
});

export const AppConfigSchema = {
  root: rootAppConfigSchema,
  s3Bucket: s3ConfigSchema,
  channelUrls: urlConfigurationSchema,
  attributeMapping: attributeMappingSchema,
};

export type RootConfig = z.infer<typeof rootAppConfigSchema>;

export type ChannelUrlsConfig = z.infer<typeof AppConfigSchema.channelUrls>;

export class AppConfig {
  private rootData: RootConfig = {
    channelConfig: {},
    s3: null,
    attributeMapping: null,
  };

  constructor(initialData?: RootConfig) {
    if (initialData) {
      this.rootData = rootAppConfigSchema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfig(JSON.parse(serializedSchema));
  }

  getRootConfig() {
    return this.rootData;
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  setS3(s3Config: z.infer<typeof s3ConfigSchema>) {
    try {
      this.rootData.s3 = s3ConfigSchema.parse(s3Config);

      return this;
    } catch (e) {
      console.error(e);

      throw new Error("Invalid S3 config provided");
    }
  }

  setAttributeMapping(attributeMapping: z.infer<typeof attributeMappingSchema>) {
    try {
      this.rootData.attributeMapping = attributeMappingSchema.parse(attributeMapping);

      return this;
    } catch (e) {
      console.error(e);

      throw new Error("Invalid mapping config provided");
    }
  }

  setChannelUrls(channelSlug: string, urlsConfig: z.infer<typeof urlConfigurationSchema>) {
    try {
      const parsedConfig = urlConfigurationSchema.parse(urlsConfig);

      this.rootData.channelConfig[channelSlug] = {
        storefrontUrls: parsedConfig,
      };
    } catch (e) {
      console.error(e);

      throw new Error("Invalid payload");
    }
  }

  getUrlsForChannel(channelSlug: string) {
    try {
      return this.rootData.channelConfig[channelSlug].storefrontUrls;
    } catch (e) {
      return undefined;
    }
  }

  getS3Config() {
    return this.rootData.s3;
  }

  getAttributeMapping() {
    return this.rootData.attributeMapping;
  }
}
