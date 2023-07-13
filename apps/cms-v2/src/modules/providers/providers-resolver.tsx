import { BulkSyncProcessor } from "../bulk-sync/bulk-sync-processor";
import {
  ContentfulProviderConfig,
  DatocmsProviderConfig,
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

export interface CMSProviderMeta {
  type: string;
  displayName: string;
  logoUrl: string;
  description: string;
  formSideInfo?: ReactElement;
}

export const ProvidersResolver = {
  createBulkSyncProcessor(config: ProvidersConfig.AnyFullShape): BulkSyncProcessor {
    switch (config.type) {
      case "contentful":
        return new ContentfulBulkSyncProcessor(config);
      case "datocms":
        return new DatocmsBulkSyncProcessor(config);
      case "strapi":
        return new StrapiBulkSyncProcessor(config);
      default:
        throw new Error(`Unknown provider`);
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
      default: {
        throw new Error("Failed to build input schema");
      }
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
      default: {
        throw new Error("Failed to build provdier schema");
      }
    }
  },
  createProviderMeta(type: CMSType | string): CMS {
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
      default: {
        throw new Error("Unknown provider");
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
      default: {
        throw new Error("Failed to build webhook processor.");
      }
    }
  },
  getEditProviderFormComponent: (
    type: CMSType
  ): ComponentType<{
    configId: string;
  }> => {
    switch (type) {
      case "contentful": {
        return dynamic(() =>
          import("./contentful/contentful-config-form").then(
            (module) => module.ContentfulConfigForm.EditVariant
          )
        );
      }
      case "datocms": {
        return dynamic(() =>
          import("./datocms/datocms-config-form").then(
            (module) => module.DatoCMSConfigForm.EditVariant
          )
        );
      }
      case "strapi": {
        return dynamic(() =>
          import("./strapi/strapi-config-form").then(
            (module) => module.StrapiConfigForm.EditVariant
          )
        );
      }
      default: {
        throw new Error("Provider form not registered");
      }
    }
  },
  getAddNewProviderFormComponent: (type: CMSType): ComponentType<{}> => {
    switch (type) {
      case "contentful": {
        return dynamic(() =>
          import("./contentful/contentful-config-form").then(
            (module) => module.ContentfulConfigForm.AddVariant
          )
        );
      }
      case "datocms": {
        return dynamic(() =>
          import("./datocms/datocms-config-form").then(
            (module) => module.DatoCMSConfigForm.AddVariant
          )
        );
      }
      case "strapi": {
        return dynamic(() =>
          import("./strapi/strapi-config-form").then((module) => module.StrapiConfigForm.AddVariant)
        );
      }
      default: {
        throw new Error("Provider form not registered");
      }
    }
  },
};
