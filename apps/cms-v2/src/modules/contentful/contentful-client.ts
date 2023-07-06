import { createClient, ClientAPI } from "contentful-management";
import { WebhookProductVariantFragment } from "../../../generated/graphql";
import { ContentfulProviderConfigSchemaType } from "./config/contentful-config";

/**
 * Wrapper facade of
 * https://www.npmjs.com/package/contentful
 *
 * todo cache space and env
 * todo tests
 * todo logs
 */
export class ContentfulClient {
  private client: ClientAPI;
  private space: string;

  constructor(opts: { space: string; accessToken: string }) {
    this.space = opts.space;

    this.client = createClient({
      accessToken: opts.accessToken,
    });
  }

  // todo error handling
  async getContentTypes(env: string) {
    return (await (await this.client.getSpace(this.space)).getEnvironment(env)).getContentTypes();
  }

  // todo connect to form, add field
  async getEnvironments() {
    return (await this.client.getSpace(this.space)).getEnvironments();
  }

  async updateProduct(opts: {
    configuration: ContentfulProviderConfigSchemaType;
    variant: WebhookProductVariantFragment;
  }) {
    const space = await this.client.getSpace(this.space);
    const env = await space.getEnvironment(opts.configuration.environment);

    const { channels, name, productId, productName, productSlug, variantId } =
      opts.configuration.productVariantFieldsMapping;

    const variant = opts.variant;

    const entry = await env.getEntry(variant.id);

    entry.fields = {
      [name]: {
        "en-US": variant.name,
      },
      [productId]: {
        "en-US": variant.product.id,
      },
      [productName]: {
        "en-US": variant.product.name,
      },
      [productSlug]: {
        "en-US": variant.product.slug,
      },
      [variantId]: {
        "en-US": variant.id,
      },
      [channels]: {
        "en-US": variant.channelListings,
      },
    };

    return entry.update();
  }

  async deleteProduct(opts: {
    configuration: ContentfulProviderConfigSchemaType;
    variant: Pick<WebhookProductVariantFragment, "id">;
  }) {
    const space = await this.client.getSpace(this.space);
    const env = await space.getEnvironment(opts.configuration.environment);

    const entry = await env.getEntry(opts.variant.id);

    console.log(entry);

    await entry.delete();
  }

  async uploadProduct(opts: {
    configuration: ContentfulProviderConfigSchemaType;
    variant: WebhookProductVariantFragment;
  }) {
    const space = await this.client.getSpace(this.space);
    const env = await space.getEnvironment(opts.configuration.environment);

    const { channels, name, productId, productName, productSlug, variantId } =
      opts.configuration.productVariantFieldsMapping;

    const variant = opts.variant;

    /*
     * todo add translations
     * todo - should it create published? is draft
     */
    return env.createEntryWithId(opts.configuration.contentId, variant.id, {
      fields: {
        [name]: {
          "en-US": variant.name,
        },
        [productId]: {
          "en-US": variant.product.id,
        },
        [productName]: {
          "en-US": variant.product.name,
        },
        [productSlug]: {
          "en-US": variant.product.slug,
        },
        [variantId]: {
          "en-US": variant.id,
        },
        [channels]: {
          "en-US": variant.channelListings,
        },
      },
    });
  }

  async upsertProduct(opts: {
    configuration: ContentfulProviderConfigSchemaType;
    variant: WebhookProductVariantFragment;
  }) {
    try {
      await this.uploadProduct(opts);
    } catch (e: unknown) {
      //@ts-ignore todo parse
      const status = JSON.parse(e.message).status;

      if (status === 409) {
        this.updateProduct(opts);
      }
    }
  }
}
