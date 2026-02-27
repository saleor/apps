import { createLogger } from "@/logger";
import { type CmsProblemReporter } from "@/modules/app-problems/cms-problem-reporter";

import {
  type WebhookProductFragment,
  type WebhookProductVariantFragment,
} from "../../../generated/graphql";
import { type ProvidersConfig } from "../configuration";
import { ProvidersResolver } from "../providers/providers-resolver";
import { type WebhookContext } from "./create-webhook-config-context";
import { type ProductWebhooksProcessor } from "./product-webhooks-processor";

type ProcessorFactory = (config: ProvidersConfig.AnyFullShape) => ProductWebhooksProcessor;

interface ProcessorWithConfig {
  processor: ProductWebhooksProcessor;
  providerConfig: ProvidersConfig.AnyFullShape;
}

const AUTH_ERROR_PATTERNS = [/401/, /403/, /unauthorized/i, /authentication/i, /access.token/i];

export function classifyError(
  error: unknown,
  providerType: string,
): "auth" | "builder-io-failure" | "field-mismatch" | "sync-failure" {
  const message = error instanceof Error ? error.message : String(error);

  if (AUTH_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return "auth";
  }

  if (providerType === "builder.io") {
    return "builder-io-failure";
  }

  if (providerType === "contentful" && (/422/.test(message) || /validation/i.test(message))) {
    return "field-mismatch";
  }

  return "sync-failure";
}

export class WebhooksProcessorsDelegator {
  private processorFactory: ProcessorFactory = ProvidersResolver.createWebhooksProcessor;
  private logger = createLogger("WebhooksProcessorsDelegator");

  constructor(
    private opts: {
      context: WebhookContext;
      problemReporter?: CmsProblemReporter;
      injectProcessorFactory?: ProcessorFactory;
    },
  ) {
    if (opts.injectProcessorFactory) {
      this.processorFactory = opts.injectProcessorFactory;
    }

    this.logger.trace("WebhooksProcessorsDelegator created");
  }

  private extractChannelSlugsFromProductVariant(productVariant: WebhookProductVariantFragment) {
    return productVariant.channelListings?.map((c) => c.channel.slug);
  }

  private mapConnectionsToProcessorsWithConfig(
    connections: WebhookContext["connections"],
  ): ProcessorWithConfig[] {
    return connections.map((conn) => {
      const providerConfig = this.opts.context.providers.find((p) => p.id === conn.providerId);

      if (!providerConfig) {
        this.logger.error("Cant resolve provider from connection", { connection: conn });

        throw new Error("Cant resolve provider from connection");
      }

      return {
        processor: this.processorFactory(providerConfig),
        providerConfig,
      };
    });
  }

  private async runWithProblemReporting(
    processorsWithConfig: ProcessorWithConfig[],
    operation: (processor: ProductWebhooksProcessor) => Promise<unknown>,
  ): Promise<void> {
    const results = await Promise.allSettled(
      processorsWithConfig.map(({ processor }) => operation(processor)),
    );

    const involvedProviderIds = new Set<string>();
    const errors: Error[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const { providerConfig } = processorsWithConfig[i];

      involvedProviderIds.add(providerConfig.id);

      if (result.status === "rejected") {
        const error =
          result.reason instanceof Error ? result.reason : new Error(String(result.reason));

        errors.push(error);

        if (this.opts.problemReporter) {
          await this.reportClassifiedError(error, providerConfig);
        }
      }
    }

    if (this.opts.problemReporter && errors.length === 0) {
      for (const providerId of involvedProviderIds) {
        await this.opts.problemReporter.clearProblemsForProvider(providerId);
      }
    }

    if (errors.length > 0) {
      throw errors[0];
    }
  }

  private async reportClassifiedError(
    error: Error,
    providerConfig: ProvidersConfig.AnyFullShape,
  ): Promise<void> {
    if (!this.opts.problemReporter) {
      return;
    }

    const classification = classifyError(error, providerConfig.type);

    this.logger.debug("Classified CMS error", {
      providerId: providerConfig.id,
      providerType: providerConfig.type,
      classification,
      errorMessage: error.message,
    });

    switch (classification) {
      case "auth":
        await this.opts.problemReporter.reportProviderAuthError(
          providerConfig.id,
          providerConfig.type,
          providerConfig.configName,
        );
        break;
      case "builder-io-failure":
        await this.opts.problemReporter.reportBuilderIoFailure(
          providerConfig.id,
          providerConfig.configName,
          error.message,
        );
        break;
      case "field-mismatch":
        await this.opts.problemReporter.reportFieldMismatch(
          providerConfig.id,
          providerConfig.configName,
          error.message,
        );
        break;
      case "sync-failure":
        await this.opts.problemReporter.reportSyncFailure(
          providerConfig.id,
          { type: providerConfig.type, configName: providerConfig.configName },
          error.message,
        );
        break;
    }
  }

  /**
   * Will work only if variant deleted. Variant will not be deleted if product is deleted.
   * Must subscribe on new event, PRODUCT_DELETED
   * https://github.com/saleor/saleor/issues/14579
   */
  async delegateVariantCreatedOperations(productVariant: WebhookProductVariantFragment) {
    this.logger.trace("delegateVariantCreatedOperations called");

    const { connections } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    this.logger.trace("Extracted a related channels", {
      relatedVariantChannels,
    });

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      this.logger.info("No related channels found for variant, skipping");

      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug),
    );

    if (connectionsToInclude.length === 0) {
      this.logger.info("No connections found, skipping");

      return;
    }

    this.logger.trace("Resolved a number of connections to include", connections);

    const processorsWithConfig = this.mapConnectionsToProcessorsWithConfig(connectionsToInclude);

    if (processorsWithConfig.length === 0) {
      this.logger.info("No processors found, skipping");

      return;
    }

    this.logger.trace("Resolved a number of processor to delegate to", {
      processorsLenght: processorsWithConfig.length,
    });

    await this.runWithProblemReporting(processorsWithConfig, (processor) => {
      this.logger.trace("Calling processor.onProductVariantCreated");

      return processor.onProductVariantCreated(productVariant);
    });
  }

  async delegateVariantUpdatedOperations(productVariant: WebhookProductVariantFragment) {
    this.logger.trace("delegateVariantUpdatedOperations called");

    const { connections } = this.opts.context;
    const relatedVariantChannels = this.extractChannelSlugsFromProductVariant(productVariant);

    this.logger.trace("Extracted a related channels", {
      relatedVariantChannels,
    });

    if (!relatedVariantChannels || relatedVariantChannels.length === 0) {
      this.logger.info("No related channels found for variant, skipping");

      return;
    }

    const connectionsToInclude = connections.filter((conn) =>
      relatedVariantChannels.includes(conn.channelSlug),
    );

    if (connectionsToInclude.length === 0) {
      this.logger.info("No connections found, skipping");

      return;
    }

    this.logger.trace("Resolved a number of connections to include", connections);

    const processorsWithConfig = this.mapConnectionsToProcessorsWithConfig(connectionsToInclude);

    if (processorsWithConfig.length === 0) {
      this.logger.info("No processors found, skipping");

      return;
    }

    this.logger.trace("Resolved a number of processor to delegate to", {
      processors: processorsWithConfig.length,
    });

    await this.runWithProblemReporting(processorsWithConfig, (processor) => {
      return processor.onProductVariantUpdated(productVariant);
    });
  }

  async delegateVariantDeletedOperations(productVariant: WebhookProductVariantFragment) {
    this.logger.trace("delegateVariantDeletedOperations called");

    const { connections } = this.opts.context;

    if (connections.length === 0) {
      this.logger.info("No connections found, skipping");

      return;
    }

    this.logger.trace("Resolved a number of connections to include", connections);

    const processorsWithConfig = this.mapConnectionsToProcessorsWithConfig(connections);

    if (processorsWithConfig.length === 0) {
      this.logger.info("No processors found, skipping");

      return;
    }

    this.logger.trace("Resolved a number of processor to delegate to", {
      processorsLenght: processorsWithConfig.length,
    });

    await this.runWithProblemReporting(processorsWithConfig, (processor) => {
      return processor.onProductVariantDeleted(productVariant);
    });
  }

  async delegateProductUpdatedOperations(product: WebhookProductFragment) {
    this.logger.trace("delegateProductUpdatedOperations called");

    const { connections } = this.opts.context;

    if (connections.length === 0) {
      this.logger.info("No connections found, skipping");

      return;
    }

    this.logger.trace("Resolved a number of connections to include", connections);

    const processorsWithConfig = this.mapConnectionsToProcessorsWithConfig(connections);

    if (processorsWithConfig.length === 0) {
      this.logger.info("No processors found, skipping");

      return;
    }

    this.logger.trace("Resolved a number of processor to delegate to", {
      processorsLenght: processorsWithConfig.length,
    });

    await this.runWithProblemReporting(processorsWithConfig, (processor) => {
      return processor.onProductUpdated(product);
    });
  }
}
