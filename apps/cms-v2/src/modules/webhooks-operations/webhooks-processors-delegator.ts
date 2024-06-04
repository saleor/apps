import { createLogger } from "@/logger";
import { WebhookProductFragment, WebhookProductVariantFragment } from "../../../generated/graphql";
import { ProvidersConfig } from "../configuration";
import { ProvidersResolver } from "../providers/providers-resolver";
import { WebhookContext } from "./create-webhook-config-context";
import { ProductWebhooksProcessor } from "./product-webhooks-processor";

type ProcessorFactory = (config: ProvidersConfig.AnyFullShape) => ProductWebhooksProcessor;

export class WebhooksProcessorsDelegator {
  private processorFactory: ProcessorFactory = ProvidersResolver.createWebhooksProcessor;
  private logger = createLogger("WebhooksProcessorsDelegator");

  constructor(
    private opts: {
      context: WebhookContext;
      injectProcessorFactory?: ProcessorFactory;
    },
  ) {
    if (opts.injectProcessorFactory) {
      this.processorFactory = opts.injectProcessorFactory;
    }

    this.logger.debug("WebhooksProcessorsDelegator created");
  }

  private extractChannelSlugsFromProductVariant(productVariant: WebhookProductVariantFragment) {
    return productVariant.channelListings?.map((c) => c.channel.slug);
  }

  private mapConnectionsToProcessors(connections: WebhookContext["connections"]) {
    return connections.map((conn) => {
      const providerConfig = this.opts.context.providers.find((p) => p.id === conn.providerId);

      if (!providerConfig) {
        this.logger.error("Cant resolve provider from connection", { connection: conn });

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
    this.logger.debug("delegateVariantCreatedOperations called");

    const { connections } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      this.logger.info("No related channels found for variant, skipping");

      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug),
    );

    this.logger.debug("Resolved a number of connections to include", {
      connections: connectionsToInclude.length,
    });

    const processors = this.mapConnectionsToProcessors(connectionsToInclude);

    this.logger.debug("Resolved a number of processor to delegate to", {
      processors: processors.length,
    });

    return Promise.all(
      processors.map((processor) => {
        this.logger.debug("Calling processor.onProductVariantCreated");

        return processor.onProductVariantCreated(productVariant);
      }),
    );
  }

  async delegateVariantUpdatedOperations(productVariant: WebhookProductVariantFragment) {
    this.logger.debug("delegateVariantUpdatedOperations called");

    const { connections } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      this.logger.info("No related channels found for variant, skipping");
      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug),
    );

    this.logger.debug("Resolved a number of connections to include", {
      connections: connectionsToInclude.length,
    });

    const processors = this.mapConnectionsToProcessors(connectionsToInclude);

    this.logger.debug("Resolved a number of processor to delegate to", {
      processors: processors.length,
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantUpdated(productVariant);
      }),
    );
  }

  async delegateVariantDeletedOperations(productVariant: WebhookProductVariantFragment) {
    this.logger.debug("delegateVariantDeletedOperations called");

    const { connections } = this.opts.context;

    this.logger.debug("Resolved a number of connections to include", {
      connections: connections.length,
    });

    const processors = this.mapConnectionsToProcessors(connections);

    this.logger.debug("Resolved a number of processor to delegate to", {
      processors: processors.length,
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantDeleted(productVariant);
      }),
    );
  }

  async delegateProductUpdatedOperations(product: WebhookProductFragment) {
    this.logger.debug("delegateProductUpdatedOperations called");

    const { connections } = this.opts.context;

    this.logger.debug("Resolved a number of connections to include", {
      connections: connections.length,
    });

    const processors = this.mapConnectionsToProcessors(connections);

    this.logger.debug("Resolved a number of processor to delegate to", {
      processors: processors.length,
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductUpdated(product);
      }),
    );
  }
}
