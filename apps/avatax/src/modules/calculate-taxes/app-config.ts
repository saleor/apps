import { MetadataItem } from "../../../generated/graphql";

export interface AppConfig {}

/**
 * Wrapping class for application config. Can be metadata, can be replaced with database
 *
 * TODO: There are other instances / implementations of app config, it needs unification
 */
export class MetadataAppConfig implements AppConfig {
  constructor(private metadata: MetadataItem[]) {}
}
