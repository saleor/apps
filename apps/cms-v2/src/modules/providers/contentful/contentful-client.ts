import { ClientAPI, createClient, Environment } from "contentful-management";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { ContentfulProviderConfig } from "@/modules/configuration";

import * as Sentry from "@sentry/nextjs";
import { createLogger } from "@/logger";

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

  constructor(opts: ConstructorOptions, clientFactory: SdkClientFactory = defaultSdkClientFactory) {
    this.space = opts.space;
    this.client = clientFactory(opts);
  }

  /**
   * Support only en-US locale now
   * todo: throw specific error if locale is not en-US
   */
  private mapVariantToConfiguredFields = (
    variant: WebhookProductVariantFragment,
    productVariantFieldsMapping: ContentfulProviderConfig.FullShape["productVariantFieldsMapping"],
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

  private getEntriesBySaleorId =
    ({
      contentId,
      env,
      variantIdFieldName,
    }: {
      env: Environment;
      contentId: string;
      variantIdFieldName: string;
    }) =>
    (saleorId: string) => {
      return env.getEntries({
        content_type: contentId,
        [`fields.${variantIdFieldName}`]: saleorId,
      });
    };

  async getContentTypes(env: string) {
    const logger = createLogger("ContentfulClient.getContentTypes", {
      space: this.space,
      env,
    });

    logger.debug("Fetching content types");

    try {
      const space = await this.client.getSpace(this.space);
      const environment = await space.getEnvironment(env);
      const contentTypes = await environment.getContentTypes();

      logger.debug("Content types fetched successfully", {
        contentTypesLength: contentTypes.items.length,
      });

      return contentTypes;
    } catch (err) {
      logger.error("Error during the fetching", { error: err });
      throw err;
    }
  }

  async getEnvironments() {
    const logger = createLogger("ContentfulClient.getEnvironments", {
      space: this.space,
    });

    logger.debug("Fetching environments");

    const space = await this.client.getSpace(this.space);
    const environments = await space.getEnvironments();

    logger.debug("Environments fetched successfully", {
      environmentsLength: environments.items.length,
    });

    return environments;
  }

  async updateProductVariant({
    configuration,
    variant,
  }: {
    configuration: ContentfulProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    const logger = createLogger("ContentfulClient.updateProductVariant", {
      space: this.space,
      variantId: variant.id,
      productId: variant.product.id,
      contentId: configuration.contentId,
      environment: configuration.environment,
    });

    logger.debug("Attempting to update product variant");

    const space = await this.client.getSpace(this.space);

    logger.debug("Space fetched successfully", { spaceName: space.name });

    const env = await space.getEnvironment(configuration.environment);

    logger.debug("Environment fetched successfully", { envName: env.name });

    const contentEntries = await this.getEntriesBySaleorId({
      contentId: configuration.contentId,
      env,
      variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
    })(variant.id);

    logger.debug("Found entries to update", {
      contentEntriesLength: contentEntries.items.length,
    });

    return Promise.all(
      contentEntries.items.map((item) => {
        item.fields = this.mapVariantToConfiguredFields(
          variant,
          configuration.productVariantFieldsMapping,
        );

        return item.update();
      }),
    );
  }

  async deleteProductVariant(opts: {
    configuration: ContentfulProviderConfig.FullShape;
    variant: Pick<WebhookProductVariantFragment, "id">;
  }) {
    const logger = createLogger("ContentfulClient.deleteProductVariant", {
      space: this.space,
      variantId: opts.variant.id,
      contentId: opts.configuration.contentId,
      environment: opts.configuration.environment,
    });

    logger.debug("Attempting to delete product variant");

    const space = await this.client.getSpace(this.space);

    logger.debug("Space fetched successfully", { spaceName: space.name });

    const env = await space.getEnvironment(opts.configuration.environment);

    logger.debug("Environment fetched successfully", { envName: env.name });

    const contentEntries = await this.getEntriesBySaleorId({
      contentId: opts.configuration.contentId,
      env,
      variantIdFieldName: opts.configuration.productVariantFieldsMapping.variantId,
    })(opts.variant.id);

    logger.debug("Found entries to delete", {
      contentEntriesLength: contentEntries.items.length,
    });

    /**
     * In general it should be only one item, but in case of duplication run through everything
     */
    return Promise.all(
      contentEntries.items.map(async (item) => {
        return item.delete();
      }),
    );
  }

  async uploadProductVariant({
    configuration,
    variant,
  }: {
    configuration: ContentfulProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    const logger = createLogger("ContentfulClient.deleteProductVariant", {
      space: this.space,
      variantId: variant.id,
      productId: variant.product.id,
      contentId: configuration.contentId,
      environment: configuration.environment,
    });

    logger.debug("Attempting to upload product variant");

    const space = await this.client.getSpace(this.space);

    logger.debug("Space fetched successfully", { spaceName: space.name });

    const env = await space.getEnvironment(configuration.environment);

    logger.debug("Environment fetched successfully", { envName: env.name });
    /*
     * TODO: add translations
     * TODO: - should it create published? is draft
     */
    return env.createEntry(configuration.contentId, {
      fields: this.mapVariantToConfiguredFields(variant, configuration.productVariantFieldsMapping),
    });
  }

  async upsertProductVariant({
    configuration,
    variant,
  }: {
    configuration: ContentfulProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    const logger = createLogger("ContentfulClient.deleteProductVariant", {
      space: this.space,
      variantId: variant.id,
      productId: variant.product.id,
      contentId: configuration.contentId,
      environment: configuration.environment,
    });

    logger.debug("Attempting to upsert product variant");

    try {
      const space = await this.client.getSpace(this.space);

      logger.debug("Space fetched successfully", { spaceName: space.name });

      const env = await space.getEnvironment(configuration.environment);

      logger.debug("Environment fetched successfully", { envName: env.name });

      const entries = await this.getEntriesBySaleorId({
        contentId: configuration.contentId,
        env,
        variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
      })(variant.id);

      logger.debug("Found entries", { entries });

      if (entries.items.length > 0) {
        logger.debug("Found existing entry, will update");
        Sentry.addBreadcrumb({
          message: "Found entry for variant",
          level: "debug",
        });

        return this.updateProductVariant({ configuration, variant });
      } else {
        logger.debug("No existing entry found, will create");
        Sentry.addBreadcrumb({
          message: "Did not found entry for variant",
          level: "debug",
        });

        return this.uploadProductVariant({ configuration, variant });
      }
    } catch (err) {
      logger.error("Error during the upsert", { error: err });
      Sentry.captureException(err);

      throw err;
    }
  }
}
