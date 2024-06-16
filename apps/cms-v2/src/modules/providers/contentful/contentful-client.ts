import { ClientAPI, createClient, Environment } from "contentful-management";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { ContentfulProviderConfig } from "@/modules/configuration";

import * as Sentry from "@sentry/nextjs";
import { createLogger, logger } from "@/logger";

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

  private logger: typeof logger;

  constructor(opts: ConstructorOptions, clientFactory: SdkClientFactory = defaultSdkClientFactory) {
    this.space = opts.space;
    this.client = clientFactory(opts);

    this.logger = createLogger("ContentfulClient", {
      space: this.space,
    });
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
    this.logger.trace("getContentTypes called", {
      envirment: env,
    });

    try {
      const space = await this.client.getSpace(this.space);
      const environment = await space.getEnvironment(env);
      const contentTypes = await environment.getContentTypes();

      return contentTypes;
    } catch (err) {
      this.logger.error("Failed to fetch content types", { error: err });

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
    this.logger.debug("updateProductVariant called", {
      contentId: configuration.contentId,
      environment: configuration.environment,
    });

    const space = await this.client.getSpace(this.space);

    this.logger.trace("Space fetched successfully", { spaceName: space.name });

    const env = await space.getEnvironment(configuration.environment);

    this.logger.trace("Environment fetched successfully", { envName: env.name });

    const contentEntries = await this.getEntriesBySaleorId({
      contentId: configuration.contentId,
      env,
      variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
    })(variant.id);

    this.logger.trace("Found products to update", {
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
    this.logger.debug("deleteProductVariant called", {
      contentId: opts.configuration.contentId,
      environment: opts.configuration.environment,
    });

    const space = await this.client.getSpace(this.space);

    this.logger.trace("Space fetched successfully", { spaceName: space.name });

    const env = await space.getEnvironment(opts.configuration.environment);

    this.logger.trace("Environment fetched successfully", { envName: env.name });

    const contentEntries = await this.getEntriesBySaleorId({
      contentId: opts.configuration.contentId,
      env,
      variantIdFieldName: opts.configuration.productVariantFieldsMapping.variantId,
    })(opts.variant.id);

    this.logger.trace("Found entries to delete", {
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
    this.logger.debug("uploadProductVariant called", {
      contentId: configuration.contentId,
      environment: configuration.environment,
    });

    const space = await this.client.getSpace(this.space);

    this.logger.trace("Space fetched successfully", { spaceName: space.name });

    const env = await space.getEnvironment(configuration.environment);

    this.logger.trace("Environment fetched successfully", { envName: env.name });

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
    this.logger.debug("upsertProductVariant called", {
      contentId: configuration.contentId,
      environment: configuration.environment,
    });

    try {
      const space = await this.client.getSpace(this.space);

      this.logger.trace("Space fetched successfully", { spaceName: space.name });

      const env = await space.getEnvironment(configuration.environment);

      this.logger.trace("Environment fetched successfully", { envName: env.name });

      const entries = await this.getEntriesBySaleorId({
        contentId: configuration.contentId,
        env,
        variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
      })(variant.id);

      this.logger.trace("Found entries", { entiesLength: entries.items.length });

      if (entries.items.length > 0) {
        this.logger.info("Found existing entry, will update");
        Sentry.addBreadcrumb({
          message: "Found entry for variant",
          level: "debug",
        });

        return this.updateProductVariant({ configuration, variant });
      } else {
        this.logger.info("No existing entry found, will create");
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
