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

import { ReactElement } from "react";
import { Contentful } from "../providers/contentful/contentful";
import { Datocms } from "../providers/datocms/datocms";
import { Strapi } from "../providers/strapi/strapi";
import { CMS, CMSType } from "./providers-registry";

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
};
