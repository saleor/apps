import { BulkSyncProcessor } from "../bulk-sync/bulk-sync-processor";
import {
  BuilderIoProviderConfig,
  ContentfulProviderConfig,
  ProvidersConfig,
  StrapiProviderConfig,
} from "../configuration";
import { ContentfulBulkSyncProcessor } from "./contentful/contentful-bulk-sync-processor";
import { DatocmsBulkSyncProcessor } from "./datocms/datocms-bulk-sync-processor";
import { StrapiBulkSyncProcessor } from "./strapi/strapi-bulk-sync-processor";

import dynamic from "next/dynamic";
import { ComponentType, ReactElement } from "react";
import { Contentful } from "./contentful/contentful";
import { ContentfulWebhooksProcessor } from "./contentful/contentful-webhooks-processor";
import { Datocms } from "./datocms/datocms";
import { DatocmsWebhooksProcessor } from "./datocms/datocms-webhooks-processor";
import { CMS, CMSType } from "./providers-registry";
import { Strapi } from "./strapi/strapi";
import { StrapiWebhooksProcessor } from "./strapi/strapi-webhooks-processor";
import { DatocmsProviderConfig } from "../configuration/schemas/datocms-provider.schema";
import { BuilderIo } from "./builder.io/builder-io";
import { BuilderIoWebhooksProcessor } from "./builder.io/builder-io-webhooks-processor";
import { BuilderIoBulkSyncProcessor } from "./builder.io/builder-io-bulk-sync-processor";
import { PayloadCmsBulkSyncProcessor } from "./payloadcms/payloadcms-bulk-sync-processor";
import { PayloadCmsProviderConfig } from "../configuration/schemas/payloadcms-provider.schema";
import { PayloadCMS } from "./payloadcms/payloadcms";
import { PayloadCmsWebhooksProcessor } from "./payloadcms/payloadcms-webhooks-processor";

/**
 * Almost-single source of new providers. Every time app will need to resolve a provider, it will use on of these factories.
 * Frontend/UI must be dynamic, to render async chunk. Otherwise there is a circular dependency.
 */
export const ProvidersResolver = {
  createBulkSyncProcessor(config: ProvidersConfig.AnyFullShape): BulkSyncProcessor {
    switch (config.type) {
      case "contentful":
        return new ContentfulBulkSyncProcessor(config);
      case "datocms":
        return new DatocmsBulkSyncProcessor(config);
      case "strapi":
        return new StrapiBulkSyncProcessor(config);
      case "builder.io": {
        return new BuilderIoBulkSyncProcessor(config);
      }
      case "payloadcms": {
        return new PayloadCmsBulkSyncProcessor(config);
      }
    }
  },
  getProviderInputSchema(type: CMSType) {
    switch (type) {
      case "contentful":
        return ContentfulProviderConfig.Schema.Input;
      case "datocms":
        return DatocmsProviderConfig.Schema.Input;
      case "strapi":
        return StrapiProviderConfig.Schema.Input;
      case "builder.io":
        return BuilderIoProviderConfig.Schema.Input;
      case "payloadcms":
        return PayloadCmsProviderConfig.Schema.Input;
    }
  },
  getProviderSchema(type: CMSType) {
    switch (type) {
      case "contentful":
        return ContentfulProviderConfig.Schema.Full;
      case "datocms":
        return DatocmsProviderConfig.Schema.Full;
      case "strapi":
        return StrapiProviderConfig.Schema.Full;
      case "builder.io":
        return BuilderIoProviderConfig.Schema.Full;
      case "payloadcms":
        return PayloadCmsProviderConfig.Schema.Full;
    }
  },
  createProviderMeta(type: CMSType): CMS {
    switch (type) {
      case "contentful": {
        return Contentful;
      }
      case "datocms": {
        return Datocms;
      }
      case "strapi": {
        return Strapi;
      }
      case "builder.io": {
        return BuilderIo;
      }
      case "payloadcms": {
        return PayloadCMS;
      }
    }
  },
  createWebhooksProcessor(config: ProvidersConfig.AnyFullShape) {
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
      case "builder.io": {
        return new BuilderIoWebhooksProcessor(config);
      }
      case "payloadcms": {
        return new PayloadCmsWebhooksProcessor(config);
      }
    }
  },
  getEditProviderFormComponent: (
    type: CMSType,
  ): ComponentType<{
    configId: string;
  }> => {
    switch (type) {
      case "contentful": {
        return dynamic(() =>
          import("./contentful/contentful-config-form").then(
            (module) => module.ContentfulConfigForm.EditVariant,
          ),
        );
      }
      case "datocms": {
        return dynamic(() =>
          import("./datocms/datocms-config-form").then(
            (module) => module.DatoCMSConfigForm.EditVariant,
          ),
        );
      }
      case "strapi": {
        return dynamic(() =>
          import("./strapi/strapi-config-form").then(
            (module) => module.StrapiConfigForm.EditVariant,
          ),
        );
      }
      case "builder.io": {
        return dynamic(() =>
          import("./builder.io/builder-io-config-form").then(
            (module) => module.BuilderIoConfigForm.EditVariant,
          ),
        );
      }
      case "payloadcms": {
        return dynamic(() =>
          import("./payloadcms/payloadcms-config-form").then(
            (module) => module.PayloadCMSConfigForm.EditVariant,
          ),
        );
      }
    }
  },
  getAddNewProviderFormComponent: (type: CMSType): ComponentType<{}> => {
    switch (type) {
      case "contentful": {
        return dynamic(() =>
          import("./contentful/contentful-config-form").then(
            (module) => module.ContentfulConfigForm.AddVariant,
          ),
        );
      }
      case "datocms": {
        return dynamic(() =>
          import("./datocms/datocms-config-form").then(
            (module) => module.DatoCMSConfigForm.AddVariant,
          ),
        );
      }
      case "strapi": {
        return dynamic(() =>
          import("./strapi/strapi-config-form").then(
            (module) => module.StrapiConfigForm.AddVariant,
          ),
        );
      }
      case "builder.io": {
        return dynamic(() =>
          import("./builder.io/builder-io-config-form").then(
            (module) => module.BuilderIoConfigForm.AddVariant,
          ),
        );
      }
      case "payloadcms": {
        return dynamic(() =>
          import("./payloadcms/payloadcms-config-form").then(
            (module) => module.PayloadCMSConfigForm.AddVariant,
          ),
        );
      }
    }
  },
};
