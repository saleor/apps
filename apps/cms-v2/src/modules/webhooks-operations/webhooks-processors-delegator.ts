import { WebhookProductFragment, WebhookProductVariantFragment } from "../../../generated/graphql";
import { ProvidersResolver } from "../providers/providers-resolver";
import { WebhookContext } from "./create-webhook-config-context";

export class WebhooksProcessorsDelegator {
  constructor(
    private opts: {
      context: WebhookContext;
    }
  ) {}

  private extractChannelSlugsFromProductVariant(productVariant: WebhookProductVariantFragment) {
    return productVariant.channelListings?.map((c) => c.channel.slug);
  }

  private mapConnectionsToProcessors(connections: WebhookContext["connections"]) {
    return connections.map((conn) => {
      const providerConfig = this.opts.context.providers.find((p) => p.id === conn.providerId)!;

      return ProvidersResolver.createWebhooksProcessor(providerConfig);
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
