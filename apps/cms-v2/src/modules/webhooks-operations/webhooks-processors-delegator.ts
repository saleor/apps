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
    }
  ) {
    if (opts.injectProcessorFactory) {
      this.processorFactory = opts.injectProcessorFactory;
    }
  }

  private extractChannelSlugsFromProductVariant(productVariant: WebhookProductVariantFragment) {
    return productVariant.channelListings?.map((c) => c.channel.slug);
  }

  private mapConnectionsToProcessors(connections: WebhookContext["connections"]) {
    return connections.map((conn) => {
      const providerConfig = this.opts.context.providers.find((p) => p.id === conn.providerId)!;

      return this.processorFactory(providerConfig);
    });
  }

  async delegateVariantCreatedOperations(productVariant: WebhookProductVariantFragment) {
    const { connections } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug)
    );

    const processors = this.mapConnectionsToProcessors(connectionsToInclude);

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantCreated(productVariant);
      })
    );
  }

  async delegateVariantUpdatedOperations(productVariant: WebhookProductVariantFragment) {
    const { connections } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug)
    );

    const processors = this.mapConnectionsToProcessors(connectionsToInclude);

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantUpdated(productVariant);
      })
    );
  }

  async delegateVariantDeletedOperations(productVariant: WebhookProductVariantFragment) {
    const { connections } = this.opts.context;

    const processors = this.mapConnectionsToProcessors(connections);

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantDeleted(productVariant);
      })
    );
  }

  async delegateProductUpdatedOperations(product: WebhookProductFragment) {
    const { connections } = this.opts.context;

    const processors = this.mapConnectionsToProcessors(connections);

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductUpdated(product);
      })
    );
  }
}
