import { AnyProviderConfigSchemaType } from "../configuration";
import { ContentfulWebhooksProcessor } from "../contentful/contentful-webhooks-processor";
import { DatocmsWebhooksProcessor } from "../datocms/datocms-webhooks-processor";

export const WebhookProcessorFactory = {
  createFromConfig(config: AnyProviderConfigSchemaType) {
    switch (config.type) {
      case "contentful": {
        return new ContentfulWebhooksProcessor(config);
      }
      case "datocms": {
        return new DatocmsWebhooksProcessor(config);
      }
    }
  },
};
