import { AvataxConnection } from "../../src/modules/avatax/avatax-connection-schema";
import { TaxJarConnection } from "../../src/modules/taxjar/taxjar-connection-schema";
import { ChannelV1, ChannelsV1 } from "./channels-config-schema-v1";
import {
  AvataxInstanceConfigV1,
  TaxJarInstanceConfigV1,
  TaxProvidersV1,
} from "./tax-providers-config-schema-v1";
import { TaxProvidersV2 } from "./tax-providers-config-schema-v2";

export class TaxProvidersV1ToV2Transformer {
  private findTaxProviderChannelConfig = (id: string, channelsConfig: ChannelsV1): ChannelV1 => {
    const channel = Object.values(channelsConfig).find(
      (channel) => channel.providerInstanceId === id
    );

    if (!channel) {
      throw new Error(`Channel with id ${id} not found`);
    }

    return channel;
  };

  private transformAvataxInstance = (
    instance: AvataxInstanceConfigV1,
    channel: ChannelV1
  ): AvataxConnection => {
    return {
      id: instance.id,
      provider: "avatax",
      config: {
        name: instance.config.name,
        address: {
          city: channel.address.city,
          country: channel.address.country,
          state: channel.address.state,
          street: channel.address.street,
          zip: channel.address.zip,
        },
        credentials: {
          password: instance.config.password,
          username: instance.config.username,
        },
        isAutocommit: instance.config.isAutocommit,
        isSandbox: instance.config.isSandbox,
        companyCode: instance.config.companyCode,
        shippingTaxCode: instance.config.shippingTaxCode,
      },
    };
  };

  private transformTaxJarInstance = (
    instance: TaxJarInstanceConfigV1,
    channel: ChannelV1
  ): TaxJarConnection => {
    return {
      id: instance.id,
      provider: "taxjar",
      config: {
        name: instance.config.name,
        address: {
          city: channel.address.city,
          country: channel.address.country,
          state: channel.address.state,
          street: channel.address.street,
          zip: channel.address.zip,
        },
        credentials: {
          apiKey: instance.config.apiKey,
        },
        isSandbox: instance.config.isSandbox,
      },
    };
  };

  transform = (taxProvidersConfig: TaxProvidersV1, channelsConfig: ChannelsV1): TaxProvidersV2 => {
    return taxProvidersConfig.map((instance) => {
      const channel = this.findTaxProviderChannelConfig(instance.id, channelsConfig);

      if (instance.provider === "avatax") {
        return this.transformAvataxInstance(instance, channel);
      }

      if (instance.provider === "taxjar") {
        return this.transformTaxJarInstance(instance, channel);
      }

      throw new Error(`Unknown provider `);
    });
  };
}
