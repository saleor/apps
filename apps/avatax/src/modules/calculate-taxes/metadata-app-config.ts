import { MetadataItem } from "../../../generated/graphql";
import { AppMetadataCache } from "../../lib/app-metadata-cache";
import { IMetadataDecryptor } from "./metadata-decryptor";

/**
 * Due to partial refactor, I didnt abstract AppConfig, but only reason for it to change will be introducing DB anyway (larger refactor)
 */
export interface IMetadataAppConfig {
  getRawItems(): MetadataItem[];
  getDecryptedItems(): MetadataItem[];
  hasMetadata(): boolean;
}

/**
 * Wrapping class for application config. Can be metadata, can be replaced with database
 *
 * TODO: There are other instances / implementations of app config, it needs unification
 */
export class MetadataAppConfig implements IMetadataAppConfig {
  constructor(
    private metadata: MetadataItem[],
    private metadataCache: AppMetadataCache,
    private decryptor: IMetadataDecryptor,
  ) {}

  setCache() {
    this.metadataCache.setMetadata(this.metadata);
  }

  getRawItems() {
    return this.metadata;
  }

  hasMetadata() {
    return this.metadata.length > 0;
  }

  /**
   * TODO: Add cache
   */
  getDecryptedItems() {
    return this.decryptor.decrypt(this.metadata);
  }

  // todo here we liekely need methods to get parsed config.

  // todo: likely we should separate -> app config with "repo" methods and factory that will create config from metadata
}
