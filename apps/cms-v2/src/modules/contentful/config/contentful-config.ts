import { z } from "zod";
import { randomBytes } from "crypto";
import { ProviderConfig } from "./provider-config";

// todo - validate not unique mapping fields
export const ContentfulProviderConfigSchemaInput = z.object({
  authToken: z.string(),
  spaceId: z.string(),
  environment: z.string(),
  configName: z.string(),
  contentId: z.string(),
  productVariantFieldsMapping: z.object({
    variantId: z.string().min(1),
    name: z.string().min(1),
    productId: z.string().min(1),
    productName: z.string().min(1),
    productSlug: z.string().min(1),
    channels: z.string().min(1),
  }),
});

export const ContentfulProviderConfigSchema = ContentfulProviderConfigSchemaInput.extend({
  id: z.string(),
});

export const ContentfulRootSchema = z.object({
  providers: z.array(ContentfulProviderConfigSchema),
});

export type ContentfulConfigSchemaType = z.infer<typeof ContentfulRootSchema>;
export type ContentfulProviderConfigSchemaInputType = z.infer<
  typeof ContentfulProviderConfigSchemaInput
>;
export type ContentfulProviderConfigSchemaType = z.infer<typeof ContentfulProviderConfigSchema>;

export class ContentfulConfig implements ProviderConfig<ContentfulProviderConfigSchemaType> {
  private rootData: ContentfulConfigSchemaType = {
    providers: [],
  };

  constructor(initialData?: ContentfulConfigSchemaType) {
    if (initialData) {
      this.rootData = ContentfulRootSchema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new ContentfulConfig(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  addProvider(providerConfig: ContentfulProviderConfigSchemaInputType) {
    const parsedConfig = ContentfulProviderConfigSchema.parse({
      ...providerConfig,
      id: randomBytes(8).toString("hex"),
    });

    this.rootData.providers.push(parsedConfig);

    return this;
  }

  updateProvider(providerConfig: ContentfulProviderConfigSchemaType) {
    const parsedConfig = ContentfulProviderConfigSchema.parse(providerConfig);

    this.rootData.providers = this.rootData.providers.map((p) => {
      if (p.id === parsedConfig.id) {
        return parsedConfig;
      } else {
        return p;
      }
    });

    return this;
  }

  getProviders() {
    return this.rootData.providers;
  }

  getProviderById(id: string) {
    return this.getProviders().find((p) => p.id === id);
  }
}
