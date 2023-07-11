import { WebhookProductFragment, WebhookProductVariantFragment } from "../../../generated/graphql";
import { AnyProviderConfigSchemaType } from "../configuration";
import { ContentfulWebhooksProcessor } from "../contentful/contentful-webhooks-processor";
import { DatocmsWebhooksProcessor } from "../datocms/datocms-webhooks-processor";
import { WebhookContext } from "./create-webhook-config-context";

export class WebhooksProcessorsDelegator {
  constructor(
    private opts: {
      context: WebhookContext;
    }
  ) {}

  private createProcessorFromConfig(config: AnyProviderConfigSchemaType) {
    switch (config.type) {
      case "contentful": {
        return new ContentfulWebhooksProcessor(config);
      }
      case "datocms": {
        return new DatocmsWebhooksProcessor(config);
      }
    }
  }

  private extractChannelSlugsFromProductVariant(productVariant: WebhookProductVariantFragment) {
    return productVariant.channelListings?.map((c) => c.channel.slug);
  }

  async delegateVariantCreatedOperations(productVariant: WebhookProductVariantFragment) {
    const { connections, providers } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug)
    );

    const processors = connectionsToInclude.map((conn) => {
      const providerConfig = providers.find((p) => p.id === conn.providerId)!;

      return this.createProcessorFromConfig(providerConfig);
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantCreated(productVariant);
      })
    );
  }

  async delegateVariantUpdatedOperations(productVariant: WebhookProductVariantFragment) {
    const { connections, providers } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug)
    );

    const processors = connectionsToInclude.map((conn) => {
      const providerConfig = providers.find((p) => p.id === conn.providerId)!;

      return this.createProcessorFromConfig(providerConfig);
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantUpdated(productVariant);
      })
    );
  }

  async delegateVariantDeletedOperations(productVariant: WebhookProductVariantFragment) {
    const { connections, providers } = this.opts.context;

    const processors = connections.map((conn) => {
      const providerConfig = providers.find((p) => p.id === conn.providerId)!;

      return this.createProcessorFromConfig(providerConfig);
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductVariantDeleted(productVariant);
      })
    );
  }

  async delegateProductUpdatedOperations(product: WebhookProductFragment) {
    const { connections, providers } = this.opts.context;

    const processors = connections.map((conn) => {
      const providerConfig = providers.find((p) => p.id === conn.providerId)!;

      return this.createProcessorFromConfig(providerConfig);
    });

    return Promise.all(
      processors.map((processor) => {
        return processor.onProductUpdated(product);
      })
    );
  }
}
