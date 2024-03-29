import { MetadataItem } from "../../../generated/graphql";
import { Result } from "neverthrow";
import { AppConfig } from "./app-config";

export interface IAppConfigFactory {
  fromDecryptedMetadata(): AppConfig;
}
