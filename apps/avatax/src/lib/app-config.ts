import { err, fromThrowable, ok, Result } from "neverthrow";

import { MetadataItem } from "../../generated/graphql";
import { BaseError } from "../error";
import { getAppConfig } from "../modules/app/get-app-config";
import { ChannelsConfig } from "../modules/channel-configuration/channel-config";
import {
  ProviderConnection,
  ProviderConnections,
} from "../modules/provider-connections/provider-connections";

type ConfigPerChannelErrors =
  | typeof AppConfig.InvalidChannelSlugError
  | typeof AppConfig.MissingConfigurationError;

type GetConfigForChannelResult = Result<
  {
    channelConfigInternalId: string;
    channelSlug: string;
    avataxConfig: ProviderConnection;
  },
  InstanceType<ConfigPerChannelErrors>
>;

type ParsedConfig = { channels: ChannelsConfig; providerConnections: ProviderConnections };

export interface IAppConfig {
  getConfigForChannelSlug(slug: string): GetConfigForChannelResult;
}

export class AppConfig implements IAppConfig {
  static ConfigMetadataParseError = BaseError.subclass("ConfigMetadataParseError");
  static InvalidChannelSlugError = BaseError.subclass("InvalidChannelSlugError", {});
  static MissingConfigurationError = BaseError.subclass("MissingConfigurationError", {});

  private constructor(
    private config: { channels: ChannelsConfig; providerConnections: ProviderConnections },
  ) {}

  getConfigForChannelSlug(slug: string): GetConfigForChannelResult {
    const channelConfig = this.config.channels?.find((channel) => channel.config.slug === slug);

    if (!channelConfig) {
      return err(
        new AppConfig.InvalidChannelSlugError("Channel slug not found in app configuration", {
          props: {
            channelSlug: slug,
          },
        }),
      );
    }

    const providerConnection = this.config.providerConnections.find(
      (connection) => connection.id === channelConfig.config.providerConnectionId,
    );

    if (!providerConnection) {
      return err(
        new AppConfig.MissingConfigurationError(
          `Could not find configuration for provided channel slug`,
          {
            props: {
              channelSlug: channelConfig.config.slug,
            },
          },
        ),
      );
    }

    return ok({
      channelConfigInternalId: channelConfig.id,
      channelSlug: channelConfig.config.slug,
      avataxConfig: providerConnection,
    });
  }

  static createFromParsedConfig(parsedConfig: ParsedConfig) {
    return new AppConfig(parsedConfig);
  }

  static createFromEncryptedMetadata(encryptedMetadata: MetadataItem[]) {
    /**
     * To make it testable, we need to refactor getAppConfig and allow to inject dependencies first
     */
    const appConfigResult = fromThrowable(getAppConfig, (err) => BaseError.normalize(err))(
      encryptedMetadata,
    );

    return appConfigResult
      .map((config) => {
        return new AppConfig(config);
      })
      .mapErr((error) => {
        return err(
          new this.ConfigMetadataParseError("Error parsing metadata into config", {
            props: {
              error,
            },
          }),
        );
      });
  }
}
