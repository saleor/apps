import { createClient, ClientAPI } from "contentful-management";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { ContentfulProviderConfig } from "@/modules/configuration";
import { z } from "zod";

import * as Sentry from "@sentry/nextjs";
import { createLogger } from "@saleor/apps-shared";

const ContentfulErrorMessageSchema = z.object({
  status: z.number(),
});

type ConstructorOptions = {
  space: string;
  accessToken: string;
};

export type ContentfulApiClientChunk = Pick<ClientAPI, "getSpace">;

/**
 * Allow injecting mocked client instead of mocking whole module
 */
type SdkClientFactory = (opts: ConstructorOptions) => ContentfulApiClientChunk;

const defaultSdkClientFactory: SdkClientFactory = (opts) =>
  createClient({
    accessToken: opts.accessToken,
  });

/**
 * Wrapper facade of
 * https://www.npmjs.com/package/contentful
 */
export class ContentfulClient {
  private client: ContentfulApiClientChunk;
  private space: string;

  private logger = createLogger({ name: "ContentfulClient" });

  constructor(opts: ConstructorOptions, clientFactory: SdkClientFactory = defaultSdkClientFactory) {
    this.space = opts.space;

    this.client = clientFactory(opts);
  }

  /**
   * Support only en-US locale now
   */
  private mapVariantToConfiguredFields = (
    variant: WebhookProductVariantFragment,
    productVariantFieldsMapping: ContentfulProviderConfig.FullShape["productVariantFieldsMapping"]
  ) => {
    const {
      channels,
      variantName: name,
      productId,
      productName,
      productSlug,
      variantId,
    } = productVariantFieldsMapping;

    return {
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
  };

  async getContentTypes(env: string) {
    this.logger.trace("Attempting to get content types");

    try {
      const space = await this.client.getSpace(this.space);
      const environment = await space.getEnvironment(env);
      const contentTypes = await environment.getContentTypes();

      return contentTypes;
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  async getEnvironments() {
    this.logger.trace("Attempting to get environments");

    return (await this.client.getSpace(this.space)).getEnvironments();
  }

  async updateProductVariant({
    configuration,
    variant,
  }: {
    configuration: ContentfulProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    this.logger.debug("Attempting to update product variant");

    const space = await this.client.getSpace(this.space);
    const env = await space.getEnvironment(configuration.environment);

    const entry = await env.getEntry(variant.id);

    entry.fields = this.mapVariantToConfiguredFields(
      variant,
      configuration.productVariantFieldsMapping
    );

    return entry.update();
  }

  async deleteProductVariant(opts: {
    configuration: ContentfulProviderConfig.FullShape;
    variant: Pick<WebhookProductVariantFragment, "id">;
  }) {
    this.logger.debug("Attempting to delete product variant");

    const space = await this.client.getSpace(this.space);
    const env = await space.getEnvironment(opts.configuration.environment);

    const entry = await env.getEntry(opts.variant.id);

    return await entry.delete();
  }

  async uploadProductVariant({
    configuration,
    variant,
  }: {
    configuration: ContentfulProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    this.logger.debug("Attempting to upload product variant");

    const space = await this.client.getSpace(this.space);
    const env = await space.getEnvironment(configuration.environment);

    /*
     * TODO: add translations
     * TODO: - should it create published? is draft
     */
    return env.createEntryWithId(configuration.contentId, variant.id, {
      fields: this.mapVariantToConfiguredFields(variant, configuration.productVariantFieldsMapping),
    });
  }

  async upsertProductVariant(opts: {
    configuration: ContentfulProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    this.logger.debug("Attempting to upsert product variant");

    try {
      this.logger.trace("Attempting to upload product variant first");

      return await this.uploadProductVariant(opts);
    } catch (e: unknown) {
      this.logger.trace("Upload failed");

      if (typeof e !== "object" || e === null) {
        Sentry.captureMessage("Contentful error is not expected shape");
        Sentry.captureException(e);

        throw e;
      }

      const parsedError = ContentfulErrorMessageSchema.parse(JSON.parse((e as Error).message));

      if (parsedError.status === 409) {
        this.logger.trace("Contentful returned 409 status, will try to update instead");

        return this.updateProductVariant(opts);
      } else {
        Sentry.captureMessage("Contentful error failed and is not handled");
        throw e;
      }
    }
  }
}
