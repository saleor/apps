import { ProvidersConfig } from "../configuration";
import { ContentfulWebhooksProcessor } from "../providers/contentful/contentful-webhooks-processor";
import { DatocmsWebhooksProcessor } from "../providers/datocms/datocms-webhooks-processor";
import { StrapiWebhooksProcessor } from "../providers/strapi/strapi-webhooks-processor";

export const WebhookProcessorFactory = {
  createFromConfig(config: ProvidersConfig.AnyFullShape) {
    switch (config.type) {
      case "contentful": {
        return new ContentfulWebhooksProcessor(config);
      }
      case "datocms": {
        return new DatocmsWebhooksProcessor(config);
      }
      case "strapi": {
        return new StrapiWebhooksProcessor(config);
      }
      default: {
        throw new Error("Failed to build webhook processor.");
      }
    }
  },
};
