import { createLogger, logger } from "@/logger";
import { WebhookProductFragment, WebhookProductVariantFragment } from "../../../generated/graphql";
import { ProvidersConfig } from "../configuration";
import { ProvidersResolver } from "../providers/providers-resolver";
import { WebhookContext } from "./create-webhook-config-context";
import { ProductWebhooksProcessor } from "./product-webhooks-processor";

type ProcessorFactory = (config: ProvidersConfig.AnyFullShape) => ProductWebhooksProcessor;

export class WebhooksProcessorsDelegator {
  private processorFactory: ProcessorFactory = ProvidersResolver.createWebhooksProcessor;

  constructor(
    private opts: {
      context: WebhookContext;
      injectProcessorFactory?: ProcessorFactory;
    },
  ) {
    if (opts.injectProcessorFactory) {
      this.processorFactory = opts.injectProcessorFactory;
    }
  }

  private extractChannelSlugsFromProductVariant(productVariant: WebhookProductVariantFragment) {
    return productVariant.channelListings?.map((c) => c.channel.slug);
  }

  private mapConnectionsToProcessors(
    connections: WebhookContext["connections"],
    injectedLogger: Pick<typeof logger, "error">,
  ) {
    return connections.map((conn) => {
      const providerConfig = this.opts.context.providers.find((p) => p.id === conn.providerId);

      if (!providerConfig) {
        injectedLogger.error("Cant resolve provider from connection", { connection: conn });

        throw new Error("Cant resolve provider from connection");
      }

      return this.processorFactory(providerConfig);
    });
  }

  /**
   * Will work only if variant deleted. Variant will not be deleted if product is deleted.
   * Must subscribe on new event, PRODUCT_DELETED
   * https://github.com/saleor/saleor/issues/14579
   */
  async delegateVariantCreatedOperations(productVariant: WebhookProductVariantFragment) {
    const logger = createLogger("WebhooksProcessorsDelegator.delegateVariantCreatedOperations");

    logger.debug("Calling delegate variant created operations");

    const { connections } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    logger.debug("Extracted a related channels", {
      relatedVariantChannels,
    });

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      logger.info("No related channels found for variant, skipping");

      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug),
    );

    logger.debug("Resolved a number of connections to include", {
      connectionsLength: connectionsToInclude.length,
    });

    const processors = this.mapConnectionsToProcessors(connectionsToInclude, logger);

    logger.debug("Resolved a number of processor to delegate to", {
      processorsLenght: processors.length,
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantCreated(productVariant);
      }),
    );
  }

  async delegateVariantUpdatedOperations(productVariant: WebhookProductVariantFragment) {
    const logger = createLogger("WebhooksProcessorsDelegator.delegateVariantUpdatedOperations");

    logger.debug("Calling delegate variant updated operations");

    const { connections } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    logger.debug("Extracted a related channels", {
      relatedVariantChannels,
    });

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      logger.info("No related channels found for variant, skipping");
      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug),
    );

    logger.debug("Resolved a number of connections to include", {
      connectionsLength: connectionsToInclude.length,
    });

    const processors = this.mapConnectionsToProcessors(connectionsToInclude, logger);

    logger.debug("Resolved a number of processor to delegate to", {
      processors: processors.length,
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantUpdated(productVariant);
      }),
    );
  }

  async delegateVariantDeletedOperations(productVariant: WebhookProductVariantFragment) {
    const logger = createLogger("WebhooksProcessorsDelegator.delegateVariantDeletedOperations");

    logger.debug("Calling delegate variant deleted operations");

    const { connections } = this.opts.context;

    logger.debug("Resolved a number of connections to include", {
      connectionsLength: connections.length,
    });

    const processors = this.mapConnectionsToProcessors(connections, logger);

    logger.debug("Resolved a number of processor to delegate to", {
      processorsLenght: processors.length,
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantDeleted(productVariant);
      }),
    );
  }

  async delegateProductUpdatedOperations(product: WebhookProductFragment) {
    const logger = createLogger("WebhooksProcessorsDelegator.delegateProductUpdatedOperations");

    logger.debug("Calling delegate product updated operations");

    const { connections } = this.opts.context;

    logger.debug("Resolved a number of connections to include", {
      connectionsLength: connections.length,
    });

    const processors = this.mapConnectionsToProcessors(connections, logger);

    logger.debug("Resolved a number of processor to delegate to", {
      processorsLenght: processors.length,
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductUpdated(product);
      }),
    );
  }
}
