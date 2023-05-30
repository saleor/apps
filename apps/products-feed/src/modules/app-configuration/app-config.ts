import { z } from "zod";

const S3Config = z.object({
  bucketName: z.string().min(1),
  secretAccessKey: z.string().min(1),
  accessKeyId: z.string().min(1),
  region: z.string().min(1),
});

const UrlConfiguration = z.object({
  /**
   * min() to allow empty strings
   * todo should empty be allowed?
   */
  storefrontUrl: z.string().min(0).url(),
  productStorefrontUrl: z.string().min(0).url(),
});

const RootAppConfig = z.object({
  s3: S3Config.nullable(),
  channelConfig: z.record(z.object({ storefrontUrls: UrlConfiguration })),
});

export const AppConfigSchema = {
  root: RootAppConfig,
  s3Bucket: S3Config,
  channelUrls: UrlConfiguration,
};

export type RootConfig = z.infer<typeof RootAppConfig>;

export class AppConfig {
  private rootData: RootConfig = {
    channelConfig: {},
    s3: null,
  };

  constructor(initialData?: RootConfig) {
    if (initialData) {
      this.rootData = RootAppConfig.parse(initialData);
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

  setS3(s3Config: z.infer<typeof S3Config>) {
    try {
      this.rootData.s3 = S3Config.parse(s3Config);

      return this;
    } catch (e) {
      console.error(e);

      throw new Error("Invalid S3 config provided");
    }
  }

  setChannelUrls(channelId: string, urlsConfig: z.infer<typeof UrlConfiguration>) {
    try {
      const parsedConfig = UrlConfiguration.parse(urlsConfig);

      this.rootData.channelConfig[channelId] = {
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
}
